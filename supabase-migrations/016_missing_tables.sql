-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 016 — Create the 4 missing tables
--
-- These tables have full front-end UI built and are referenced defensively
-- (IF EXISTS guards) in migrations 009 (RLS) and 014 (GRANTs), but no migration
-- ever actually CREATED them. PostgREST therefore returns 404 for:
--   • addresses     → /compte/adresses save fails
--   • wishlists     → wishlist DB sync fails silently (localStorage still works)
--   • reviews       → /admin/reviews "Error loading", product reviews can't post
--   • promo_codes   → /admin/promos empty + "Error creating promo code"
--
-- This migration creates all 4 with the SAME security model as the rest of the
-- schema: RLS enabled + policies using is_admin()/is_staff() + the table-level
-- GRANTs that PostgREST requires (the lesson from migration 014).
--
-- Idempotent: CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS before CREATE.
-- ══════════════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. ADDRESSES — customer saved delivery addresses
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.addresses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  type           text default 'home',
  label          text,
  full_name      text,
  address_line_1 text not null,
  address_line_2 text,
  city           text,
  postal_code    text,
  country        text default 'عُمان',
  phone          text,
  is_default     boolean default false,
  created_at     timestamptz default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

alter table public.addresses enable row level security;

drop policy if exists addresses_select_own on public.addresses;
drop policy if exists addresses_insert_own on public.addresses;
drop policy if exists addresses_update_own on public.addresses;
drop policy if exists addresses_delete_own on public.addresses;

create policy addresses_select_own on public.addresses
  for select using (user_id = auth.uid());
create policy addresses_insert_own on public.addresses
  for insert with check (user_id = auth.uid());
create policy addresses_update_own on public.addresses
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy addresses_delete_own on public.addresses
  for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.addresses to authenticated;


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. WISHLISTS — per-user favourites (localStorage is the front-end source of
--    truth; this table only adds cross-device sync)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create index if not exists wishlists_user_id_idx on public.wishlists (user_id);

alter table public.wishlists enable row level security;

drop policy if exists wishlists_select_own on public.wishlists;
drop policy if exists wishlists_insert_own on public.wishlists;
drop policy if exists wishlists_delete_own on public.wishlists;

create policy wishlists_select_own on public.wishlists
  for select using (user_id = auth.uid());
create policy wishlists_insert_own on public.wishlists
  for insert with check (user_id = auth.uid());
create policy wishlists_delete_own on public.wishlists
  for delete using (user_id = auth.uid());

grant select, insert, delete on public.wishlists to authenticated;


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. REVIEWS — product reviews with admin moderation
--    approved: NULL = pending, true = approved/published, false = rejected
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  display_name text,
  rating       int not null check (rating between 1 and 5),
  comment      text,
  approved     boolean,
  created_at   timestamptz default now()
);

create index if not exists reviews_product_id_idx on public.reviews (product_id);

alter table public.reviews enable row level security;

drop policy if exists reviews_public_read on public.reviews;
drop policy if exists reviews_staff_read  on public.reviews;
drop policy if exists reviews_insert_own  on public.reviews;
drop policy if exists reviews_update_admin on public.reviews;
drop policy if exists reviews_delete_admin on public.reviews;
-- legacy names from migration 009 (in case they ever got created)
drop policy if exists reviews_admin        on public.reviews;

-- Public sees everything that is NOT rejected (pending + approved); staff see all
create policy reviews_public_read on public.reviews
  for select using (approved is distinct from false);
create policy reviews_staff_read on public.reviews
  for select using (public.is_staff());
-- Logged-in users post their own review (lands as pending = NULL)
create policy reviews_insert_own on public.reviews
  for insert with check (user_id = auth.uid());
-- Admin moderates
create policy reviews_update_admin on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());
create policy reviews_delete_admin on public.reviews
  for delete using (public.is_admin());

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. PROMO_CODES — admin-managed discount codes
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.promo_codes (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  discount_percent int not null check (discount_percent between 1 and 100),
  active           boolean default true,
  expires_at       timestamptz,
  created_at       timestamptz default now()
);

alter table public.promo_codes enable row level security;

drop policy if exists promo_codes_public_read on public.promo_codes;
drop policy if exists promo_codes_admin       on public.promo_codes;

-- Codes are meant to be shared; anyone may read to validate at checkout
create policy promo_codes_public_read on public.promo_codes
  for select using (true);
-- Only admins create / toggle / delete
create policy promo_codes_admin on public.promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.promo_codes to anon, authenticated;
grant insert, update, delete on public.promo_codes to authenticated;
