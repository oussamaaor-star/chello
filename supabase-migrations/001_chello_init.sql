-- ════════════════════════════════════════════════════════════════════════
-- Chello — schéma initial (produits, commandes, fidélité)
-- À exécuter dans Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Produits ───────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null check (category in ('dresses', 'abayas', 'bags', 'shoes', 'perfumes')),
  name text not null,
  description text default '',
  price numeric(10,2),
  images text[] default '{}',
  sizes text[] default '{}',
  featured boolean default false,
  active boolean default true,
  in_stock boolean default true,
  is_new boolean default false,
  is_bestseller boolean default false,
  sort_order int default 0,
  source_url text,
  created_at timestamptz default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_active on products(active);

alter table products enable row level security;

create policy "Produits visibles publiquement" on products
  for select using (true);

create policy "Produits modifiables par utilisateurs connectés" on products
  for all using (auth.role() = 'authenticated');

-- ── Commandes ──────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  address text not null,
  city text,
  notes text,
  items jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at timestamptz default now()
);

alter table orders enable row level security;

-- Pas d'INSERT/SELECT publics directs sur la table : la création d'une
-- commande par une cliente anonyme passe par les fonctions RPC ci-dessous,
-- qui ne renvoient que l'identifiant / le statut de SA propre commande.
create policy "Commandes visibles par utilisateurs connectés" on orders
  for select using (auth.role() = 'authenticated');

create policy "Commandes modifiables par utilisateurs connectés" on orders
  for update using (auth.role() = 'authenticated');

create or replace function create_order(
  p_full_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_notes text,
  p_items jsonb,
  p_total numeric
)
returns table(id uuid)
language sql security definer
set search_path = public
as $$
  insert into orders (full_name, phone, address, city, notes, items, total)
  values (p_full_name, p_phone, p_address, p_city, p_notes, p_items, p_total)
  returning orders.id;
$$;

revoke all on function create_order(text, text, text, text, text, jsonb, numeric) from public;
grant execute on function create_order(text, text, text, text, text, jsonb, numeric) to anon, authenticated;

-- Confirmation de commande publique : ne renvoie que la commande demandée
-- par son UUID (impossible à énumérer), jamais la liste complète.
create or replace function get_order_confirmation(p_order_id uuid)
returns table(id uuid, full_name text, total numeric, status text, items jsonb, created_at timestamptz)
language sql security definer
set search_path = public
as $$
  select id, full_name, total, status, items, created_at
  from orders
  where id = p_order_id
  limit 1;
$$;

revoke all on function get_order_confirmation(uuid) from public;
grant execute on function get_order_confirmation(uuid) to anon, authenticated;

-- Suivi de commande (recherche par téléphone + référence courte, 2 facteurs).
create or replace function find_order_by_phone_ref(p_phone text, p_ref text)
returns table(id uuid, full_name text, total numeric, status text, items jsonb, address text, city text, created_at timestamptz)
language sql security definer
set search_path = public
as $$
  select id, full_name, total, status, items, address, city, created_at
  from orders
  where phone ilike '%' || p_phone || '%'
    and upper(replace(id::text, '-', '')) like upper(p_ref) || '%'
  limit 1;
$$;

revoke all on function find_order_by_phone_ref(text, text) from public;
grant execute on function find_order_by_phone_ref(text, text) to anon, authenticated;

-- ── Membres du programme de fidélité ──────────────────────────────────
create table if not exists loyalty_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text not null,
  code text unique not null,
  visits_count int not null default 1,
  reward_claimed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_loyalty_code on loyalty_members(code);
create index if not exists idx_loyalty_whatsapp on loyalty_members(whatsapp);

alter table loyalty_members enable row level security;

create policy "Inscription fidélité publique" on loyalty_members
  for insert with check (true);

-- Pas de SELECT public sur la table (évite d'exposer noms + numéros de
-- toutes les clientes via la clé anon) : la lecture publique passe
-- uniquement par les fonctions RPC ci-dessous, qui ne renvoient qu'une
-- ligne précise.
create policy "Fidélité visible par utilisateurs connectés" on loyalty_members
  for select using (auth.role() = 'authenticated');

create policy "Fidélité modifiable par utilisateurs connectés" on loyalty_members
  for update using (auth.role() = 'authenticated');

create or replace function get_loyalty_card(p_code text)
returns table(full_name text, visits_count int, code text)
language sql security definer
set search_path = public
as $$
  select full_name, visits_count, code
  from loyalty_members
  where code = p_code
  limit 1;
$$;

create or replace function find_loyalty_card(p_whatsapp text)
returns table(code text)
language sql security definer
set search_path = public
as $$
  select code
  from loyalty_members
  where whatsapp ilike '%' || p_whatsapp || '%'
  limit 1;
$$;

revoke all on function get_loyalty_card(text) from public;
revoke all on function find_loyalty_card(text) from public;
grant execute on function get_loyalty_card(text) to anon, authenticated;
grant execute on function find_loyalty_card(text) to anon, authenticated;
