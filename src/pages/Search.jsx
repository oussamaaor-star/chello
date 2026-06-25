import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, ArrowRight, X } from 'lucide-react';

import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';
import { searchProducts } from '../utils/searchProducts';
import { ProductGrid } from '../components/product/ProductGrid';
import { useCatalogue } from '../hooks/useCatalogue';

import categoriesData from '../data/categories.json';

function getPrice(p) {
  return p.price ?? 0;
}

function sortResults(products, sort) {
  const arr = [...products];
  switch (sort) {
    case 'price-asc':  return arr.sort((a, b) => getPrice(a) - getPrice(b));
    case 'price-desc': return arr.sort((a, b) => getPrice(b) - getPrice(a));
    default:           return arr; // pertinence : ordre de searchProducts
  }
}

function QuickFilter({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
        active
          ? 'bg-ink text-cream'
          : 'bg-cream-deep border border-ink/10 text-ink hover:border-ink/20'
      }`}
    >
      {label}
    </button>
  );
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { t } = useLanguage();

  const SORT_OPTIONS = [
    { value: 'relevance', label: t('sortPertinence') },
    { value: 'price-asc', label: t('sortPrixAsc')    },
    { value: 'price-desc',label: t('sortPrixDesc')   },
  ];

  const { products } = useCatalogue();

  useSEO({
    title: query ? buildTitle(`نتائج البحث عن « ${query} »`) : buildTitle('البحث'),
    description: query
      ? `نتائج البحث عن « ${query} » في متجر Chello.`
      : 'ابحثي في تشكيلة Chello من الملابس، العبايات، الشنط، الأحذية والعطورات.',
    robots: 'noindex,nofollow',
  });

  const [sort, setSort] = useState('relevance');
  const [activeCategory, setActiveCategory] = useState(null);

  const rawResults = useMemo(
    () => searchProducts(query, products, categoriesData, { products: 100, categories: 10 }),
    [query, products],
  );

  const filtered = useMemo(() => {
    let list = rawResults.products;
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    return list;
  }, [rawResults.products, activeCategory]);

  const sorted = useMemo(() => sortResults(filtered, sort), [filtered, sort]);

  const categoryFilters = useMemo(() => {
    const counts = {};
    rawResults.products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => {
        const cat = categoriesData.find((c) => c.slug === slug);
        return { slug, label: cat?.label ?? slug };
      });
  }, [rawResults.products]);

  const hasActiveFilter = !!activeCategory;

  function resetFilters() {
    setActiveCategory(null);
  }

  if (!query.trim()) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cream-deep flex items-center justify-center mb-4">
          <SearchIcon className="w-7 h-7 text-ink-soft" />
        </div>
        <h1 className="text-2xl font-serif italic text-ink mb-2">{t('searchTitle')}</h1>
        <p className="text-sm text-ink-soft mb-6">{t('searchVide')}</p>
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-full text-sm font-semibold hover:bg-ink/90 transition-colors"
        >
          {t('navCatalogue')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-cream-deep border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="flex items-center gap-2 text-xs text-ink-soft mb-4">
            <Link to="/" className="hover:text-ink transition-colors">{t('breadcrumbAccueil')}</Link>
            <span>/</span>
            <span className="text-ink">{t('searchTitle')}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-silver-deep mb-1">{t('searchResultats')}</p>
              <h1 className="text-2xl sm:text-3xl font-serif italic text-ink">« {query} »</h1>
              <p className="text-sm text-ink-soft mt-1">
                {rawResults.totalProducts > 0
                  ? `${rawResults.totalProducts} ${t('searchResultats')} « ${query} »`
                  : t('searchAucun')}
              </p>
            </div>

            {rawResults.products.length > 0 && (
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-ink-soft flex-shrink-0" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="py-3 pl-3 pr-8 rounded-xl border border-ink/10 bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-silver/30 focus:border-silver transition-all appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categoryFilters.length > 1 && (
          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-silver-deep mb-2">{t('categorie')}</p>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map(({ slug, label }) => (
                <QuickFilter
                  key={slug}
                  label={label}
                  active={activeCategory === slug}
                  onClick={() => setActiveCategory(activeCategory === slug ? null : slug)}
                />
              ))}
            </div>
          </div>
        )}

        {hasActiveFilter && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-silver/10 text-silver-deep border border-silver/20 text-xs font-semibold hover:bg-silver/20 transition-colors"
            >
              {categoryFilters.find((c) => c.slug === activeCategory)?.label ?? activeCategory}
              <X className="w-3 h-3" />
            </button>
            <button onClick={resetFilters} className="text-xs text-ink-soft hover:text-ink underline transition-colors">
              {t('toutEffacer')}
            </button>
          </div>
        )}

        {rawResults.categories.length > 0 && rawResults.products.length === 0 && (
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-silver-deep mb-3">{t('categorie')}</p>
            <div className="flex flex-wrap gap-3">
              {rawResults.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/categorie/${cat.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-cream-deep border border-ink/10 rounded-xl text-sm font-semibold text-ink hover:border-silver transition-all"
                >
                  {cat.label}
                  <ArrowRight className="w-3.5 h-3.5 text-ink-soft" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {rawResults.products.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-ink-soft">{sorted.length} {t('searchResultats')}</p>
            </div>
            <ProductGrid products={sorted} onReset={hasActiveFilter ? resetFilters : undefined} />
          </>
        )}

        {rawResults.total === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-cream-deep border border-ink/10 flex items-center justify-center mx-auto mb-5">
              <SearchIcon className="w-8 h-8 text-ink-soft" />
            </div>
            <h2 className="text-xl font-serif italic text-ink mb-2">{t('searchAucun')}</h2>
            <p className="text-sm text-ink-soft max-w-sm leading-relaxed mb-8">
              {t('searchAucun')} <span className="font-semibold text-ink">« {query} »</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/catalogue" className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-full text-sm font-semibold hover:bg-ink/90 transition-colors">
                {t('voirTout')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 border border-ink/20 text-ink rounded-full text-sm font-medium hover:bg-cream-deep transition-colors">
                {t('notFoundRetour')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
