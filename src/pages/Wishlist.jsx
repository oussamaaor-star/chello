import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';

import { ProductGrid } from '../components/product/ProductGrid';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useCartDrawer } from '../hooks/useCartDrawer';

// ─── Empty state ──────────────────────────────────────────────────────────────

function WishlistEmpty() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-cream-deep rounded-3xl border border-dashed border-ink/15">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
          <Heart className="w-9 h-9 text-gold" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-gold" />
        </div>
      </div>

      <h2 className="text-2xl font-serif italic text-ink mb-2">{t('wishlistVide')}</h2>
      <p className="text-ink-soft mb-8 max-w-sm leading-relaxed text-sm">
        {t('wishlistAjouter')}
      </p>

      <Link
        to="/catalogue"
        className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold transition-colors shadow-sm"
      >
        <ShoppingBag className="w-4 h-4" />
        {t('navDecouvrir')}
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Wishlist() {
  useSEO(SEO_PRESETS.wishlist);
  const { t } = useLanguage();
  const { items, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { open: openCart } = useCartDrawer();

  const count = items.length;

  const handleAddAllToCart = () => {
    items.forEach((product) => {
      const size = product.sizes?.[0] ?? null;
      addToCart(product, size);
    });
    openCart();
  };

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden bg-cream-deep py-14 lg:py-18">
        {/* Decorative blurs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-ink-soft mb-5 uppercase tracking-wider">
            <Link to="/" className="hover:text-ink transition-colors">{t('breadcrumbAccueil')}</Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="text-gold">{t('wishlistTitle')}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            {/* Title + description */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-5 h-5 text-gold fill-gold" />
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-deep">
                  {t('navFavoris')}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif italic text-ink mb-3 tracking-tight">
                {t('wishlistTitle')}
              </h1>
              {count === 0 && (
                <p className="text-ink-soft text-sm leading-relaxed max-w-md">
                  {t('wishlistVide')}
                </p>
              )}
            </div>

            {/* Stats + actions */}
            {count > 0 && (
              <div className="flex flex-col sm:items-end gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-center px-4 py-2 bg-ink/5 rounded-xl">
                    <div className="text-2xl font-serif text-gold leading-none">{count}</div>
                    <div className="text-xs text-ink-soft uppercase tracking-wider mt-1">
                      {t('searchResultats')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddAllToCart}
                    className="flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded-full text-xs font-semibold hover:bg-ink/90 transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {t('addToCart')}
                  </button>
                  <button
                    onClick={clearWishlist}
                    className="flex items-center gap-2 px-4 py-2 bg-ink/5 text-ink-soft rounded-full text-xs font-medium hover:bg-ink/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('wishlistViderTout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {count === 0 ? (
          <WishlistEmpty />
        ) : (
          <>
            {/* Info bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-ink-soft">
                <span className="font-semibold text-ink">{count}</span>{' '}
                {t('searchResultats')}
              </p>
              <Link
                to="/catalogue"
                className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink transition-colors"
              >
                {t('navCatalogue')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Product grid — reuses ProductCard with wishlist toggle already built in */}
            <ProductGrid products={items} />

            {/* Bottom CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-ink/10">
              <Link
                to="/catalogue"
                className="flex items-center gap-2 px-6 py-3 border border-ink/20 text-ink rounded-full text-sm font-semibold hover:bg-cream-deep transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {t('cartContinuer')}
              </Link>
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-medium transition-colors"
              >
                <Heart className="w-4 h-4" />
                {t('addToCart')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
