-- ══════════════════════════════════════════════════════════════════════════════
-- 022 — Bandeau d'annonces de la home géré depuis l'admin
--
-- Le marquee défilant de la page d'accueil lit cette table (messages AR/EN,
-- activables et ordonnables). L'admin les gère dans Admin → Promos sans
-- toucher au code. Fallback front : si la table est absente/vide par erreur,
-- HomeMarquee garde ses messages codés en dur.
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  text_ar    text not null,
  text_en    text not null,
  active     boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

alter table public.announcements enable row level security;

drop policy if exists announcements_public_read on public.announcements;
drop policy if exists announcements_admin_all   on public.announcements;

-- Public : uniquement les annonces actives ; admin : tout (pour la gestion).
create policy announcements_public_read on public.announcements
  for select using (active = true or public.is_admin());
create policy announcements_admin_all on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;

-- Seed : reprend les 6 messages actuels du bandeau (uniquement si table vide).
insert into public.announcements (text_ar, text_en, sort_order)
select v.text_ar, v.text_en, v.sort_order
from (values
  ('خصم ١٠٪ على أول طلب',                '10% off your first order',            1),
  ('تشكيلة ٢٠٢٦ الجديدة',                 'New 2026 collection',                 2),
  ('توصيل مجاني للطلبات فوق ٣٠ ر.ع',      'Free delivery over 30 OMR',           3),
  ('عبايات · فساتين · شنط · عطور',        'Abayas · Dresses · Bags · Perfumes',  4),
  ('وصل حديثاً كل أسبوع',                 'New arrivals every week',             5),
  ('تسوّقي عبر واتساب بسهولة',            'Easy ordering on WhatsApp',           6)
) as v(text_ar, text_en, sort_order)
where not exists (select 1 from public.announcements);
