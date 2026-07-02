import { ShoppingBag, Plus, Sparkles } from 'lucide-react';
import { useCatalogue } from '../../hooks/useCatalogue';
import { useCart } from '../../hooks/useCart';
import { imgUrl } from '../../utils/img';
import { useLanguage } from '../../contexts/LanguageContext';
import { SHOP_CONFIG } from '../../utils/config';

export function CartCrossSell() {
  const { products: allProducts } = useCatalogue();
  const { addToCart, items } = useCart();
  const { t } = useLanguage();

  const cartProductIds = items.map(item => item.product.id);
  const suggestedProducts = allProducts.filter(p => !cartProductIds.includes(p.id) && p.price != null);

  if (suggestedProducts.length === 0) return null;

  // Suggère un produit pas trop cher en up-sell facile
  const crossSellProduct = suggestedProducts.find(p => p.price > 0 && p.price < 15) || suggestedProducts[0];
  const priceToDisplay = crossSellProduct.price ?? 0;

  const handleAdd = () => {
    const selectedSize = crossSellProduct.sizes?.[0] ?? null;
    addToCart(crossSellProduct, selectedSize, 1);
  };

  return (
    <div className="mt-3 mb-1 p-3 bg-cream-deep rounded-2xl relative overflow-hidden group">
      <div className="absolute -top-4 -right-4 p-3 opacity-[0.04] pointer-events-none transform group-hover:scale-110 transition-transform duration-700">
        <ShoppingBag className="w-32 h-32 text-silver-deep" />
      </div>

      <div className="flex items-center gap-2 mb-2 relative z-10">
        <Sparkles className="w-3 h-3 text-silver-deep" />
        <p className="text-[10px] font-bold text-silver-deep uppercase tracking-widest">
          {t('cartCrossSell')}
        </p>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 flex-shrink-0 bg-cream rounded-xl overflow-hidden p-1">
          <img
            src={imgUrl(crossSellProduct.images?.[0], { w: 120, q: 70 }) || '/products/placeholder-dresses.svg'}
            alt={crossSellProduct.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-medium text-ink line-clamp-1">{crossSellProduct.name}</h4>
          <p className="text-sm font-semibold text-ink-soft mt-0.5" dir="ltr">{Number(priceToDisplay).toFixed(3)} {SHOP_CONFIG.currency}</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-cream hover:bg-ink hover:text-cream text-ink border border-ink/15 rounded-full transition-colors flex-shrink-0 text-xs font-semibold"
          aria-label={t('addToCart')}
        >
          <Plus className="w-3.5 h-3.5" />
          {t('addToCart')}
        </button>
      </div>
    </div>
  );
}
