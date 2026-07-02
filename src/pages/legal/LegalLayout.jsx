import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Layout partagé pour toutes les pages légales.
 * Thème clair cream/ink/silver cohérent avec l'identité Chello.
 */
export function LegalLayout({ title, updatedAt, children }) {
  const { t } = useLanguage();
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-gradient-to-br from-cream via-white to-cream py-12 sm:py-16 border-b border-silver-deep/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-ink-soft uppercase tracking-widest mb-5">
            <Link to="/" className="hover:text-ink transition-colors">{t('breadcrumbAccueil')}</Link>
            <ChevronRight className="w-3 h-3 opacity-50 rtl:rotate-180" />
            <span className="text-silver-deep">{title}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-ink leading-tight">{title}</h1>
          {updatedAt && (
            <p className="text-sm text-ink-soft mt-3">{t('legalLastUpdated')} {updatedAt}</p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-silver-deep/10 p-8 sm:p-12 shadow-sm">
          {children}
        </div>
      </div>

    </div>
  );
}

/**
 * Section avec titre h2 et séparateur.
 */
export function LegalSection({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-ink mb-4 pb-2 border-b border-silver-deep/20">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-ink-soft leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/**
 * Sous-section avec h3.
 */
export function LegalSub({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-bold text-ink mb-2">{title}</h3>
      <div className="space-y-2 text-sm text-ink-soft leading-relaxed">
        {children}
      </div>
    </div>
  );
}
