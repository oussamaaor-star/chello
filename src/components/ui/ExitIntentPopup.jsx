import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ShoppingBag, Gift, Truck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useCartDrawer } from '../../hooks/useCartDrawer';
import { useLanguage } from '../../contexts/LanguageContext';
import { SHOP_CONFIG, FREE_SHIPPING_AT } from '../../utils/config';

const EXCLUDED_PATHS = ['/commande', '/confirmation', '/connexion', '/inscription', '/admin'];
const SESSION_KEY    = 'exitIntentShown';
const READY_DELAY    = 8000; // attend 8s avant d'activer le trigger

export function ExitIntentPopup() {
  const { t } = useLanguage();
  const [visible, setVisible]   = useState(false);
  const { items, totalPrice }   = useCart();
  const { open: openCart }      = useCartDrawer();
  const { pathname }            = useLocation();

  const isExcluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));

  const trigger = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (isExcluded) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(true);
  }, [isExcluded]);

  useEffect(() => {
    if (isExcluded) return;

    let ready = false;
    const timer = setTimeout(() => { ready = true; }, READY_DELAY);

    // Desktop : souris qui sort par le haut (vers la barre du navigateur)
    const onMouseLeave = (e) => {
      if (ready && e.clientY <= 4) trigger();
    };

    // Détecte un appareil tactile / sans souris : sur ces appareils le
    // changement d'onglet ou le verrouillage déclenche visibilitychange sans
    // que ce soit une vraie intention de sortie -> on n'attache pas ce trigger.
    const isTouch =
      (typeof window !== 'undefined' &&
        (('ontouchstart' in window) ||
          (window.matchMedia &&
            (window.matchMedia('(hover: none)').matches ||
              window.matchMedia('(pointer: coarse)').matches))));

    // Mobile : changement d'onglet / retour écran d'accueil
    const onVisibility = () => {
      if (ready && document.visibilityState === 'hidden') trigger();
    };

    document.addEventListener('mouseleave', onMouseLeave);
    if (!isTouch) {
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [trigger, isExcluded]);

  if (!visible) return null;

  const close      = () => setVisible(false);
  const handleCart = () => { close(); openCart(); };

  const remaining  = Math.max(0, FREE_SHIPPING_AT - totalPrice);
  const hasItems   = items.length > 0;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-intent-title"
        className="relative bg-cream border border-ink/10 rounded-3xl shadow-2xl shadow-ink/20 w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={close}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-11 h-11 flex items-center justify-center rounded-full bg-cream/20 hover:bg-cream/30 text-cream/70 hover:text-cream transition-colors z-10"
          aria-label={t('fermer')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-silver-deep via-silver to-silver-deep px-6 pt-8 pb-7 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
            {t('exitTitre')}
          </p>
          <h2 id="exit-intent-title" className="text-xl font-serif text-white leading-snug">
            {hasItems ? t('exitSousTotal') : t('exitTitre')}
          </h2>
        </div>

        {/* Contenu */}
        <div className="px-6 py-5 space-y-4">

          {hasItems ? (
            <>
              <p className="text-ink-soft text-sm text-center">
                {t('exitSousTotal')}{' '}
                <span className="text-silver font-bold">
                  {items.length} {t('cartArticles')}
                </span>{' '}
                (<span dir="ltr">{totalPrice} {SHOP_CONFIG.currency}</span>)
              </p>

              {/* Barre livraison gratuite */}
              <div className="p-3.5 bg-cream-deep rounded-2xl border border-ink/10">
                <div className="flex items-center gap-2.5 mb-2">
                  <Truck className="w-4 h-4 text-silver flex-shrink-0" />
                  <p className="text-xs font-semibold text-ink">
                    {remaining === 0
                      ? t('exitLivGratuite')
                      : t('exitRestant').replace('{n}', remaining)}
                  </p>
                </div>
                {remaining > 0 && (
                  <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-silver rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalPrice / FREE_SHIPPING_AT) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-3.5 bg-cream-deep rounded-2xl border border-ink/10">
              <Gift className="w-4 h-4 text-silver flex-shrink-0 mt-0.5" />
              <p className="text-xs text-ink-soft leading-relaxed">
                {t('exitPerks3')} 🇴🇲. {t('exitPerks1')}.
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleCart}
            className="w-full py-3.5 bg-ink hover:bg-ink/90 text-cream font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-ink/15"
          >
            {hasItems ? `${t('exitVoirPanier')} · ${totalPrice} ${SHOP_CONFIG.currency}` : t('exitVoirPanier')}
          </button>

          <button
            onClick={close}
            className="w-full py-2 text-ink-soft/60 hover:text-ink-soft text-xs transition-colors"
          >
            {t('exitContinuer')}
          </button>
        </div>
      </div>
    </div>
  );
}
