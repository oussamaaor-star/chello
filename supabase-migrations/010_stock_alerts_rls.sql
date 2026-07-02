-- Migration 010 — stock_alerts table with RLS

create table if not exists stock_alerts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  email       text,
  notified    boolean default false,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_stock_alerts_product on stock_alerts(product_id);
create index if not exists idx_stock_alerts_user    on stock_alerts(user_id);

alter table stock_alerts enable row level security;

-- Users can see their own alerts
create policy "stock_alerts_select_own" on stock_alerts
  for select using (auth.uid() = user_id);

-- Users can create their own alerts
create policy "stock_alerts_insert_own" on stock_alerts
  for insert with check (auth.uid() = user_id);

-- Users can delete their own alerts
create policy "stock_alerts_delete_own" on stock_alerts
  for delete using (auth.uid() = user_id);

-- Staff can view all alerts
create policy "stock_alerts_select_staff" on stock_alerts
  for select using (public.is_staff());

-- Staff can update alerts (e.g. mark as notified)
create policy "stock_alerts_update_staff" on stock_alerts
  for update using (public.is_staff());
