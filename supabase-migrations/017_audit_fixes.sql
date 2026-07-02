-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 017 — Corrections post-audit (sécurité & fonctions cassées)
--
-- À EXÉCUTER dans Supabase → SQL Editor (après 001 → 016).
-- Idempotente (create or replace / drop if exists).
--
--   1. register_loyalty_member()  → débloque l'inscription fidélité publique
--                                    (l'insert direct + read-back est bloqué par RLS)
--   2. profiles : policy "admin peut modifier le rôle d'un autre user"
--                                    (sinon création caissier/admin impossible)
--   3. admin_get_recent_orders()  → ajoute le garde is_staff() (fuite PII corrigée)
--   4. create_order()             → recalcule les prix depuis la base (anti-spoofing)
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 1. Inscription fidélité publique via RPC security definer ───────────────────
-- loyalty_members: full_name, whatsapp, code (unique), points, visits_count.
-- Idempotent par numéro whatsapp : ré-inscription = renvoie la carte existante.

create or replace function register_loyalty_member(
  p_full_name text,
  p_phone text,
  p_whatsapp text
)
returns table(member_id uuid, card_number text, points int)
language plpgsql security definer
set search_path = public
as $$
declare
  v_wa       text;
  v_existing loyalty_members%rowtype;
  v_bonus    int;
  v_code     text;
  v_id       uuid;
begin
  v_wa := coalesce(nullif(btrim(p_whatsapp), ''), nullif(btrim(p_phone), ''));
  if v_wa is null then
    raise exception 'Phone/WhatsApp required';
  end if;
  if btrim(coalesce(p_full_name, '')) = '' then
    raise exception 'Name required';
  end if;

  -- Déjà inscrite avec ce numéro → renvoyer la carte existante (idempotent)
  select * into v_existing from loyalty_members where whatsapp = v_wa limit 1;
  if found then
    member_id := v_existing.id; card_number := v_existing.code; points := v_existing.points;
    return next;
    return;
  end if;

  select coalesce(signup_bonus, 5) into v_bonus from loyalty_config limit 1;
  v_bonus := coalesce(v_bonus, 5);

  -- Code de carte unique
  loop
    v_code := 'CHL' || lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from loyalty_members where code = v_code);
  end loop;

  insert into loyalty_members (full_name, whatsapp, code, points, visits_count)
  values (p_full_name, v_wa, v_code, v_bonus, 0)
  returning id into v_id;

  if v_bonus > 0 then
    insert into loyalty_transactions (member_id, points, type, source, note, created_by)
    values (v_id, v_bonus, 'bonus', 'signup', 'Welcome bonus', auth.uid());
  end if;

  member_id := v_id; card_number := v_code; points := v_bonus;
  return next;
end;
$$;

revoke all on function register_loyalty_member(text, text, text) from public;
grant execute on function register_loyalty_member(text, text, text) to anon, authenticated;


-- ── 2. Policy : un admin peut modifier le profil (rôle) d'un autre utilisateur ──
-- is_admin() est security definer (009) → pas de récursion RLS.

drop policy if exists "profiles_admin_update" on profiles;
create policy "profiles_admin_update" on profiles
  for update using (public.is_admin()) with check (public.is_admin());


-- ── 3. admin_get_recent_orders : ajouter le garde is_staff() (fuite PII) ────────

create or replace function admin_get_recent_orders(lim int default 5)
returns table(
  id uuid,
  client_name text,
  client_email text,
  total numeric,
  status text,
  created_at timestamptz
)
language plpgsql security definer stable
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Access denied';
  end if;

  return query
    select o.id, o.full_name, coalesce(p.email, ''), o.total, o.status, o.created_at
    from orders o
    left join profiles p on p.id = o.user_id
    order by o.created_at desc
    limit lim;
end;
$$;

revoke all on function admin_get_recent_orders(int) from public;
grant execute on function admin_get_recent_orders(int) to authenticated;


-- ── 4. create_order : recalcul des prix côté serveur (anti-spoofing) ────────────
-- Les prix unitaires sont relus depuis `products` (par product_id). Le sous-total
-- et les items stockés deviennent autoritatifs. Une remise éventuelle (code promo,
-- appliquée côté client) est PRÉSERVÉE mais bornée à [0, sous-total] → plus de
-- total négatif ni de prix d'article falsifié. (Fallback sur le prix fourni si le
-- product_id n'est pas un UUID résoluble — ex. données de démonstration locales.)

create or replace function create_order(
  p_full_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_notes text,
  p_items jsonb,
  p_total numeric,
  p_subtotal numeric default null,
  p_shipping_cost numeric default 0
)
returns table(id uuid)
language plpgsql security definer
set search_path = public
as $$
declare
  v_item      jsonb;
  v_items     jsonb := '[]'::jsonb;
  v_subtotal  numeric := 0;
  v_price     numeric;
  v_qty       int;
  v_pid       uuid;
  v_discount  numeric;
  v_total     numeric;
  v_order_id  uuid;
begin
  for v_item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_qty := greatest(coalesce((v_item->>'quantity')::int, 1), 1);

    begin
      v_pid := (v_item->>'product_id')::uuid;
    exception when others then
      v_pid := null;
    end;

    v_price := null;
    if v_pid is not null then
      select price into v_price from products where products.id = v_pid;
    end if;
    if v_price is null then
      v_price := coalesce((v_item->>'price')::numeric, 0);  -- robustesse / démo
    end if;

    v_subtotal := v_subtotal + (v_price * v_qty);
    v_items := v_items || jsonb_build_array(jsonb_set(v_item, '{price}', to_jsonb(v_price)));
  end loop;

  -- Remise revendiquée côté client (promo), bornée à [0, sous-total]
  v_discount := greatest(0, least(
    coalesce(p_subtotal, v_subtotal) + coalesce(p_shipping_cost, 0) - coalesce(p_total, 0),
    v_subtotal
  ));

  v_total := round(v_subtotal + coalesce(p_shipping_cost, 0) - v_discount, 3);
  if v_total < 0 then v_total := 0; end if;

  insert into orders (full_name, phone, address, city, notes, items, total, subtotal, shipping_cost, user_id)
  values (p_full_name, p_phone, p_address, p_city, p_notes, v_items, v_total, round(v_subtotal, 3), coalesce(p_shipping_cost, 0), auth.uid())
  returning orders.id into v_order_id;

  id := v_order_id;
  return next;
end;
$$;

revoke all on function create_order(text, text, text, text, text, jsonb, numeric, numeric, numeric) from public;
grant execute on function create_order(text, text, text, text, text, jsonb, numeric, numeric, numeric) to anon, authenticated;
