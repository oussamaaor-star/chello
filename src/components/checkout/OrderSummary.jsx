import { useCart } from '../../hooks/useCart';
import { Package, Tag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SHOP_CONFIG, getShippingCost } from '../../utils/config';
const PLACEHOLDER = '/products/placeholder-dresses.svg';

export function OrderSummary({ promoDiscount = null }) {
  const { items, totalPrice } = useCart();
  const { t } = useLanguage();
  const CUR = SHOP_CONFIG.currency;

  const shippingCost   = getShippingCost(totalPrice);
  const discountAmount = promoDiscount
    ? parseFloat((totalPrice * promoDiscount.discount_percent / 100).toFixed(3))
    : 0;
  const total = totalPrice + shippingCost - discountAmount;

  return (
    <div className="bg-cream-deep rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ink/10 flex items-center gap-2">
        <Package className="w-4 h-4 text-ink-soft/60" />
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
          {t('summaryRecap')}
        </h2>
        <span className="ml-auto text-xs text-ink-soft/60 font-medium">
          {items.reduce((s, i) => s + i.quantity, 0)} {t('summaryArticles')}
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-ink/10 max-h-64 overflow-y-auto">
        {items.map((item, idx) => {
          const price = item.product.price ?? 0;
          return (
            <div
              key={`${item.product.id}-${item.selectedSize ?? idx}`}
              className="flex items-center gap-3 px-5 py-3"
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-cream">
                  <img
                    src={item.product.images?.[0] || PLACEHOLDER}
                    alt={item.product.name}
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                {item.quantity > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-cream text-[10px] font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink line-clamp-2 leading-snug">
                  {item.product.name}
                </p>
                {item.selectedSize && (
                  <p className="text-[11px] text-ink-soft/60 mt-0.5">{item.selectedSize}</p>
                )}
              </div>
              <p className="text-sm font-semibold text-ink flex-shrink-0" dir="ltr">
                {(price * item.quantity).toFixed(3)} {CUR}
              </p>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 border-t border-ink/10 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-ink-soft">{t('cartSousTotal')}</span>
          <span className="font-semibold text-ink" dir="ltr">{totalPrice.toFixed(3)} {CUR}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-soft">{t('summaryLivraison')}</span>
          <span className={`font-semibold ${shippingCost === 0 ? 'text-emerald-700' : 'text-ink'}`} dir="ltr">
            {shippingCost === 0 ? t('summaryGratuit') : `${shippingCost.toFixed(3)} ${CUR}`}
          </span>
        </div>
        {promoDiscount && (
          <div className="flex justify-between text-sm text-emerald-700">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Code <span className="font-mono font-semibold">{promoDiscount.code}</span>
              <span className="text-xs">(-{promoDiscount.discount_percent}%)</span>
            </span>
            <span className="font-semibold">−{discountAmount.toFixed(3)} {CUR}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-ink/10">
          <span className="text-sm font-semibold text-ink">{t('summaryTotal')}</span>
          <span className="text-xl font-semibold text-ink" dir="ltr">{total.toFixed(3)} {CUR}</span>
        </div>
      </div>
    </div>
  );
}
