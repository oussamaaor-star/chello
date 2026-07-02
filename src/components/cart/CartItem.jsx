import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../contexts/LanguageContext';
import { SHOP_CONFIG } from '../../utils/config';

const PLACEHOLDER = '/products/placeholder-dresses.svg';

export function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();
  const { product, quantity, selectedSize, selectedColor } = item;

  const unitPrice = product.price ?? 0;
  const lineTotal = unitPrice * quantity;

  const handleRemove   = () => removeFromCart(product.id, selectedSize, selectedColor);
  const handleDecrease = () => {
    if (quantity <= 1) handleRemove();
    else updateQuantity(product.id, quantity - 1, selectedSize, selectedColor);
  };
  const handleIncrease = () => updateQuantity(product.id, quantity + 1, selectedSize, selectedColor);

  return (
    <div className="flex gap-3 py-3 border-b border-ink/10 last:border-0">
      {/* Thumbnail */}
      <div className="w-14 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-cream-deep">
        <img
          src={product.images?.[0] || PLACEHOLDER}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => { e.target.src = PLACEHOLDER; e.target.onerror = null; }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink leading-snug line-clamp-1">
              {product.name}
            </p>
            {(selectedSize || selectedColor) && (
              <p className="text-[10px] text-ink-soft/70 mt-0.5">
                {[selectedSize, selectedColor].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <button
            onClick={handleRemove}
            aria-label={t('cartItemRetirer')}
            className="w-9 h-9 p-2 flex items-center justify-center text-ink-soft hover:text-red-600 transition-colors flex-shrink-0 rounded-md hover:bg-cream-deep"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Qty controls + line price */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center border border-ink/15 rounded-full overflow-hidden">
            <button
              onClick={handleDecrease}
              aria-label={t('cartDiminuerQuantite')}
              className="w-11 h-11 flex items-center justify-center hover:bg-cream-deep transition-colors text-ink-soft"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-ink select-none">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= 10}
              aria-label={t('cartAugmenterQuantite')}
              className="w-11 h-11 flex items-center justify-center hover:bg-cream-deep transition-colors text-ink-soft disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-right flex flex-col justify-end h-full" dir="ltr">
            {quantity > 1 && (
              <p className="text-[10px] text-ink-soft/70 leading-none mb-1">
                {unitPrice.toFixed(3)} {SHOP_CONFIG.currency} × {quantity}
              </p>
            )}
            <p className="text-sm font-semibold text-ink leading-none">{lineTotal.toFixed(3)} {SHOP_CONFIG.currency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
