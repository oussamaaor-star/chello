import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { NavLinks } from './NavLinks';
import { HeaderIcons } from './HeaderIcons';
import { MobileMenu } from './MobileMenu';
import { MenuToggleIcon } from '../ui/MenuToggleIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useScroll } from '../../hooks/useScroll';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen]     = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { t, toggleLang } = useLanguage();
  const scrolled = useScroll(20);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const heroMode = isHome && !scrolled && !isMobileMenuOpen && !isMobileSearchOpen;

  return (
    <>
      <header className={[
        'fixed top-0 left-0 right-0 z-40 w-full transition-all duration-500 ease-out',
        scrolled
          ? 'bg-cream/95 backdrop-blur-xl border-b border-ink/10 shadow-[0_4px_20px_rgba(24,20,15,0.06)]'
          : heroMode
            ? 'bg-transparent border-b border-transparent'
            : 'bg-cream border-b border-ink/10',
      ].join(' ')}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Mobile search overlay ── */}
          {isMobileSearchOpen ? (
            <div className="flex items-center gap-2 h-20 lg:hidden">
              <div className="flex-1">
                <SearchBar autoFocus onClose={() => setIsMobileSearchOpen(false)} />
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                aria-label={t('headerFermerRecherche')}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between h-20 lg:h-24">

              {/* Mobile — hamburger animé + search */}
              <div className="flex items-center gap-0.5 lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen((o) => !o)}
                  aria-label={isMobileMenuOpen ? t('headerFermerMenu') : t('headerOuvrirMenu')}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${heroMode ? 'text-cream hover:bg-white/10' : 'text-ink hover:bg-ink/5'}`}
                >
                  <MenuToggleIcon open={isMobileMenuOpen} className="w-5 h-5" duration={300} />
                </button>
                <button
                  onClick={toggleLang}
                  aria-label={t('headerChangerLangue')}
                  className={`flex lg:hidden w-8 h-8 items-center justify-center rounded-full border transition-colors text-[11px] font-bold tracking-wide ${heroMode ? 'border-cream/30 text-cream/70 hover:border-cream hover:text-cream' : 'border-ink/15 text-ink-soft hover:border-silver hover:text-silver-deep'}`}
                >
                  {t('langBtn')}
                </button>
              </div>

              {/* Logo — absolu centré sur xs/sm, dans le flux flex sur md+ */}
              <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-shrink-0 lg:flex-shrink-0">
                <NavLink to="/" aria-label={t('headerLogoLabel')} className="flex items-center gap-3 group">
                  <span className={`font-serif italic text-2xl lg:text-3xl tracking-wide transition-colors duration-500 ${heroMode ? 'text-cream group-hover:text-silver-light' : 'text-ink group-hover:text-silver-deep'}`}>
                    Chello
                  </span>
                </NavLink>
              </div>

              {/* Desktop search — hidden in hero mode */}
              <div className={`hidden lg:flex flex-1 justify-center px-4 lg:px-10 transition-opacity duration-500 ${heroMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <SearchBar />
              </div>

              {/* Icons */}
              <div className={`flex-shrink-0 flex items-center gap-0.5 transition-colors duration-500 ${heroMode ? '[&_button]:text-cream [&_a_button]:text-cream [&_span]:bg-cream [&_span]:text-ink' : ''}`}>
                <button
                  onClick={toggleLang}
                  aria-label={t('headerChangerLangue')}
                  className={`hidden lg:flex w-9 h-9 items-center justify-center rounded-full border transition-colors text-xs font-bold tracking-wide ${heroMode ? 'border-cream/30 text-cream/70 hover:border-cream hover:text-cream' : 'border-ink/15 text-ink-soft hover:border-silver hover:text-silver-deep'}`}
                >
                  {t('langBtn')}
                </button>
                <HeaderIcons />
              </div>
            </div>
          )}

          {/* Mobile/tablette — barre de recherche persistante (< lg) — hidden in hero mode */}
          {!isMobileSearchOpen && (
            <div className={`lg:hidden pb-3 -mt-1 transition-all duration-500 ${heroMode ? 'opacity-0 h-0 pb-0 overflow-hidden' : ''}`}>
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label={t('headerRechercher')}
                className="w-full flex items-center gap-2.5 h-11 px-4 rounded-full bg-cream-deep border border-ink/10 text-ink-soft text-sm hover:border-ink/20 active:scale-[0.99] transition-all"
              >
                <Search className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t('navRecherche')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop nav — hidden in hero mode */}
        <div className={`relative hidden lg:block border-t transition-all duration-500 ${heroMode ? 'border-transparent opacity-0 h-0 overflow-hidden' : 'border-ink/10'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center py-3">
            <NavLinks />
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
