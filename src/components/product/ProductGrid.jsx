import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const SKELETON_COUNT = 8;

export function ProductGrid({ products = [], loading = false, onReset, preferredFormat = null }) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-ink/15 rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-cream-deep flex items-center justify-center mb-5">
          <ShoppingBag className="w-7 h-7 text-gold-deep opacity-70" />
        </div>
        <h3 className="text-xl font-serif italic text-ink mb-2">{t('emptyProductsTitle')}</h3>
        <p className="text-ink-soft/70 mb-7 max-w-sm text-sm leading-relaxed">
          {t('emptyProductsDesc')}
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-ink text-cream rounded-full text-sm font-medium uppercase tracking-wide hover:bg-ink/90 transition-colors"
          >
            {t('reinitFiltres')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 8} preferredFormat={preferredFormat} />
      ))}
    </div>
  );
}
