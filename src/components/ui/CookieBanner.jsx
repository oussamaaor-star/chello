import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const STORAGE_KEY = 'chello_cookie_consent';

export function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div role="region" aria-label={t('cookieBannerLabel')} className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-ink border-t border-ink/15 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <p className="text-cream/80 text-xs sm:text-sm leading-relaxed flex-1">
          {t('cookieText')}{' '}
          <Link to="/politique-confidentialite" className="text-gold-light underline hover:text-gold">
            {t('cookiePolitique')}
          </Link>.
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={accept}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-cream text-xs font-bold rounded-xl transition-colors"
          >
            {t('cookieAccept')}
          </button>
          <button onClick={accept} aria-label={t('fermer')} className="w-11 h-11 flex items-center justify-center rounded-xl text-cream/50 hover:text-cream hover:bg-cream/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
