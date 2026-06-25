import { ShoppingBag } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { GlowCard } from './GlowCard';
import { TiltEffect } from './TiltEffect';
import { useLanguage } from '../../contexts/LanguageContext';

export function FlipRevealGrid({ filteredProducts, onReset, preferredFormat = null }) {
  const { t } = useLanguage();
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-cream-deep rounded-3xl border border-dashed border-ink/15">
        <div className="w-16 h-16 rounded-full bg-silver/10 flex items-center justify-center mb-5">
          <ShoppingBag className="w-7 h-7 text-silver opacity-60" />
        </div>
        <h3 className="text-xl font-serif text-ink mb-2">{t('emptyProductsTitle')}</h3>
        <p className="text-ink-soft/70 mb-7 max-w-sm text-sm leading-relaxed">
          {t('emptyProductsDesc')}
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-ink text-cream rounded-xl text-sm font-medium hover:bg-ink-soft transition-colors"
          >
            {t('reinitFiltres')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
      {filteredProducts.map((product, i) => (
        <div
          key={product.id}
          className="pm-card-reveal"
          style={{ animationDelay: `${Math.min(i * 25, 280)}ms` }}
        >
          <TiltEffect>
            <GlowCard className="h-full">
              <ProductCard product={product} preferredFormat={preferredFormat} />
            </GlowCard>
          </TiltEffect>
        </div>
      ))}
    </div>
  );
}
