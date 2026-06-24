import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { GlowCard } from '../ui/GlowCard';
import { TiltEffect } from '../ui/TiltEffect';
import { useCatalogue } from '../../hooks/useCatalogue';
import { useLanguage } from '../../contexts/LanguageContext';

const MAX = 4;

export function SimilarProducts({ product }) {
  const { products } = useCatalogue();
  const { t } = useLanguage();

  const { similar, isFallback } = useMemo(() => {
    const others = products.filter((p) => p.id !== product.id);

    // ── 1. Same category ──────────────────────────────────────────────
    const byCategory = others.filter(
      (p) => p.categorySlug === product.categorySlug
    );

    // ── 2. Same brand (not already in category pool) ──────────────────
    const categoryIds = new Set(byCategory.map((p) => p.id));
    const byBrand = others.filter(
      (p) => p.brand === product.brand && !categoryIds.has(p.id)
    );

    // ── 3. Merge: category first, then brand ──────────────────────────
    const merged = [...byCategory, ...byBrand];

    if (merged.length > 0) {
      // Sort by popularity (reviewCount), then rating — null-safe
      const sorted = merged.sort((a, b) => {
        const rc = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        if (rc !== 0) return rc;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
      return { similar: sorted.slice(0, MAX), isFallback: false };
    }

    // ── 4. Fallback: most popular across all products ─────────────────
    const popular = others
      .sort((a, b) => {
        const rc = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        if (rc !== 0) return rc;
        return (b.rating ?? 0) - (a.rating ?? 0);
      })
      .slice(0, MAX);
    return { similar: popular, isFallback: true };
  }, [products, product]);

  if (similar.length === 0) return null;

  const subtitle = isFallback ? 'Tendances' : 'Sélection';
  const linkTo   = isFallback ? '/catalogue' : `/categorie/${product.categorySlug}`;

  return (
    <section className="mt-12 pt-10 border-t border-ink/10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs text-ink-soft uppercase tracking-widest font-medium mb-1">
            {subtitle}
          </p>
          <h2 className="text-xl sm:text-2xl font-serif text-ink">{t('similTitle')}</h2>
        </div>
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink transition-colors pb-0.5"
        >
          {t('similVoir')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mobile : carousel scrollable (~2,5 cartes) ; desktop : grille 4 colonnes */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {similar.map((p) => (
          <div key={p.id} className="snap-start flex-shrink-0 w-[44%] lg:w-auto">
            <TiltEffect>
              <GlowCard className="h-full">
                <ProductCard product={p} />
              </GlowCard>
            </TiltEffect>
          </div>
        ))}
      </div>
    </section>
  );
}
