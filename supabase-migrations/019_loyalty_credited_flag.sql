-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 019 — Flag anti double-crédit des points fidélité
-- Une commande en ligne re-passée en "delivered" ne doit pas re-créditer les points.
-- À exécuter dans Supabase → SQL Editor. Idempotent.
-- ══════════════════════════════════════════════════════════════════════════════

alter table orders add column if not exists loyalty_credited boolean not null default false;
