-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 008 — Table profiles + auto-création à l'inscription
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Table profiles ──────────────────────────────────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  role       text not null default 'customer' check (role in ('customer', 'cashier', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_role on profiles(role);

alter table profiles enable row level security;

-- Politiques temporaires (seront remplacées par 009_secure_rls.sql)
create policy "Profiles visible par utilisateurs connectés" on profiles
  for select using (auth.role() = 'authenticated');

create policy "Profiles modifiable par utilisateurs connectés" on profiles
  for update using (auth.role() = 'authenticated');

create policy "Profiles insert own" on profiles
  for insert with check (auth.uid() = id);

-- ── Trigger : créer automatiquement un profil à chaque inscription ──────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Ajouter user_id aux commandes (lien avec le profil connecté) ────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'orders' and column_name = 'user_id'
  ) then
    alter table orders add column user_id uuid references auth.users(id);
    create index idx_orders_user_id on orders(user_id);
  end if;
end $$;

-- ── Créer les profils pour les utilisateurs existants ───────────────────────
insert into profiles (id, full_name, email)
select id, coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)), email
from auth.users
where id not in (select id from profiles)
on conflict (id) do nothing;
