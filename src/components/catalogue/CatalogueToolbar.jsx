import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpDown, SlidersHorizontal, Check, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Options de tri ─────────────────────────────────────────────────────────
// La valeur sert de clé interne ; le libellé vient de translations.js.
export const SORT_OPTIONS = [
  { value: 'new',     key: 'catalogueSortNew'   },
  { value: 'best',    key: 'catalogueSortBest'  },
  { value: 'priceA',  key: 'catalogueSortPrix'  },
  { value: 'priceD',  key: 'catalogueSortPrixD' },
  { value: 'name',    key: 'catalogueSortNom'   },
];

/**
 * CatalogueToolbar — barre Tri + Filtres + Compteur.
 *
 * DESKTOP (lg+) : barre inline (tri, tailles, en-stock, compteur).
 * MOBILE (<lg)  : compteur + bouton « Trier & filtrer » qui ouvre un BOTTOM-SHEET
 *                 (position fixed, jamais sticky — Lenis global).
 *
 * 100 % contrôlé : aucun état métier ici, tout remonte au parent (Catalogue.jsx)
 * pour que le tri/filtre soit appliqué AVANT le rendu de la grille FlipReveal.
 */
export function CatalogueToolbar({
  count,
  sort,
  onSortChange,
  sizes,
  sizeFilter,
  onSizeChange,
  inStockOnly,
  onInStockChange,
}) {
  const { t, lang } = useLanguage();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Bloque le scroll du body quand le bottom-sheet est ouvert.
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sheetOpen]);

  const hasActiveFilters = sizeFilter !== 'all' || inStockOnly;

  const resetFilters = () => {
    onSizeChange('all');
    onInStockChange(false);
  };

  const tx = (ar, en) => (lang === 'ar' ? ar : en);

  // ── Sous-blocs réutilisés (desktop + sheet) ─────────────────────────────────

  const SizeChips = ({ size = 'sm' }) => {
    if (!sizes.length) return null;
    return (
      <div dir="ltr" className="flex flex-wrap gap-2">
        <FilterChip active={sizeFilter === 'all'} onClick={() => onSizeChange('all')} size={size}>
          {tx('الكل', 'All')}
        </FilterChip>
        {sizes.map((s) => (
          <FilterChip key={s} active={sizeFilter === s} onClick={() => onSizeChange(s)} size={size}>
            {s}
          </FilterChip>
        ))}
      </div>
    );
  };

  const StockToggle = () => (
    <button
      type="button"
      role="switch"
      aria-checked={inStockOnly}
      onClick={() => onInStockChange(!inStockOnly)}
      className="flex items-center gap-2.5 group"
    >
      <span
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
          inStockOnly ? 'bg-ink' : 'bg-ink/15'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-cream shadow-sm transition-transform ${
            inStockOnly ? 'translate-x-[1.125rem] rtl:-translate-x-[1.125rem]' : 'translate-x-1 rtl:-translate-x-1'
          }`}
        />
      </span>
      <span className="text-sm font-medium text-ink-soft group-hover:text-ink transition-colors">
        {t('enStockSeul')}
      </span>
    </button>
  );

  return (
    <>
      {/* ════════════ DESKTOP : barre inline ════════════ */}
      <div className="hidden lg:flex items-center justify-between gap-6 mb-8 pb-5 border-b border-ink/10">
        {/* Compteur */}
        <p className="text-sm text-ink-soft whitespace-nowrap" aria-live="polite">
          <span className="font-semibold text-ink">{t('catalogueNbResult', { n: count })}</span>
        </p>

        <div className="flex items-center gap-6">
          {/* Filtre taille */}
          {sizes.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft/70 whitespace-nowrap">
                {t('filtreFormat')}
              </span>
              <SizeChips size="sm" />
            </div>
          )}

          {/* En stock */}
          <StockToggle />

          {/* Tri */}
          <SortSelect t={t} sort={sort} onSortChange={onSortChange} />
        </div>
      </div>

      {/* ════════════ MOBILE : compteur + bouton déclencheur ════════════ */}
      <div className="flex lg:hidden items-center justify-between gap-3 mb-6">
        <p className="text-sm text-ink-soft" aria-live="polite">
          <span className="font-semibold text-ink">{t('catalogueNbResult', { n: count })}</span>
        </p>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative flex items-center gap-2 h-10 ps-4 pe-4 rounded-full border border-ink/15 bg-cream text-sm font-medium text-ink active:scale-[0.98] transition-transform"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{tx('ترتيب وتصفية', 'Sort & filter')}</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-ink border-2 border-cream" />
          )}
        </button>
      </div>

      {/* ════════════ MOBILE : bottom-sheet (portal, fixed) ════════════ */}
      {createPortal(
        <AnimatePresence>
          {sheetOpen && (
            <div className="lg:hidden fixed inset-0 z-[200]">
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSheetOpen(false)}
              />

              {/* Panel */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-cream rounded-t-3xl border-t border-ink/10 px-5 pt-3 pb-6"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                role="dialog"
                aria-modal="true"
                aria-label={tx('ترتيب وتصفية', 'Sort & filter')}
              >
                <div className="w-10 h-1 bg-ink/15 rounded-full mx-auto mb-4" />

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif italic text-xl text-ink">
                    {tx('ترتيب وتصفية', 'Sort & filter')}
                  </h2>
                  <button
                    onClick={() => setSheetOpen(false)}
                    aria-label={tx('إغلاق', 'Close')}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-cream-deep text-ink-soft"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tri */}
                <section className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft/60 mb-3">
                    {t('triPar')}
                  </p>
                  <div className="flex flex-col gap-1">
                    {SORT_OPTIONS.map((opt) => {
                      const active = sort === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => onSortChange(opt.value)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                            active ? 'bg-ink text-cream' : 'text-ink hover:bg-cream-deep'
                          }`}
                        >
                          <span>{t(opt.key)}</span>
                          {active && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Filtre taille */}
                {sizes.length > 0 && (
                  <section className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft/60 mb-3">
                      {t('filtreFormat')}
                    </p>
                    <SizeChips size="lg" />
                  </section>
                )}

                {/* En stock */}
                <section className="mb-6 pb-2">
                  <StockToggle />
                </section>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className="flex-1 py-3.5 rounded-full border border-ink/15 text-sm font-semibold text-ink-soft disabled:opacity-40 active:scale-[0.98] transition-all"
                  >
                    {tx('إعادة تعيين', 'Reset')}
                  </button>
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="flex-[1.6] py-3.5 rounded-full bg-ink text-cream text-sm font-semibold uppercase tracking-wide active:scale-[0.98] transition-transform"
                  >
                    {tx('عرض المنتجات', 'View products')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

// ─── Chip de filtre (taille / all) ──────────────────────────────────────────
function FilterChip({ active, onClick, children, size = 'sm' }) {
  const pad = size === 'lg' ? 'min-w-[3rem] px-4 py-2.5' : 'min-w-[2.25rem] px-3 py-1.5';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${pad} rounded-full border text-xs font-semibold text-center transition-all active:scale-95 ${
        active
          ? 'border-ink bg-ink text-cream'
          : 'border-ink/15 text-ink-soft hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Sélecteur de tri natif stylisé (desktop) ───────────────────────────────
function SortSelect({ t, sort, onSortChange }) {
  return (
    <div className="relative flex items-center">
      <ArrowUpDown className="absolute start-3.5 w-4 h-4 text-ink-soft/60 pointer-events-none" />
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label={t('triPar')}
        className="appearance-none h-10 ps-10 pe-9 rounded-full bg-cream-deep border border-ink/10 text-sm text-ink font-medium cursor-pointer outline-none transition-colors hover:border-ink/20 focus:border-silver/60 focus:ring-2 focus:ring-silver/15"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.key)}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <svg
        className="absolute end-3.5 w-3.5 h-3.5 text-ink-soft/60 pointer-events-none"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export default CatalogueToolbar;
