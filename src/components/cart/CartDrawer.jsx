import { useEffect, useRef } from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useCart } from '../../hooks/useCart';
import { useCartDrawer } from '../../hooks/useCartDrawer';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { CartCrossSell } from './CartCrossSell';
import { useLanguage } from '../../contexts/LanguageContext';

export function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { items, totalItems, clearCart } = useCart();
  const { t, lang } = useLanguage();

  const isRTL      = lang === 'ar';
  const closeBtnRef = useRef(null);

  // Verrouille le scroll de fond quand le tiroir est ouvert.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Échap pour fermer + focus initial sur le bouton de fermeture.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(focusTimer);
    };
  }, [isOpen, close]);

  const isEmpty = items.length === 0;

  // Le tiroir s'ouvre du côté « end » (droite en LTR, gauche en RTL).
  // Hors écran : translation positive en LTR (vers la droite),
  // négative en RTL (vers la gauche).
  const hiddenTransform = isRTL ? 'translateX(-100%)' : 'translateX(100%)';

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={close}
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('cartTitle')}
        className="fixed top-0 end-0 h-full w-full sm:w-96 max-w-[100vw] sm:max-w-[88vw] bg-cream border-s border-ink/10 shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateX(0)' : hiddenTransform }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif italic text-ink">{t('cartTitle')}</h2>
            {totalItems > 0 && (
              <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-ink text-cream text-xs font-bold flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEmpty && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-ink-soft hover:text-red-600 hover:bg-cream-deep rounded-lg transition-colors"
                aria-label={t('cartVider')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('cartVider')}
              </button>
            )}
            <button
              ref={closeBtnRef}
              onClick={close}
              aria-label={t('cartFermer')}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-deep transition-colors text-ink-soft ms-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-cream-deep flex items-center justify-center mb-5">
              <ShoppingBag className="w-7 h-7 text-ink-soft/50" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-serif italic text-ink mb-2">{t('cartVide')}</h3>
            <p className="text-sm text-ink-soft mb-7 max-w-[220px] leading-relaxed">
              {t('cartVideDesc')}
            </p>
            <Link
              to="/catalogue"
              onClick={close}
              className="px-6 py-3 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-medium uppercase tracking-wide transition-colors"
            >
              {t('cartDecouvrir')}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-1 overscroll-contain">
              {items.map((item, i) => (
                <CartItem
                  key={`${item.product.id}-${item.selectedSize ?? i}`}
                  item={item}
                />
              ))}

              <CartCrossSell />
            </div>
            <div className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-ink/10 bg-cream">
              <CartSummary onClose={close} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
