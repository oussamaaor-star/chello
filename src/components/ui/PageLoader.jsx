// Fallback affiché pendant le lazy loading des pages
// Design cohérent avec l'identité premium du site

import { useLanguage } from '../../contexts/LanguageContext';

export function PageLoader() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-cream-deep flex items-center justify-center">
          <span
            className="w-5 h-5 rounded-full border-2 border-silver/30 border-t-silver animate-spin"
            role="status"
            aria-label={t('loading')}
          />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft">
          {t('loading')}
        </p>
      </div>
    </div>
  );
}
