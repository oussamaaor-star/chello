-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 018 — Correctif create_order (bug introduit en 017)
-- « column reference "id" is ambiguous » : on qualifie products.id.
-- À exécuter dans Supabase → SQL Editor. Idempotent (create or replace).
-- ══════════════════════════════════════════════════════════════════════════════

create or replace function create_order(
  p_full_name text, p_phone text, p_address text, p_city text, p_notes text,
  p_items jsonb, p_total numeric, p_subtotal numeric default null, p_shipping_cost numeric default 0
)
returns table(id uuid)
language plpgsql security definer
set search_path = public
as $$
declare
  v_item jsonb; v_items jsonb := '[]'::jsonb; v_subtotal numeric := 0;
  v_price numeric; v_qty int; v_pid uuid; v_discount numeric; v_total numeric; v_order_id uuid;
begin
  for v_item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_qty := greatest(coalesce((v_item->>'quantity')::int, 1), 1);
    begin v_pid := (v_item->>'product_id')::uuid; exception when others then v_pid := null; end;
    v_price := null;
    if v_pid is not null then
      select price into v_price from products where products.id = v_pid;
    end if;
    if v_price is null then v_price := coalesce((v_item->>'price')::numeric, 0); end if;
    v_subtotal := v_subtotal + (v_price * v_qty);
    v_items := v_items || jsonb_build_array(jsonb_set(v_item, '{price}', to_jsonb(v_price)));
  end loop;

  v_discount := greatest(0, least(
    coalesce(p_subtotal, v_subtotal) + coalesce(p_shipping_cost, 0) - coalesce(p_total, 0), v_subtotal));
  v_total := round(v_subtotal + coalesce(p_shipping_cost, 0) - v_discount, 3);
  if v_total < 0 then v_total := 0; end if;

  insert into orders (full_name, phone, address, city, notes, items, total, subtotal, shipping_cost, user_id)
  values (p_full_name, p_phone, p_address, p_city, p_notes, v_items, v_total, round(v_subtotal, 3), coalesce(p_shipping_cost, 0), auth.uid())
  returning orders.id into v_order_id;

  id := v_order_id; return next;
end;
$$;

revoke all on function create_order(text, text, text, text, text, jsonb, numeric, numeric, numeric) from public;
grant execute on function create_order(text, text, text, text, text, jsonb, numeric, numeric, numeric) to anon, authenticated;
