-- Migration 011 — Allow authenticated users to insert orders (for checkout)
-- and allow staff to insert orders (for POS)

-- Customers can create their own orders
create policy "orders_insert_authenticated" on orders
  for insert with check (auth.role() = 'authenticated');

-- Staff can insert orders on behalf of customers (POS)
create policy "orders_insert_staff" on orders
  for insert with check (public.is_staff());
