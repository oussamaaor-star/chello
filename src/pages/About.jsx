import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { ChevronRight, ShieldCheck, Sparkles, Truck, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  const VALUES = [
    { icon: ShieldCheck, titleKey: 'aboutVal1Title', textKey: 'aboutVal1Text' },
    { icon: Sparkles,    titleKey: 'aboutVal2Title', textKey: 'aboutVal2Text' },
    { icon: Truck,       titleKey: 'aboutVal3Title', textKey: 'aboutVal3Text' },
    { icon: Heart,       titleKey: 'aboutVal4Title', textKey: 'aboutVal4Text' },
  ];

  const TIMELINE = [
    { year: '2023', titleKey: 'aboutTL1Title', textKey: 'aboutTL1Text' },
    { year: '2024', titleKey: 'aboutTL2Title', textKey: 'aboutTL2Text' },
    { year: '2025', titleKey: 'aboutTL3Title', textKey: 'aboutTL3Text' },
  ];

  useSEO({
    title:       buildTitle(t('footerAPropos')),
    description: t('aboutSeoDesc'),
    canonical:   'https://chello-nine.vercel.app/a-propos',
  });

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-cream-deep py-16 md:py-24">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-gold/8 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-ink-soft uppercase tracking-wider">
            <Link to="/" className="hover:text-gold transition-colors">{t('breadcrumbAccueil')}</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-gold">{t('footerAPropos')}</span>
          </div>

          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-deep mt-8 mb-4">{t('aboutTitle')}</p>
          <h1 className="text-4xl lg:text-5xl font-serif italic text-ink mb-6 leading-tight">
            Chello,<br />
            <span className="text-gold">{t('aboutMission')}</span>
          </h1>
          <p className="text-ink-soft text-lg leading-relaxed max-w-2xl">
            {t('aboutSubtitle')}
          </p>
        </div>
      </div>

      {/* ── Story / Timeline ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-serif italic text-ink mb-10">{t('aboutTimelineTitle')}</h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-16 top-3 bottom-3 w-px bg-ink/10 hidden sm:block" />

          <div className="flex flex-col gap-10">
            {TIMELINE.map((step) => (
              <div key={step.year} className="flex gap-6 sm:gap-10 items-start">
                <div className="flex-shrink-0 w-12 sm:w-20 text-right">
                  <span className="text-gold font-bold text-sm sm:text-base">{step.year}</span>
                </div>
                <div className="relative flex-shrink-0 w-3 h-3 mt-1 hidden sm:block">
                  <div className="w-3 h-3 rounded-full bg-gold ring-4 ring-cream" />
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="text-ink font-semibold mb-2">{t(step.titleKey)}</h3>
                  <p className="text-ink-soft text-sm leading-relaxed">{t(step.textKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <div className="bg-cream-deep border-y border-ink/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif italic text-ink mb-10">{t('aboutValues')}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, titleKey, textKey }) => (
              <div key={titleKey} className="flex gap-4 p-6 bg-cream rounded-2xl border border-ink/10">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-ink font-semibold mb-1.5">{t(titleKey)}</h3>
                  <p className="text-ink-soft text-sm leading-relaxed">{t(textKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why Chello ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-cream-deep rounded-3xl border border-ink/10 p-8 md:p-12">
          <h2 className="text-2xl font-serif italic text-ink mb-4">{t('aboutDecantsTitle')}</h2>
          <p className="text-ink-soft leading-relaxed mb-4">
            {t('aboutDecantsP1')}
          </p>
          <p className="text-ink-soft leading-relaxed mb-4">
            {t('aboutDecantsP2')}
          </p>
          <p className="text-ink-soft leading-relaxed">
            {t('aboutDecantsP3')}
          </p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-cream-deep rounded-2xl border border-ink/10">
          <div>
            <p className="text-ink font-semibold">{t('aboutCtaTitle')}</p>
            <p className="text-ink-soft text-sm mt-0.5">{t('aboutCtaSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-full border border-ink/20 text-ink text-sm font-medium hover:bg-cream-deep transition-colors"
            >
              {t('contactTitle')}
            </Link>
            <Link
              to="/catalogue"
              className="px-5 py-2.5 rounded-full bg-ink text-cream text-sm font-bold hover:bg-ink/90 transition-colors"
            >
              {t('marquesVoirCatalogue')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
