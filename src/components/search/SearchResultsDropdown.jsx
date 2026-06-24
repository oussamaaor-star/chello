import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ChevronRight, Tag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SHOP_CONFIG } from '../../utils/config';

const FALLBACK = '/products/placeholder-dresses.svg';

// ─── helpers ────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <p className="px-4 pt-3.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-ink-soft/60">
        {title}
      </p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-4 my-1 border-t border-ink/10" />;
}

// ─── component ───────────────────────────────────────────────────────────────

export function SearchResultsDropdown({
  results,
  query,
  focusedIndex,
  onClose,
  flatItems,
}) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { t } = useLanguage();

  const { products = [], categories = [] } = results;
  const hasResults = products.length + categories.length > 0;

  useEffect(() => {
    if (focusedIndex < 0 || !containerRef.current) return;
    const focused = containerRef.current.querySelector('[data-focused="true"]');
    focused?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  function navigate_(item) {
    navigate(item.href);
    onClose();
  }

  function getItemIndex(type, idx) {
    let offset = 0;
    if (type === 'category') offset = products.length;
    return offset + idx;
  }

  const isFocused = (type, idx) => focusedIndex === getItemIndex(type, idx);

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={t('searchResultsAria')}
      className="absolute top-full left-0 right-0 mt-2 bg-cream/98 backdrop-blur-xl rounded-2xl shadow-xl border border-ink/10 overflow-hidden z-50 max-h-[min(480px,70vh)] overflow-y-auto"
    >
      {!hasResults ? (
        <div className="px-4 py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-ink-soft/50" />
          </div>
          <p className="text-sm font-semibold text-ink mb-1">{t('searchDropAucun')}</p>
          <p className="text-xs text-ink-soft">
            {t('searchDropAucunDesc')} <span className="font-medium text-ink">« {query} »</span>
          </p>
          <button
            onClick={() => navigate_({ href: '/catalogue' })}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-deep hover:text-ink transition-colors"
          >
            {t('searchDropBrowse')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {products.length > 0 && (
            <Section title={t('searchDropProduits')}>
              {products.map((product, idx) => {
                const focused = isFocused('product', idx);
                const price = product.price;
                return (
                  <button
                    key={product.id}
                    role="option"
                    aria-selected={focused}
                    data-focused={focused}
                    onClick={() => navigate_({ href: `/produit/${product.slug}` })}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 text-left transition-colors ${
                      focused ? 'bg-cream-deep' : 'hover:bg-cream-deep'
                    }`}
                  >
                    <div className="w-12 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-cream-deep border border-ink/10">
                      <img
                        src={product.images?.[0] || FALLBACK}
                        alt={product.name}
                        onError={(e) => { e.target.src = FALLBACK; }}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[15px] text-ink leading-snug line-clamp-1">
                        {product.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-gold-deep">
                        {price != null ? `${Number(price).toFixed(2)} ${SHOP_CONFIG.currency}` : ''}
                      </span>
                      <ChevronRight className="w-4 h-4 text-ink-soft/40 rtl:rotate-180" />
                    </div>
                  </button>
                );
              })}
            </Section>
          )}

          {categories.length > 0 && (
            <>
              {products.length > 0 && <Divider />}
              <Section title={t('searchDropCategories')}>
                {categories.map((cat, idx) => {
                  const focused = isFocused('category', idx);
                  return (
                    <button
                      key={cat.slug}
                      role="option"
                      aria-selected={focused}
                      data-focused={focused}
                      onClick={() => navigate_({ href: `/categorie/${cat.slug}` })}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 text-left transition-colors ${
                        focused ? 'bg-cream-deep' : 'hover:bg-cream-deep'
                      }`}
                    >
                      <div className="w-9 h-9 flex-shrink-0 rounded-full bg-cream-deep border border-gold/25 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-gold-deep" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink">{cat.label}</p>
                        {cat.subcategories?.length > 0 && (
                          <p className="text-[11px] text-ink-soft/60 truncate">
                            {cat.subcategories.slice(0, 3).join(' · ')}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-soft/40 flex-shrink-0 rtl:rotate-180" />
                    </button>
                  );
                })}
              </Section>
            </>
          )}

          <Divider />
          <button
            role="option"
            aria-selected={focusedIndex === flatItems.length - 1}
            data-focused={focusedIndex === flatItems.length - 1}
            onClick={() => navigate_({ href: `/recherche?q=${encodeURIComponent(query)}` })}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
              focusedIndex === flatItems.length - 1
                ? 'bg-ink text-cream'
                : 'text-ink hover:bg-cream-deep'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            {t('searchDropVoirTout')} « {query} »
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}
