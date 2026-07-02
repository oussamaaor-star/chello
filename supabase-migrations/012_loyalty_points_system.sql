-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 012 — Loyalty Points System
-- Replaces stamp-based system with configurable points
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Configuration table (singleton — one row) ────────────────────────────

create table if not exists loyalty_config (
  id uuid primary key default gen_random_uuid(),
  omr_per_point numeric(10,3) not null default 30.000,
  points_per_threshold int not null default 1,
  signup_bonus int not null default 5,
  reward_tiers jsonb not null default '[{"points":10,"discount_omr":5},{"points":20,"discount_omr":15}]'::jsonb,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

alter table loyalty_config enable row level security;

create policy "loyalty_config_read_staff" on loyalty_config
  for select using (true);

create policy "loyalty_config_write_admin" on loyalty_config
  for all using (public.is_admin())
  with check (public.is_admin());

insert into loyalty_config (omr_per_point, points_per_threshold, signup_bonus, reward_tiers)
values (30.000, 1, 5, '[{"points":10,"discount_omr":5},{"points":20,"discount_omr":15}]'::jsonb)
on conflict do nothing;

-- ── 2. Add points column to loyalty_members ─────────────────────────────────

alter table loyalty_members add column if not exists points int not null default 0;

-- ── 3. Transactions table ───────────────────────────────────────────────────

create table if not exists loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references loyalty_members(id) on delete cascade,
  points int not null,
  type text not null check (type in ('earned', 'redeemed', 'bonus', 'adjustment')),
  source text not null check (source in ('purchase', 'signup', 'cashier', 'admin', 'online')),
  amount_omr numeric(10,3),
  note text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_loyalty_tx_member on loyalty_transactions(member_id);
create index if not exists idx_loyalty_tx_created on loyalty_transactions(created_at desc);

alter table loyalty_transactions enable row level security;

create policy "loyalty_tx_read_staff" on loyalty_transactions
  for select using (public.is_staff());

create policy "loyalty_tx_insert_staff" on loyalty_transactions
  for insert with check (public.is_staff());

create policy "loyalty_tx_admin" on loyalty_transactions
  for all using (public.is_admin())
  with check (public.is_admin());

-- ── 4. RPC: public card lookup now includes points ──────────────────────────

create or replace function get_loyalty_card(p_code text)
returns table(full_name text, visits_count int, code text, points int)
language sql security definer
set search_path = public
as $$
  select full_name, visits_count, code, points
  from loyalty_members
  where loyalty_members.code = p_code
  limit 1;
$$;

-- ── 5. RPC: get loyalty config (public read) ────────────────────────────────

create or replace function get_loyalty_config()
returns table(
  omr_per_point numeric,
  points_per_threshold int,
  signup_bonus int,
  reward_tiers jsonb
)
language sql security definer stable
set search_path = public
as $$
  select omr_per_point, points_per_threshold, signup_bonus, reward_tiers
  from loyalty_config
  limit 1;
$$;

revoke all on function get_loyalty_config() from public;
grant execute on function get_loyalty_config() to anon, authenticated;

-- ── 6. RPC: add points (staff only) ─────────────────────────────────────────

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
  update loyalty_members
  set points = points + p_points
  where id = p_member_id
  returning points into v_new_total;

  if not found then
    raise exception 'Member not found';
  end if;

  insert into loyalty_transactions (member_id, points, type, source, amount_omr, note, created_by)
  values (p_member_id, p_points, p_type, p_source, p_amount_omr, p_note, auth.uid());

  return v_new_total;
end;
$$;

revoke all on function add_loyalty_points(uuid, int, text, text, numeric, text) from public;
grant execute on function add_loyalty_points(uuid, int, text, text, numeric, text) to authenticated;

-- ── 7. RPC: get member transactions (public by code) ────────────────────────

create or replace function get_loyalty_history(p_code text)
returns table(
  points int,
  type text,
  source text,
  amount_omr numeric,
  note text,
  created_at timestamptz
)
language sql security definer stable
set search_path = public
as $$
  select t.points, t.type, t.source, t.amount_omr, t.note, t.created_at
  from loyalty_transactions t
  join loyalty_members m on m.id = t.member_id
  where m.code = p_code
  order by t.created_at desc
  limit 50;
$$;

revoke all on function get_loyalty_history(text) from public;
grant execute on function get_loyalty_history(text) to anon, authenticated;
