import { AnimatePresence, motion } from 'motion/react';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const SKELETON_COUNT = 8;

export function ProductGrid({ products = [], loading = false, onReset, preferredFormat = null }) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
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
          <ShoppingBag className="w-7 h-7 text-silver-deep opacity-70" />
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
    // Réorganisation animée au filtrage (pattern SSENSE/Farfetch) : les cartes
    // restantes GLISSENT vers leur nouvelle position (layout), les nouvelles
    // apparaissent en fondu, les retirées sortent en fondu (popLayout les
    // retire du flux pour que les autres se replacent immédiatement).
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard product={product} priority={index < 8} preferredFormat={preferredFormat} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
