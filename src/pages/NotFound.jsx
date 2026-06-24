import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search, ShoppingBag } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';
import categoriesData from '../data/categories.json';

export default function NotFound() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const QUICK_LINKS = [
    { to: '/catalogue', icon: ShoppingBag, label: t('navCatalogue') },
    ...categoriesData.slice(0, 3).map((cat) => ({
      to: `/categorie/${cat.slug}`,
      icon: Search,
      label: lang === 'ar' ? cat.label : cat.labelEn,
    })),
  ];

  useSEO({
    title: buildTitle(lang === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'),
    robots: 'noindex,nofollow',
  });

  return (
    <div className="bg-cream min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">

      {/* Big 404 */}
      <div className="relative mb-8 select-none">
        <p className="text-[120px] sm:text-[160px] font-serif italic text-cream-deep leading-none tracking-tighter">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-cream-deep flex items-center justify-center">
            <Search className="w-8 h-8 text-gold-deep" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Message */}
      <h1 className="text-2xl sm:text-3xl font-serif italic text-ink mb-3">
        {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}
      </h1>
      <p className="text-sm sm:text-base text-ink-soft max-w-sm leading-relaxed mb-10">
        {lang === 'ar' ? 'هذه الصفحة غير موجودة أو تم نقلها.' : 'This page does not exist or has been moved.'}
      </p>

      {/* Primary CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-12 justify-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-ink/15 text-ink rounded-full text-sm font-medium uppercase tracking-wide hover:border-ink transition-all"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t('retour')}
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          {t('notFoundRetour')}
        </Link>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft/60 mb-3">
          {t('voirTout')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center px-3 py-2.5 bg-cream-deep rounded-xl text-xs font-semibold text-ink-soft hover:text-gold-deep transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
