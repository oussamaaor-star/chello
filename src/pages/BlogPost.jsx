import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Tag, BookOpen } from 'lucide-react';
import { blogArticles } from '../data/blog';
import categoriesData from '../data/categories.json';
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

export default function BlogPost() {
  const { t, lang } = useLanguage();
  const { slug } = useParams();
  
  // Trouver l'article correspondant
  const article = blogArticles.find(a => a.slug === slug);

  // Articles liés : même catégorie, excluant l'article courant
  const relatedArticles = article
    ? blogArticles.filter(a => a.id !== article.id && a.category === article.category).slice(0, 3)
    : [];

  // CTA « Voir la sélection » : on ne pointe vers /categorie/<slug> que si la
  // catégorie existe réellement (categories.json) — sinon repli sur le catalogue
  // complet. Évite les CTA cassés (ex. articles femme → catégorie inexistante).
  const knownCategorySlugs = new Set(categoriesData.map((c) => c.slug));
  const relatedCategoryTo = article && knownCategorySlugs.has(article.relatedCategorySlug)
    ? `/categorie/${article.relatedCategorySlug}`
    : '/catalogue';

  useSEO(article ? {
    title: `${article.title} | Chello`,
    description: article.excerpt,
    ogImage: article.image,
    ogType: 'article',
    canonical: `https://chello-nine.vercel.app/blog/${article.slug}`,
    keywords: `chello, ${article.category.toLowerCase()}, fashion oman`,
  } : { title: 'Blog | Chello' });

  if (!article) return <Navigate to="/blog" replace />;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.image,
    "datePublished": article.date,
    "dateModified": article.date,
    "author": { "@type": "Organization", "name": "Chello", "url": "https://chello-nine.vercel.app" },
    "publisher": {
      "@type": "Organization",
      "name": "Chello",
      "logo": { "@type": "ImageObject", "url": "https://chello-nine.vercel.app/logo.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://chello-nine.vercel.app/blog/${article.slug}` }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": t('breadcrumbAccueil'), "item": "https://chello-nine.vercel.app/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://chello-nine.vercel.app/blog" },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://chello-nine.vercel.app/blog/${article.slug}` },
    ]
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      
      {/* Hero Header de l'article */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 bg-ink border-b border-ink/15">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={imgUrl(article.image, { w: 1400, q: 75 })}
            alt={article.title}
            className="w-full h-full object-cover opacity-20"
            fetchPriority="high"
            decoding="async"
            onError={(e) => handleCoverError(e, article.id ?? article.slug)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-cream/60 hover:text-cream transition-colors text-sm font-semibold mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t('blogRetour')}
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-gold text-cream text-[10px] font-bold uppercase tracking-widest rounded-full">
              {article.category}
            </span>
            <span className="text-cream/70 text-xs flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" /> {article.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-cream mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="text-cream/60 text-sm font-medium">
            {t('blogPublie')} <time dateTime={article.date}>{new Date(article.date).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </div>
        </div>
      </div>

      {/* Contenu de l'article */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 relative z-10">
        <div className="bg-cream-deep/80 backdrop-blur-xl border border-ink/10 rounded-3xl p-6 sm:p-12 shadow-2xl">
          
          {/* Outils de partage & Auteur */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-ink/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center p-2 border border-ink/10">
                <img src="/logo.png" alt="Chello" className="max-w-full max-h-full object-contain" />
              </div>
              <div>
                <p className="text-ink text-sm font-bold">Chello</p>
                <p className="text-ink-soft/70 text-xs">{t('blogEditorLabel')}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert(t('blogLienCopie'));
                }
              }}
              className="flex items-center gap-2 text-ink-soft hover:text-gold transition-colors text-sm font-bold uppercase tracking-wider"
            >
              <Share2 className="w-4 h-4" /> {t('blogPartager')}
            </button>
          </div>

          {/* Corps du texte formaté en HTML injecté */}
          <div 
            className="max-w-none text-ink-soft
                       [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:text-ink [&>h2]:mt-10 [&>h2]:mb-6
                       [&>h3]:text-lg [&>h3]:text-ink [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3
                       [&>p]:text-ink-soft [&>p]:leading-relaxed [&>p]:mb-6
                       [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6
                       [&>ul>li]:text-ink-soft [&>ul>li]:mb-2
                       [&>p>strong]:text-ink [&>p>strong]:font-bold [&>li>strong]:text-ink [&>li>strong]:font-bold
                       [&>p>em]:text-ink-soft/70 [&>p>em]:italic"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tag de redirection (si défini) */}
          {article.relatedCategorySlug && (
            <div className="mt-12 pt-8 border-t border-ink/10">
              <div className="bg-ink border border-ink/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-cream font-bold mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gold" />
                    {t('blogPratiquer')}
                  </h4>
                  <p className="text-cream/60 text-sm">{t('blogPratiquerDesc')}</p>
                </div>
                <Link
                  to={relatedCategoryTo}
                  className="w-full sm:w-auto px-6 py-3 bg-gold hover:bg-gold-deep text-cream font-bold rounded-xl transition-all text-center text-sm"
                >
                  {t('blogVoirSel')}
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Articles liés — maillage interne SEO */}
      {relatedArticles.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-serif text-ink">{t('blogSimil')}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedArticles.map(related => (
              <Link
                key={related.id}
                to={`/blog/${related.slug}`}
                className="group flex flex-col bg-cream-deep border border-ink/10 rounded-2xl overflow-hidden hover:border-gold/30 transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={imgUrl(related.image, { w: 400, q: 65 })}
                    alt={related.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => handleCoverError(e, related.id ?? related.slug)}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-gold text-[10px] font-bold uppercase tracking-wider mb-2">{related.category}</span>
                  <h3 className="text-sm font-semibold text-ink group-hover:text-gold transition-colors leading-snug flex-1">
                    {related.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-ink-soft/70 text-xs mt-3">
                    <Clock className="w-3 h-3" /> {related.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
