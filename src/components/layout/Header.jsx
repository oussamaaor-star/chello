import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
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

  return (
    <>
      <header className={[
        'fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-out',
        scrolled
          ? 'bg-cream/95 backdrop-blur-xl border-b border-ink/10 shadow-[0_4px_20px_rgba(24,20,15,0.06)]'
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
                  className="w-10 h-10 flex items-center justify-center rounded-full text-ink hover:bg-ink/5 transition-colors"
                >
                  <MenuToggleIcon open={isMobileMenuOpen} className="w-5 h-5" duration={300} />
                </button>
                <button
                  onClick={toggleLang}
                  aria-label={t('headerChangerLangue')}
                  className="hidden sm:flex lg:hidden w-9 h-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:border-gold hover:text-gold-deep transition-colors text-xs font-bold tracking-wide"
                >
                  {t('langBtn')}
                </button>
              </div>

              {/* Logo — absolu centré sur xs/sm, dans le flux flex sur md+ */}
              <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-shrink-0 lg:flex-shrink-0">
                <NavLink to="/" aria-label={t('headerLogoLabel')} className="flex items-center gap-3 group">
                  <span className="font-serif italic text-2xl lg:text-3xl text-ink tracking-wide group-hover:text-gold-deep transition-colors duration-300">
                    Chello
                  </span>
                </NavLink>
              </div>

              {/* Desktop search */}
              <div className="hidden lg:flex flex-1 justify-center px-4 lg:px-10">
                <SearchBar />
              </div>

              {/* Icons */}
              <div className="flex-shrink-0 flex items-center gap-0.5">
                <button
                  onClick={toggleLang}
                  aria-label={t('headerChangerLangue')}
                  className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:border-gold hover:text-gold-deep transition-colors text-xs font-bold tracking-wide"
                >
                  {t('langBtn')}
                </button>
                <HeaderIcons />
              </div>
            </div>
          )}

          {/* Mobile/tablette — barre de recherche persistante (< lg) */}
          {!isMobileSearchOpen && (
            <div className="lg:hidden pb-3 -mt-1">
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

        {/* Desktop nav — toujours visible */}
        <div className="hidden lg:block border-t border-ink/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center py-3">
            <NavLinks />
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
