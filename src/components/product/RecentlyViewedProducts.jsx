import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { GlowCard } from '../ui/GlowCard';
import { TiltEffect } from '../ui/TiltEffect';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useCatalogue } from '../../hooks/useCatalogue';
import { useLanguage } from '../../contexts/LanguageContext';

const MAX = 4;

export function RecentlyViewedProducts({ currentProductId }) {
  const { items: recentIds } = useRecentlyViewed();
  const { products } = useCatalogue();
  const { t } = useLanguage();

  const recent = useMemo(() => {
    return recentIds
      .filter((r) => r.id !== currentProductId)
      .map((r) => products.find((p) => p.id === r.id))
      .filter(Boolean)
      .slice(0, MAX);
  }, [recentIds, products, currentProductId]);

  if (recent.length === 0) return null;

  return (
    <section className="mt-12 pt-10 border-t border-ink/10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs text-ink-soft uppercase tracking-widest font-medium mb-1">
            {t('recentEyebrow')}
          </p>
          <h2 className="text-xl sm:text-2xl font-serif text-ink">{t('recentTitle2')}</h2>
        </div>
        <Link
          to="/catalogue"
          className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink transition-colors pb-0.5"
        >
          {t('similVoir')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mobile : carousel scrollable (~2,5 cartes) ; desktop : grille 4 colonnes */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {recent.map((p) => (
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
