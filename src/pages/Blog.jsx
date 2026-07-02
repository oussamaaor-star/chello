import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { blogArticles } from '../data/blog';
import { useSEO } from '../hooks/useSEO';
import { imgUrl } from '../utils/img';
import { blogFallbackImage } from '../utils/blogFallback';
import { useLanguage } from '../contexts/LanguageContext';

// Fallback cover: 1st error → varied product photo (deterministic by
// article) ; 2nd error → placeholder SVG. Uses data-fb to avoid loop.
function handleCoverError(e, seed) {
  const img = e.currentTarget;
  if (img.dataset.fb === '1') {
    img.onerror = null;
    img.src = '/products/fallback.svg';
    return;
  }
  img.dataset.fb = '1';
  img.src = blogFallbackImage(seed);
}

// Sélection bilingue : en mode EN on lit les champs *En s'ils existent,
// sinon repli sur l'arabe (jamais de champ vide).
const pickTitle = (a, lang) => (lang === 'ar' ? a.title : a.titleEn || a.title);
const pickExcerpt = (a, lang) => (lang === 'ar' ? a.excerpt : a.excerptEn || a.excerpt);

export default function Blog() {
  const { t, lang } = useLanguage();

  const CATEGORIES = [
    { value: 'All',             labelKey: 'blogCatTous' },
    { value: 'Trends',          labelKey: 'blogCatMaroc' },
    { value: 'Styling Tips',    labelKey: 'blogCatMarques' },
    { value: 'Seasonal Guide',  labelKey: 'blogCatGuide' },
    { value: 'Accessories',     labelKey: 'blogCatSelections' },
    { value: 'Care Tips',       labelKey: 'blogCatOlfactif' },
    { value: 'New Arrivals',    labelKey: 'blogCatNewArrivals' },
  ];
  // Localise une catégorie d'article (sinon le badge affichait la valeur EN brute en arabe)
  const catLabel = (val) => {
    const c = CATEGORIES.find((x) => x.value === val);
    return c ? t(c.labelKey) : val;
  };

  const [activeCategory, setActiveCategory] = useState('All');

  useSEO({
    title: 'Blog | Chello',
    description: lang === 'ar'
      ? "نصائح الموضة والأناقة من تشيللو — أحدث صيحات الأزياء النسائية، العبايات، الحقائب والأحذية."
      : "Fashion and style tips from Chello — the latest women's fashion trends, abayas, bags and shoes.",
    keywords: 'chello blog, fashion oman, abayas muscat, women fashion oman',
    canonical: 'https://chello-nine.vercel.app/blog',
  });

  const filtered = activeCategory === 'All'
    ? blogArticles
    : blogArticles.filter(a => a.category === activeCategory);

  const heroArticle = filtered[0];
  const otherArticles = filtered.slice(1);

  // Schema.org Blog pour Google
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog Chello",
    "description": "Fashion tips, style guides and trends from Chello, Muscat, Oman",
    "url": "https://chello-nine.vercel.app/blog",
    "publisher": { "@type": "Organization", "name": "Chello" },
    "blogPost": blogArticles.slice(0, 10).map(a => ({
      "@type": "BlogPosting",
      "headline": pickTitle(a, lang),
      "description": pickExcerpt(a, lang),
      "datePublished": a.date,
      "url": `https://chello-nine.vercel.app/blog/${a.slug}`
    }))
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="text-center mb-10">
          <p className="text-silver font-bold uppercase tracking-widest text-xs mb-3 flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> {t('blogEyebrow')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-ink mb-4">{t('blogTitle')}</h1>
          <p className="text-ink-soft max-w-2xl mx-auto text-lg">
            {blogArticles.length} {t('blogSubtitle')}
          </p>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === value
                  ? 'bg-silver text-cream'
                  : 'bg-cream-deep text-ink-soft hover:bg-ink/5 hover:text-ink'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {heroArticle && (
          <>
            {/* Hero Article */}
            <Link
              to={`/blog/${heroArticle.slug}`}
              className="group block relative rounded-3xl overflow-hidden mb-12 sm:mb-16 aspect-[16/9] sm:aspect-[21/9]"
            >
              <div className="absolute inset-0">
                <img
                  src={imgUrl(heroArticle.image, { w: 1400, q: 75 })}
                  alt={pickTitle(heroArticle, lang)}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => handleCoverError(e, heroArticle.id ?? heroArticle.slug)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
              </div>

              <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-silver/20 text-silver-light text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                      {catLabel(heroArticle.category)}
                    </span>
                    <span className="text-cream/70 text-xs flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {heroArticle.readTime}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-cream mb-4 sm:mb-6 group-hover:text-silver-light transition-colors">
                    {pickTitle(heroArticle, lang)}
                  </h2>
                  <p className="hidden sm:block text-cream/70 text-lg mb-6 max-w-2xl">
                    {pickExcerpt(heroArticle, lang)}
                  </p>
                  <div className="inline-flex items-center gap-2 text-cream font-bold text-sm uppercase tracking-wider group-hover:text-silver transition-colors">
                    {t('blogLireArticle')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Grille d'articles */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.map(article => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="group flex flex-col bg-cream-deep border border-ink/10 rounded-2xl overflow-hidden hover:border-ink/20 transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden relative bg-cream-deep">
                    <img
                      src={imgUrl(article.image, { w: 600, q: 65 })}
                      alt={pickTitle(article, lang)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => handleCoverError(e, article.id ?? article.slug)}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-ink/70 text-silver-light text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                        {catLabel(article.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-ink-soft text-xs mb-3 font-medium">
                      <time dateTime={article.date}>{new Date(article.date).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                    </div>
                    <h3 className="text-xl font-serif text-ink mb-3 group-hover:text-silver transition-colors leading-snug">
                      {pickTitle(article, lang)}
                    </h3>
                    <p className="text-ink-soft text-sm mb-6 flex-1 line-clamp-3">
                      {pickExcerpt(article, lang)}
                    </p>
                    <div className="flex items-center gap-2 text-silver font-bold text-xs uppercase tracking-widest mt-auto">
                      {t('blogLire')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
