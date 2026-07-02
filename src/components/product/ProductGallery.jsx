import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { imgUrl } from '../../utils/img';
import { useLanguage } from '../../contexts/LanguageContext';

const PLACEHOLDER = '/products/fallback.svg';

// ─── Lightbox (images only) ───────────────────────────────────────────────────

function Lightbox({ imgs, activeIndex, onClose, onPrev, onNext, onSelect, productName = '' }) {
  const [zoomed, setZoomed]   = useState(false);
  const [origin, setOrigin]   = useState({ x: 50, y: 50 });
  const containerRef          = useRef(null);
  const touchStartX           = useRef(null);
  const swipedRef             = useRef(false);
  const { t }                 = useLanguage();

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onPrev();
      if (e.key === 'ArrowRight')  onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => { setZoomed(false); }, [activeIndex]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || e.clientX == null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  // Tap/clic : centre le zoom sur le point touché puis bascule.
  // Ignore le clic synthétique généré juste après un swipe.
  const handleZoomToggle = (e) => {
    if (swipedRef.current) { swipedRef.current = false; return; }
    e.stopPropagation();
    handleMouseMove(e);
    setZoomed((z) => !z);
  };

  // Swipe tactile (uniquement quand non zoomé) pour changer d'image
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; swipedRef.current = false; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (!zoomed && imgs.length > 1 && Math.abs(delta) > 50) {
      swipedRef.current = true;
      delta > 0 ? onNext() : onPrev();
    }
    touchStartX.current = null;
  };

  const total = imgs.length;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 end-0 z-20 p-3 sm:p-5">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream-deep transition-colors"
          >
            <X className="w-6 h-6 text-ink" />
          </button>
        </div>

        <div
          ref={containerRef}
          onClick={handleZoomToggle}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomed(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`flex-grow flex items-center justify-center relative p-2 sm:p-12 overflow-hidden select-none ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        >
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-ink-soft text-xs select-none z-10 pointer-events-none">
            {zoomed ? t('galleryZoomOut') : t('galleryZoomIn')}
          </p>

          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute start-2 sm:start-6 w-10 h-10 sm:w-14 sm:h-14 bg-white border border-ink/15 shadow-lg rounded-full flex items-center justify-center hover:bg-cream-deep hover:scale-105 transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6 text-ink rtl:rotate-180" />
            </button>
          )}

          <img
            key={activeIndex}
            src={imgs[activeIndex] || PLACEHOLDER}
            alt={`${productName}${total > 1 ? ` — ${activeIndex + 1}/${total}` : ''}`}
            draggable={false}
            className="max-w-full max-h-[68vh] sm:max-h-[72vh] object-contain transition-transform duration-200 ease-out"
            style={{
              transform: zoomed ? 'scale(2.5)' : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />

          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute end-2 sm:end-6 w-10 h-10 sm:w-14 sm:h-14 bg-white border border-ink/15 shadow-lg rounded-full flex items-center justify-center hover:bg-cream-deep hover:scale-105 transition-all z-10"
            >
              <ChevronRight className="w-6 h-6 text-ink rtl:rotate-180" />
            </button>
          )}
        </div>

        {total > 1 && (
          <div className="flex justify-center gap-2 sm:gap-4 pb-6 sm:pb-8 px-4 overflow-x-auto">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? 'border-ink shadow-md scale-105'
                    : 'border-transparent hover:border-ink/15 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl(img, { w: 120, q: 70 }) || PLACEHOLDER}
                  alt={`${productName} ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export function ProductGallery({ images = [], productName = '' }) {
  const { t } = useLanguage();

  const imgs       = images.length > 0 ? images : [null];
  const imgCount   = imgs.length;
  const totalItems = imgCount;

  const [activeIndex,    setActiveIndex]    = useState(0);
  const [lightbox,       setLightbox]       = useState(false);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [hoverPos,       setHoverPos]       = useState({ x: 50, y: 50 });

  const touchStartX = useRef(null);
  const swipedRef   = useRef(false);
  const galleryRef  = useRef(null);

  useEffect(() => { setActiveIndex(0); }, [images]);

  useEffect(() => {
    if (totalItems <= 1 || lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  setActiveIndex((i) => (i - 1 + totalItems) % totalItems);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % totalItems);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalItems, lightbox]);

  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + totalItems) % totalItems), [totalItems]);
  const next = useCallback(() => setActiveIndex((i) => (i + 1) % totalItems), [totalItems]);

  // Lightbox prev/next only cycles through images
  const lbPrev = useCallback(() => setActiveIndex((i) => (i - 1 + imgCount) % imgCount), [imgCount]);
  const lbNext = useCallback(() => setActiveIndex((i) => (i + 1) % imgCount), [imgCount]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; swipedRef.current = false; };
  const handleTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) { swipedRef.current = true; delta > 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  const handleMouseMove = (e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    if (!galleryRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    setHoverPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    setIsHoverZooming(true);
  };

  return (
    <>
      <div className="flex flex-col gap-3">

        {/* ── Main area ── */}
        <div
          ref={galleryRef}
          id="product-hero-zone"
          className="relative w-full aspect-[4/5] bg-white sm:rounded-3xl rounded-2xl overflow-hidden group flex items-center justify-center cursor-zoom-in"
          /* Cible de la transition partagée depuis ProductCard (image qui voyage)
             + point de départ du vol vers le panier (flyToCart) */
          style={{ viewTransitionName: 'product-hero' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => { if (swipedRef.current) { swipedRef.current = false; return; } setLightbox(true); }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHoverZooming(false)}
        >
          {/* ── Image ── */}
          <>
              <img
                key={activeIndex}
                src={imgUrl(imgs[activeIndex], { w: 900, q: 80 }) || PLACEHOLDER}
                alt={`${productName}${totalItems > 1 ? ` — view ${activeIndex + 1}` : ''}`}
                loading={activeIndex === 0 ? 'eager' : 'lazy'}
                fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
                decoding="async"
                onError={(e) => { e.target.src = PLACEHOLDER; e.target.onerror = null; }}
                className="w-full h-full object-cover gallery-enter transition-transform duration-200 ease-out"
                style={{
                  transform: isHoverZooming ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: `${hoverPos.x}% ${hoverPos.y}%`,
                }}
              />

              {/* Zoom button */}
              <button
                type="button"
                aria-label={t('galleryAgrandir')}
                onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white z-10"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>

              {/* Prev / Next */}
              {totalItems > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    aria-label={t('galleryPrev')}
                    className="hidden sm:flex absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 backdrop-blur rounded-full items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white active:scale-95 z-10"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    aria-label={t('galleryNext')}
                    className="hidden sm:flex absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 backdrop-blur rounded-full items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white active:scale-95 z-10"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 rtl:rotate-180" />
                  </button>
                </>
              )}

              {/* Counter */}
              {totalItems > 1 && (
                <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full z-10">
                  <span dir="ltr" className="text-white text-[10px] sm:text-[11px] font-semibold tabular-nums">
                    {activeIndex + 1} / {totalItems}
                  </span>
                </div>
              )}

              {/* Dot indicators — mobile */}
              {totalItems > 1 && (
                <div className="flex sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-1.5 z-10">
                  {Array.from({ length: totalItems }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                      aria-label={t('galleryMedia').replace('{n}', i + 1)}
                      className={`h-1 rounded-full transition-all ${i === activeIndex ? 'w-4 bg-ink' : 'w-1.5 bg-ink-soft'}`}
                    />
                  ))}
                </div>
              )}
            </>
        </div>

        {/* ── Thumbnails ── */}
        {totalItems > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {imgs.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={t('galleryVue').replace('{n}', i + 1)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 bg-cream transition-all ${
                  activeIndex === i
                    ? 'border-ink shadow-sm scale-[1.03]'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <img
                  src={img || PLACEHOLDER}
                  alt={`${productName} view ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.target.src = PLACEHOLDER; e.target.onerror = null; }}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

          </div>
        )}
      </div>

      {/* ── Lightbox (images only) ── */}
      {lightbox && createPortal(
        <Lightbox
          imgs={imgs}
          activeIndex={activeIndex}
          onClose={() => setLightbox(false)}
          onPrev={lbPrev}
          onNext={lbNext}
          onSelect={(i) => setActiveIndex(i)}
          productName={productName}
        />,
        document.body
      )}
    </>
  );
}
