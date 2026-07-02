-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 009 — Secure RLS policies (admin-only writes)
-- ══════════════════════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor to replace the overly-permissive
-- "authenticated" policies with proper role-based checks.

-- Helper: reusable function to check if the current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from profiles where id = auth.uid()),
    false
  );
$$;

-- Helper: check if current user is admin or cashier
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'cashier') from profiles where id = auth.uid()),
    false
  );
$$;

-- ── Products ─────────────────────────────────────────────────────────────────
-- Keep public SELECT, restrict writes to admin only
drop policy if exists "Produits modifiables par utilisateurs connectés" on products;

create policy "Produits modifiables par admins" on products
  for all using (public.is_admin())
  with check (public.is_admin());

-- ── Orders ───────────────────────────────────────────────────────────────────
-- SELECT: admin/cashier see all, regular users see only their own
drop policy if exists "Commandes visibles par utilisateurs connectés" on orders;
drop policy if exists "Commandes modifiables par utilisateurs connectés" on orders;

create policy "Commandes visibles par staff" on orders
  for select using (
    public.is_staff()
    or (auth.uid() is not null and user_id = auth.uid())
  );

create policy "Commandes modifiables par staff" on orders
  for update using (public.is_staff());

-- ── Loyalty members ──────────────────────────────────────────────────────────
-- Keep public INSERT, restrict SELECT/UPDATE to staff
drop policy if exists "Fidélité visible par utilisateurs connectés" on loyalty_members;
drop policy if exists "Fidélité modifiable par utilisateurs connectés" on loyalty_members;

create policy "Fidélité visible par staff" on loyalty_members
  for select using (public.is_staff());

create policy "Fidélité modifiable par staff" on loyalty_members
  for update using (public.is_staff());

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- Users can read/update their own profile (except role), only admins can change role
drop policy if exists "Profiles visible par utilisateurs connectés" on profiles;
drop policy if exists "Profiles modifiable par utilisateurs connectés" on profiles;

create policy "Profiles read own or admin" on profiles
  for select using (
    auth.uid() = id or public.is_admin()
  );

create policy "Profiles update own" on profiles
  for update using (auth.uid() = id)
  with check (
    -- prevent non-admins from changing their own role
    auth.uid() = id
    and (
      public.is_admin()
      or role = (select role from profiles where id = auth.uid())
    )
  );

-- ── Promo codes ──────────────────────────────────────────────────────────────
-- If table exists, restrict to admin
do $$
begin
  if exists (select 1 from pg_tables where tablename = 'promo_codes') then
    execute 'drop policy if exists "promo_codes_all" on promo_codes';
    execute 'create policy "promo_codes_read" on promo_codes for select using (true)';
    execute 'create policy "promo_codes_admin" on promo_codes for all using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

-- ── Reviews ──────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_tables where tablename = 'reviews') then
    execute 'drop policy if exists "reviews_insert" on reviews';
    execute 'drop policy if exists "reviews_all" on reviews';
    execute 'create policy "reviews_read" on reviews for select using (true)';
    execute 'create policy "reviews_insert_auth" on reviews for insert with check (auth.role() = ''authenticated'')';
    execute 'create policy "reviews_admin" on reviews for update using (public.is_admin())';
    execute 'create policy "reviews_delete_admin" on reviews for delete using (public.is_admin())';
  end if;
end $$;

-- ── Wishlists ────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_tables where tablename = 'wishlists') then
    execute 'drop policy if exists "wishlists_all" on wishlists';
    execute 'create policy "wishlists_own" on wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

-- ── Addresses ────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_tables where tablename = 'addresses') then
    execute 'drop policy if exists "addresses_all" on addresses';
    execute 'create policy "addresses_own" on addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;
