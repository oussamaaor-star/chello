-- ══════════════════════════════════════════════════════════════════════════════
-- 021 — Note moyenne des produits remontée au catalogue
--
-- Ajoute products.avg_rating / products.review_count, maintenus automatiquement
-- par trigger sur la table reviews (seuls les avis APPROUVÉS comptent).
-- Le front (normalizeDbProduct) expose ces champs → ProductCard affiche les ★.
-- Rétro-compatible : tant que cette migration n'est pas exécutée, le front
-- reçoit simplement null et n'affiche rien (aucun crash).
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.products
  add column if not exists avg_rating   numeric(3,2),
  add column if not exists review_count int not null default 0;

-- Recalcule la note d'UN produit à partir de ses avis approuvés.
-- security definer : le trigger doit pouvoir mettre à jour products même quand
-- l'acteur est un simple client (insertion d'avis) sans droit d'update produits.
create or replace function public.refresh_product_rating(pid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products p set
    avg_rating = (
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.product_id = pid and r.approved is true
    ),
    review_count = (
      select count(*)
      from public.reviews r
      where r.product_id = pid and r.approved is true
    )
  where p.id = pid;
$$;

create or replace function public.trg_reviews_refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_product_rating(coalesce(new.product_id, old.product_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.trg_reviews_refresh_rating();

-- Backfill : recalcule tous les produits ayant au moins un avis.
select public.refresh_product_rating(pr.product_id)
from (select distinct product_id from public.reviews) pr;
