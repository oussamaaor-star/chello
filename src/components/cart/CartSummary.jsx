import { Link } from 'react-router-dom';
import { Lock, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useCartDrawer } from '../../hooks/useCartDrawer';
import { useLanguage } from '../../contexts/LanguageContext';
import { SHOP_CONFIG, FREE_SHIPPING_AT, getShippingCost } from '../../utils/config';

export function CartSummary() {
  const { totalPrice } = useCart();
  const { close }      = useCartDrawer();
  const { t }          = useLanguage();

  const CUR            = SHOP_CONFIG.currency;
  const isFreeShipping = totalPrice >= FREE_SHIPPING_AT;
  const remaining      = FREE_SHIPPING_AT - totalPrice;
  const progress       = Math.min((totalPrice / FREE_SHIPPING_AT) * 100, 100);

  // Source de vérité unique : forfait sous le seuil, gratuit au-dessus.
  const shippingCost   = getShippingCost(totalPrice);
  const total          = totalPrice + shippingCost;

  return (
    <div className="flex flex-col gap-2.5">

      {/* Free-shipping progress bar */}
      {!isFreeShipping && totalPrice > 0 && (
        <div>
          <p className="text-[10px] font-bold text-silver-deep uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {t('cartProgressBar', { n: remaining.toFixed(0) })}
          </p>
          <div className="h-1 w-full bg-cream-deep rounded-full overflow-hidden">
            <div
              className="h-full bg-silver rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {isFreeShipping && (
        <div>
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {t('cartProgressDone')}
          </p>
          <div className="h-1 w-full bg-cream-deep rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full w-full" />
          </div>
        </div>
      )}

      {/* Price breakdown */}
      <div className="space-y-1 px-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-ink-soft">{t('cartSousTotal')}</span>
          <span className="font-semibold text-ink" dir="ltr">{totalPrice.toFixed(3)} {CUR}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-ink-soft">{t('cartLivraison')}</span>
          <span
            className={isFreeShipping ? 'text-emerald-700 font-semibold' : 'font-semibold text-ink'}
            dir="ltr"
          >
            {isFreeShipping ? t('cartLivraisonGratuite') : `${shippingCost.toFixed(3)} ${CUR}`}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 mt-1 border-t border-ink/10">
          <span className="text-base font-medium text-ink">{t('cartTotal')}</span>
          <span className="text-xl font-semibold text-ink" dir="ltr">{total.toFixed(3)} {CUR}</span>
        </div>
      </div>

      {/* Primary CTA */}
      <Link
        to="/checkout"
        onClick={close}
        className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.98]"
      >
        <Lock className="w-4 h-4" />
        {t('cartFinaliser')}
        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
      </Link>

      {/* Secured note + slim secondary link */}
      <div className="flex items-center justify-center gap-3 text-xs">
        <span className="text-ink-soft/60">{t('cartSecurise')}</span>
        <span className="text-ink/20" aria-hidden="true">·</span>
        <Link
          to="/catalogue"
          onClick={close}
          className="inline-flex items-center gap-1.5 text-ink-soft font-medium hover:text-ink transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {t('cartContinuer')}
        </Link>
      </div>
    </div>
  );
}
