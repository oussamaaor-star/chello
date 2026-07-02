import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X, Check, Star } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useLanguage } from '../../contexts/LanguageContext';
import { StarRating } from '../ui/StarRating';
import { imgUrl } from '../../utils/img';
import { SHOP_CONFIG } from '../../utils/config';
import { flyToCart, heartBurst } from '../../utils/microAnimations';

const CUR = SHOP_CONFIG.currency;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="aspect-[3/4] bg-cream-deep rounded-xl" />
      <div className="pt-3 space-y-2">
        <div className="h-3.5 w-3/4 bg-cream-deep rounded-full" />
        <div className="h-3.5 w-1/3 bg-cream-deep rounded-full" />
      </div>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export function ProductCard({ product, priority = false }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { trackAddToCart } = useAnalytics();
  const { t, lang } = useLanguage();

  const isFavorite = isInWishlist(product.id);
  const hasSizes = product.sizes?.length > 0;
  const displayPrice = product.price;

  const isRupture = product.stock === 0 || product.inStock === false;
  const isBestseller = product.tags?.includes('bestseller') ?? false;
  // Urgence douce : n'apparaît QUE si un stock numérique faible est réellement connu.
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3;

  // Note moyenne : remontée par normalizeDbProduct depuis products.avg_rating
  // (maintenue par trigger sur reviews — migration 021, avis approuvés seulement).
  // → affichage 100% CONDITIONNEL : rien tant que le produit n'a pas de note.
  const ratingValue = typeof product.rating === 'number' ? product.rating : null;
  const reviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : null;

  let badgeLabel = null;
  if (isRupture) badgeLabel = t('badgeRupture');
  else if (product.isNew) badgeLabel = t('badgeNouveau');
  else if (isBestseller) badgeLabel = t('badgeBestseller');

  const [selectedSize, setSelectedSize] = useState(null);
  const activeSize = selectedSize ?? product.sizes?.[0] ?? null;

  const [sheetOpen, setSheetOpen]   = useState(false);
  const [sheetSize, setSheetSize]   = useState(null);
  const [sheetAdded, setSheetAdded] = useState(false);
  const activeSheetSize = sheetSize ?? product.sizes?.[0] ?? null;

  // Transition partagée : au clic, la zone image reçoit le nom `product-hero`
  // et « voyage » vers la galerie de la fiche produit (View Transitions API).
  // Posé au clic seulement — un nom doit être unique par page, or la grille
  // affiche plusieurs cartes.
  const imgZoneRef = useRef(null);
  const markForTransition = () => {
    if (imgZoneRef.current) imgZoneRef.current.style.viewTransitionName = 'product-hero';
    // Mémorise le produit visité : au retour (breadcrumb, « continuer mes
    // achats »…), SA carte reprendra le nom pour le voyage inverse.
    try { sessionStorage.setItem('vt-product-return', product.slug); } catch { /* mode privé strict */ }
  };

  // Voyage retour fiche → grille : la carte du produit qu'on vient de quitter
  // porte le nom au montage, le temps que la transition se joue, puis le REND
  // via setState (un style DOM direct serait reposé par React au re-render
  // suivant ; le nom doit rester unique pour les navigations d'après).
  const [isReturnTarget, setIsReturnTarget] = useState(() => {
    try { return sessionStorage.getItem('vt-product-return') === product.slug; } catch { return false; }
  });
  useEffect(() => {
    if (!isReturnTarget) return undefined;
    const timer = setTimeout(() => {
      try { sessionStorage.removeItem('vt-product-return'); } catch { /* noop */ }
      setIsReturnTarget(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [isReturnTarget]);

  // Bouton quick-add desktop → coche « ajouté » pendant ~1 s (déjà le cas
  // dans le bottom sheet mobile via sheetAdded — ici pour la cohérence)
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e, size) => {
    e.preventDefault();
    if (isRupture) return;
    const s = size ?? activeSize;
    addToCart(product, s);
    trackAddToCart(product, 1);
    flyToCart(imgZoneRef.current, imgUrl(product.images?.[0], { w: 120, q: 70 }));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1100);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFavorite) heartBurst(e.currentTarget); // éclat uniquement à l'ajout
    toggleWishlist(product);
  };

  const handleOpenSheet = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSheetSize(null);
    setSheetAdded(false);
    setSheetOpen(true);
  };

  const handleSheetAdd = () => {
    if (isRupture) return;
    addToCart(product, activeSheetSize);
    trackAddToCart(product, 1);
    flyToCart(imgZoneRef.current, imgUrl(product.images?.[0], { w: 120, q: 70 }));
    setSheetAdded(true);
    setTimeout(() => { setSheetOpen(false); setSheetAdded(false); }, 1000);
  };

  // ─── Mobile bottom sheet (portal) ─────────────────────────────────────────

  const bottomSheet = sheetOpen ? createPortal(
    <div className="lg:hidden fixed inset-0 z-[200]" onClick={() => setSheetOpen(false)}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />

      <div
        className="absolute bottom-0 left-0 right-0 bg-cream rounded-t-3xl border-t border-ink/10 px-5 pt-3 pb-8"
        style={{ animation: 'slideUp 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-ink/15 rounded-full mx-auto mb-4" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream-deep flex-shrink-0">
            <img
              src={imgUrl(product.images?.[0] ?? '/products/placeholder-dresses.svg', { w: 120, q: 70 })}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink line-clamp-2 leading-snug">
              {product.name}
            </p>
          </div>
          <button
            onClick={() => setSheetOpen(false)}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-cream-deep text-ink-soft flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasSizes && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/60 mb-3">
              {t('chooseSize')}
            </p>
            <div dir="ltr" className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => {
                const isActive = activeSheetSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSheetSize(size)}
                    className={`flex flex-col items-center py-3 rounded-lg border transition-all active:scale-95 ${
                      isActive
                        ? 'border-ink bg-ink text-cream'
                        : 'border-ink/15 text-ink hover:border-ink/40'
                    }`}
                  >
                    <span className="text-xs font-semibold leading-none">{size}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          dir="ltr"
          onClick={handleSheetAdd}
          disabled={isRupture}
          className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 ${
            sheetAdded ? 'bg-emerald-600 text-white' : 'bg-ink hover:bg-ink/90 text-cream'
          }`}
        >
          {sheetAdded
            ? <><Check className="w-5 h-5" />{t('productAjouteOk')}</>
            : <><ShoppingBag className="w-5 h-5" />{displayPrice != null ? `${Number(displayPrice).toFixed(3)} ${CUR} · ` : ''}{t('addToCart')}</>
          }
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {bottomSheet}

      <Link to={`/produit/${product.slug}`} viewTransition onClick={markForTransition} className="group flex flex-col h-full transition-transform duration-300 ease-out hover:-translate-y-1">
        {/* Image zone */}
        <div ref={imgZoneRef} style={isReturnTarget ? { viewTransitionName: 'product-hero' } : undefined} className={`relative aspect-[3/4] bg-cream-deep rounded-xl overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_12px_30px_-12px_rgba(24,20,15,0.25)] ${isRupture ? 'grayscale' : ''}`}>
          <img
            src={imgUrl(product.images?.[0] ?? '/products/placeholder-dresses.svg', { w: 500, q: 70 })}
            srcSet={product.images?.[0] ? [
              `${imgUrl(product.images[0], { w: 300, q: 65 })} 300w`,
              `${imgUrl(product.images[0], { w: 500, q: 70 })} 500w`,
              `${imgUrl(product.images[0], { w: 800, q: 75 })} 800w`,
            ].join(', ') : undefined}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 opacity-0"
            onLoad={(e) => e.target.classList.replace('opacity-0', 'opacity-100')}
            onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.classList.replace('opacity-0', 'opacity-100'); e.target.onerror = null; }}
          />

          {/* 2e vue au survol (standard Zara/ASOS) — desktop uniquement :
              lazy + display:none sur mobile = pas de téléchargement inutile */}
          {product.images?.[1] && (
            <img
              src={imgUrl(product.images[1], { w: 500, q: 70 })}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="hidden lg:block absolute inset-0 object-cover w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          {isRupture && (
            <div className="absolute inset-0 bg-cream/60 flex items-center justify-center z-10">
              <span className="px-3 py-1 bg-ink text-cream text-[10px] font-semibold uppercase tracking-wider rounded-full">
                {t('productRupture')}
              </span>
            </div>
          )}

          {lowStock && !isRupture ? (
            <span className="absolute top-3 start-3 z-20 px-2.5 py-1 bg-rose-600/95 text-white text-[10px] font-semibold uppercase tracking-wide rounded-full shadow-sm">
              {lang === 'ar' ? `آخر ${product.stock} قطع` : `Only ${product.stock} left`}
            </span>
          ) : badgeLabel && !isRupture ? (
            <span className="absolute top-3 start-3 z-20 px-2.5 py-1 bg-cream/90 text-ink text-[10px] font-semibold uppercase tracking-wide rounded-full">
              {badgeLabel}
            </span>
          ) : null}

          {/* Wishlist */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 end-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-cream/85 backdrop-blur text-ink-soft hover:text-rose-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            aria-label={isFavorite ? t('removeFromWishlist') : t('addToWishlist')}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Mobile: bouton panier flottant */}
          {!isRupture && (
            <button
              onClick={handleOpenSheet}
              className="lg:hidden absolute bottom-2.5 end-2.5 z-20 w-10 h-10 rounded-full bg-ink shadow-md flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
              aria-label={t('addToCart')}
            >
              <ShoppingBag className="w-4 h-4 text-cream" />
            </button>
          )}

          {/* Desktop: quick-add (hover uniquement) */}
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 p-2.5">
            {hasSizes && !isRupture ? (
              <div className="flex flex-col gap-1.5">
                <div dir="ltr" className="flex gap-1">
                  {product.sizes.map((size) => {
                    const isActive = activeSize === size;
                    return (
                      <button
                        key={size}
                        onClick={(e) => { e.preventDefault(); setSelectedSize(size); }}
                        className={`flex-1 py-1 rounded-md text-[10px] font-semibold border transition-all truncate ${
                          isActive
                            ? 'bg-cream border-cream text-ink'
                            : 'bg-cream/80 border-cream/80 text-ink-soft hover:bg-cream'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={(e) => handleAddToCart(e, activeSize)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wide rounded-md transition-all ${
                    justAdded ? 'bg-emerald-600 text-white' : 'bg-ink hover:bg-ink/90 text-cream'
                  }`}
                >
                  {justAdded
                    ? <><Check className="w-3.5 h-3.5" />{t('productAjouteOk')}</>
                    : <><ShoppingBag className="w-3.5 h-3.5" />{t('addToCart')}</>}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isRupture}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wide rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                  justAdded ? 'bg-emerald-600 text-white' : 'bg-ink hover:bg-ink/90 text-cream'
                }`}
              >
                {justAdded
                  ? <><Check className="w-3.5 h-3.5" />{t('productAjouteOk')}</>
                  : <><ShoppingBag className="w-3.5 h-3.5" />{isRupture ? t('outOfStock') : t('addToCart')}</>}
              </button>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="pt-3 flex flex-col flex-grow">
          <h3 className="text-sm text-ink leading-snug mb-1 line-clamp-1">
            {product.name}
          </h3>

          {/* Note ★ si dispo, sinon mise en avant bestseller — jamais de chiffre inventé */}
          {ratingValue != null ? (
            <div className="flex items-center gap-1.5 mb-1">
              <StarRating rating={ratingValue} />
              <span className="text-xs text-ink-soft font-medium" dir="ltr">
                {ratingValue.toFixed(1)}
                {reviewCount != null && reviewCount > 0 && (
                  <span className="text-ink-soft/60"> ({reviewCount})</span>
                )}
              </span>
            </div>
          ) : isBestseller && !isRupture ? (
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3.5 h-3.5 fill-silver text-silver" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {t('badgeBestseller')}
              </span>
            </div>
          ) : null}

          <p className="text-sm font-semibold text-ink">
            {displayPrice != null
              ? <span dir="ltr">{Number(displayPrice).toFixed(3)} {CUR}</span>
              : <span className="text-ink-soft/60">{t('priceOnRequest')}</span>
            }
          </p>
        </div>
      </Link>
    </>
  );
}
