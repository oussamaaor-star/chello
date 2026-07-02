-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 013 — Backend Fixes (audit)
--
-- Fixes all critical backend issues found during audit:
--   1. orders.total precision: numeric(10,2) -> numeric(10,3) for OMR
--   2. Add missing columns to orders (subtotal, shipping_cost, payment_*)
--   3. Expand orders.status CHECK (add 'processing', 'shipped')
--   4. Create product_stock VIEW for CashierStock / AdminDashboard
--   5. Create admin_get_stats RPC
--   6. Create admin_get_recent_orders RPC
--   7. Secure add_loyalty_points RPC with is_staff() check
--   8. Update create_order RPC (set user_id, accept subtotal/shipping_cost)
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 1. Fix orders.total precision (OMR uses 3 decimals) ────────────────────

alter table orders
  alter column total type numeric(10,3);


-- ── 2. Add missing columns to orders ───────────────────────────────────────

alter table orders add column if not exists subtotal       numeric(10,3) default null;
alter table orders add column if not exists shipping_cost  numeric(10,3) not null default 0;

alter table orders add column if not exists payment_status text default 'pending';
alter table orders add column if not exists payment_method text default 'cod';

-- CHECK constraints (drop first to make idempotent)
alter table orders drop constraint if exists orders_payment_status_check;
alter table orders add  constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'refunded'));

alter table orders drop constraint if exists orders_payment_method_check;
alter table orders add  constraint orders_payment_method_check
  check (payment_method in ('cod', 'cash', 'card', 'transfer'));


-- ── 3. Expand orders.status CHECK ──────────────────────────────────────────

alter table orders drop constraint if exists orders_status_check;
alter table orders add  constraint orders_status_check
  check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));


-- ── 4. Create product_stock VIEW ───────────────────────────────────────────

create or replace view product_stock as
select
  id as product_id,
  case
    when in_stock = false then 0
    else null  -- null means "not tracked"
  end as stock
from products
where active = true;


-- ── 5. RPC: admin_get_stats ────────────────────────────────────────────────

create or replace function admin_get_stats()
returns json
language plpgsql security definer stable
set search_path = public
as $$
declare
  result json;
begin
  if not public.is_staff() then
    raise exception 'Access denied';
  end if;

  select json_build_object(
    'total_orders',    (select count(*)              from orders),
    'total_revenue',   (select coalesce(sum(total), 0) from orders where status not in ('cancelled')),
    'pending_orders',  (select count(*)              from orders where status = 'pending'),
    'delivered_orders',(select count(*)              from orders where status = 'delivered'),
    'avg_order_value', (select coalesce(avg(total), 0) from orders where status not in ('cancelled')),
    'total_users',     (select count(*)              from profiles)
  ) into result;

  return result;
end;
$$;

revoke all on function admin_get_stats() from public;
grant execute on function admin_get_stats() to authenticated;


-- ── 6. RPC: admin_get_recent_orders ────────────────────────────────────────

create or replace function admin_get_recent_orders(lim int default 5)
returns table(
  id uuid,
  client_name text,
  client_email text,
  total numeric,
  status text,
  created_at timestamptz
)
language sql security definer stable
set search_path = public
as $$
  select
    o.id,
    o.full_name  as client_name,
    coalesce(p.email, '') as client_email,
    o.total,
    o.status,
    o.created_at
  from orders o
  left join profiles p on p.id = o.user_id
  order by o.created_at desc
  limit lim;
$$;

revoke all on function admin_get_recent_orders(int) from public;
grant execute on function admin_get_recent_orders(int) to authenticated;


-- ── 7. Secure add_loyalty_points (add is_staff() guard) ────────────────────

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
  -- Security: only staff can add/remove points
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

  insert into loyalty_transactions (member_id, points, type, source, amount_omr, note, created_by)
  values (p_member_id, p_points, p_type, p_source, p_amount_omr, p_note, auth.uid());

  return v_new_total;
end;
$$;

-- Permissions unchanged (already restricted to authenticated in 012)


-- ── 8. Update create_order RPC (set user_id, accept subtotal/shipping) ─────

-- Drop the old 7-param signature to avoid overload ambiguity
drop function if exists create_order(text, text, text, text, text, jsonb, numeric);

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
language sql security definer
set search_path = public
as $$
  insert into orders (full_name, phone, address, city, notes, items, total, subtotal, shipping_cost, user_id)
  values (p_full_name, p_phone, p_address, p_city, p_notes, p_items, p_total, p_subtotal, p_shipping_cost, auth.uid())
  returning orders.id;
$$;

revoke all on function create_order(text, text, text, text, text, jsonb, numeric, numeric, numeric) from public;
grant execute on function create_order(text, text, text, text, text, jsonb, numeric, numeric, numeric) to anon, authenticated;
