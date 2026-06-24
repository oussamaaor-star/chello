import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

import { searchProducts } from '../../utils/searchProducts';
import { SearchResultsDropdown } from '../search/SearchResultsDropdown';
import { useCatalogue } from '../../hooks/useCatalogue';
import { useLanguage } from '../../contexts/LanguageContext';

import categoriesData from '../../data/categories.json';

// ─── component ────────────────────────────────────────────────────────────────

export function SearchBar({ onClose, autoFocus = false }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [query, setQuery]          = useState('');
  const [isOpen, setIsOpen]        = useState(false);
  const [focusedIndex, setFocused] = useState(-1);

  const inputRef     = useRef(null);
  const containerRef = useRef(null);

  const { products } = useCatalogue();

  const results = useMemo(
    () => searchProducts(query, products, categoriesData),
    [query, products]
  );

  const hasResults = results.total > 0;

  const flatItems = useMemo(() => {
    const items = [
      ...results.products.map((p)  => ({ href: `/produit/${p.slug}` })),
      ...results.categories.map((c) => ({ href: `/categorie/${c.slug}` })),
    ];
    if (hasResults) items.push({ href: `/recherche?q=${encodeURIComponent(query)}` });
    return items;
  }, [results, hasResults, query]);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocused(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setFocused(-1); }, [results]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(val.trim().length >= 2);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setFocused(-1);
    inputRef.current?.focus();
  };

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    navigate(`/recherche?q=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
    setFocused(-1);
    onClose?.();
  }, [query, navigate, onClose]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocused((prev) => Math.min(prev + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocused((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && flatItems[focusedIndex]) {
          navigate(flatItems[focusedIndex].href);
          setIsOpen(false);
          setFocused(-1);
          onClose?.();
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocused(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocused(-1);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" aria-label={t('ariaSearchProducts')}>

        {/* ── Input area — single subtle amber focus ring ───────────────── */}
        <div className="relative w-full">

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder={t('navRecherche')}
            role="combobox"
            aria-label={t('navRecherche')}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            autoComplete="off"
            spellCheck="false"
            className="w-full h-[48px] rounded-full bg-cream-deep text-[16px] text-ink
                       placeholder-ink-soft/50 ps-12 pe-14 outline-none
                       border border-ink/10 transition-all duration-200
                       focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
          />

          {/* Search icon — left */}
          <div className="absolute left-[16px] rtl:left-auto rtl:right-[16px] top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-4 h-4 text-ink-soft/60" strokeWidth={2} />
          </div>

          {/* Right button — functional (clear or submit) */}
          <div className="absolute top-1/2 -translate-y-1/2 right-[6px] rtl:right-auto rtl:left-[6px]">
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label={t('ariaClearSearch')}
                className="flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label={t('ariaSubmitSearch')}
                className="flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <SearchResultsDropdown
          results={results}
          query={query}
          focusedIndex={focusedIndex}
          flatItems={flatItems}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
