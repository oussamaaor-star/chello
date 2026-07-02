-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 014 — Fix missing table-level GRANTs for ALL tables
--
-- CRITICAL: All tables were created via SQL migrations without explicit GRANT
-- statements. In Supabase, PostgREST requires table-level GRANTs to the
-- "authenticated" and "anon" PostgreSQL roles BEFORE RLS policies can apply.
--
-- Without these GRANTs:
--   - Every direct table query returns "permission denied for table X"
--   - Products catalog silently falls back to products.json (no DB data)
--   - loadProfile() fails → role=null → admin/cashier routes inaccessible
--   - Orders, loyalty, reviews all fail for authenticated users
--
-- RPC functions with SECURITY DEFINER still work (they bypass GRANT checks),
-- which is why create_order, get_order_confirmation, etc. still function.
-- ══════════════════════════════════════════════════════════════════════════════


-- ── Products ────────────────────────────────────────────────────────────────
-- Public read; admin writes are enforced via RLS (009)
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;


-- ── Orders ──────────────────────────────────────────────────────────────────
-- Staff read all, users read own (via RLS 009); staff can update
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;  -- anonymous checkout via RPC


-- ── Profiles ────────────────────────────────────────────────────────────────
-- Users read/update own, admins read all (via RLS 009)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;


-- ── Loyalty members ─────────────────────────────────────────────────────────
-- Public insert (signup); staff read/update (via RLS 009)
GRANT INSERT ON public.loyalty_members TO anon, authenticated;
GRANT SELECT, UPDATE ON public.loyalty_members TO authenticated;


-- ── Loyalty config (012) ────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loyalty_config') THEN
    EXECUTE 'GRANT SELECT ON public.loyalty_config TO anon, authenticated';
    EXECUTE 'GRANT INSERT, UPDATE ON public.loyalty_config TO authenticated';
  END IF;
END $$;


-- ── Loyalty transactions (012) ──────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loyalty_transactions') THEN
    EXECUTE 'GRANT SELECT, INSERT ON public.loyalty_transactions TO authenticated';
  END IF;
END $$;


-- ── Promo codes ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'promo_codes') THEN
    EXECUTE 'GRANT SELECT ON public.promo_codes TO anon, authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated';
  END IF;
END $$;


-- ── Reviews ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    EXECUTE 'GRANT SELECT ON public.reviews TO anon, authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated';
  END IF;
END $$;


-- ── Wishlists ───────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wishlists') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated';
  END IF;
END $$;


-- ── Addresses ───────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'addresses') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated';
  END IF;
END $$;


-- ── Stock alerts ────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stock_alerts') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_alerts TO authenticated';
  END IF;
END $$;


-- ── Product stock VIEW (013) ────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'product_stock') THEN
    EXECUTE 'GRANT SELECT ON public.product_stock TO anon, authenticated';
  END IF;
END $$;
