import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Truck, RotateCcw, Shield, Clock, Banknote } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Accordion item ───────────────────────────────────────────────────────────

function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border border-ink/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-cream-deep hover:bg-cream transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-ink">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-ink-soft flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 bg-cream-deep border-t border-ink/10">
          <p className="text-sm text-ink-soft leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Accordion category ───────────────────────────────────────────────────────

function Category({ category, openMap, onToggle }) {
  const { id, icon: Icon, label, color, items } = category;
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-base font-serif italic text-ink">{label}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const key = `${id}-${i}`;
          return (
            <AccordionItem
              key={key}
              question={item.q}
              answer={item.a}
              isOpen={openMap[key] === true}
              onToggle={() => onToggle(key)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FAQ() {
  const { t } = useLanguage();

  const FAQ_CATEGORIES = [
    {
      id: 'livraison',
      icon: Truck,
      label: t('faqLivCat'),
      color: 'bg-blue-50 text-blue-600',
      items: [
        { q: t('faqLivQ1'), a: t('faqLivA1') },
        { q: t('faqLivQ2'), a: t('faqLivA2') },
        { q: t('faqLivQ3'), a: t('faqLivA3') },
        { q: t('faqLivQ4'), a: t('faqLivA4') },
      ],
    },
    {
      id: 'retours',
      icon: RotateCcw,
      label: t('faqRetCat'),
      color: 'bg-silver/10 text-silver',
      items: [
        { q: t('faqRetQ1'), a: t('faqRetA1') },
        { q: t('faqRetQ2'), a: t('faqRetA2') },
        { q: t('faqRetQ3'), a: t('faqRetA3') },
      ],
    },
    {
      id: 'authenticite',
      icon: Shield,
      label: t('faqAuthCat'),
      color: 'bg-emerald-50 text-emerald-600',
      items: [
        { q: t('faqAuthQ1'), a: t('faqAuthA1') },
        { q: t('faqAuthQ2'), a: t('faqAuthA2') },
        { q: t('faqAuthQ3'), a: t('faqAuthA3') },
      ],
    },
    {
      id: 'delais',
      icon: Clock,
      label: t('faqDelCat'),
      color: 'bg-purple-50 text-purple-600',
      items: [
        { q: t('faqDelQ1'), a: t('faqDelA1') },
        { q: t('faqDelQ2'), a: t('faqDelA2') },
        { q: t('faqDelQ3'), a: t('faqDelA3') },
      ],
    },
    {
      id: 'paiement',
      icon: Banknote,
      label: t('faqPayCat'),
      color: 'bg-emerald-50 text-emerald-600',
      items: [
        { q: t('faqPayQ1'), a: t('faqPayA1') },
        { q: t('faqPayQ2'), a: t('faqPayA2') },
        { q: t('faqPayQ3'), a: t('faqPayA3') },
        { q: t('faqPayQ4'), a: t('faqPayA4') },
      ],
    },
  ];

  useSEO({
    title:       buildTitle(t('faqSeoTitle')),
    description: 'Frequently asked questions about Chello: delivery in Oman, authenticity, payment on delivery, returns.',
    keywords:    'faq chello oman, delivery oman, fashion oman, payment delivery oman',
    canonical:   'https://chello-nine.vercel.app/faq',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_CATEGORIES.flatMap(cat =>
        cat.items.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        }))
      ),
    },
  });

  const [openMap, setOpenMap] = useState({});

  const toggle = (key) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-cream-deep py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-ink-soft uppercase tracking-widest mb-5">
            <Link to="/" className="hover:text-ink transition-colors">{t('breadcrumbAccueil')}</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-silver">{t('faqBreadcrumb')}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-ink mb-3 leading-tight">
            {t('faqTitle')}
          </h1>
          <p className="text-ink-soft text-sm sm:text-base max-w-md leading-relaxed">
            {t('faqSubtitle')}
          </p>

          {/* Catégories rapides */}
          <div className="flex flex-wrap gap-2 mt-8">
            {FAQ_CATEGORIES.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-3.5 py-1.5 bg-ink/5 hover:bg-ink/10 text-ink hover:text-ink text-xs font-medium rounded-full border border-ink/10 transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-12">
          {FAQ_CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id}>
              <Category category={cat} openMap={openMap} onToggle={toggle} />
            </section>
          ))}
        </div>

        {/* ── Bloc contact ── */}
        <div className="mt-14 p-6 bg-cream-deep rounded-2xl border border-ink/10 text-center">
          <p className="text-sm font-semibold text-ink mb-1">
            {t('faqContact')}
          </p>
          <p className="text-sm text-ink-soft mb-5">
            {t('faqSubtitleContact')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-full text-sm font-semibold hover:bg-ink/90 transition-colors"
          >
            {t('faqContactBtn')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
