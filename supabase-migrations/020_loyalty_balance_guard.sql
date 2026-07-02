-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 020 — Garde solde ≥ 0 sur add_loyalty_points
-- Un échange (redeem) ne doit pas pouvoir rendre le solde de points négatif
-- (même si l'UI envoie un état périmé / requêtes concurrentes).
-- À exécuter dans Supabase → SQL Editor. Idempotent (create or replace).
-- ══════════════════════════════════════════════════════════════════════════════

create or replace function add_loyalty_points(
  p_member_id uuid,
  p_points int,
  p_type text,
  p_source text,
  p_amount_omr numeric default null,
  p_note text default null
)
returns int
language plpgsql security definer
set search_path = public
as $$
declare
  v_new_total int;
begin
  if not public.is_staff() then
    raise exception 'Access denied: staff only';
  end if;

  update loyalty_members
  set points = points + p_points
  where id = p_member_id
  returning points into v_new_total;

  if not found then
    raise exception 'Member not found';
  end if;

  -- Anti-solde négatif : le RAISE annule l'UPDATE (rollback dans la transaction).
  if v_new_total < 0 then
    raise exception 'Insufficient points balance';
  end if;

  insert into loyalty_transactions (member_id, points, type, source, amount_omr, note, created_by)
  values (p_member_id, p_points, p_type, p_source, p_amount_omr, p_note, auth.uid());

  return v_new_total;
end;
$$;

revoke all on function add_loyalty_points(uuid, int, text, text, numeric, text) from public;
grant execute on function add_loyalty_points(uuid, int, text, text, numeric, text) to authenticated;
