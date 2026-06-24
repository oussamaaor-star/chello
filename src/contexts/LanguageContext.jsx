import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    const isAr = lang === 'ar';
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.style.fontFamily = isAr ? "'Cairo', Georgia, serif" : '';
    // La police Cairo ne sert qu'à l'arabe → on ne la charge qu'à ce moment-là.
    if (isAr && !document.getElementById('cairo-font')) {
      const link = document.createElement('link');
      link.id   = 'cairo-font';
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, [lang]);

  // Langue officielle : arabe. L'anglais est une option ; toute clé pas encore
  // traduite en anglais retombe sur l'arabe (jamais le français).
  const t = (key, vars = {}) => {
    let str = translations[lang]?.[key] ?? translations.ar[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  };

  const toggleLang = () => setLang((l) => (l === 'ar' ? 'en' : 'ar'));

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

const FALLBACK_T = (key) => translations.ar[key] ?? key;

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: 'ar', t: FALLBACK_T, toggleLang: () => {} };
  return ctx;
}
