import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Package, Gem } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MegaMenu } from './MegaMenu';

export function NavLinks() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const location = useLocation();

  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimeoutRef = useRef(null);

  // Close on route change.
  useEffect(() => {
    setMegaOpen(false);
  }, [location.pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMegaOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [megaOpen]);

  const openMega = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setMegaOpen(true);
  };

  // Small grace delay so the cursor can travel from the trigger to the panel.
  const scheduleClose = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setMegaOpen(false), 140);
  };

  useEffect(() => () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);

  const getNavLinkClass = (isActive) =>
    `relative text-xs font-semibold uppercase tracking-[0.15em] py-5 group flex items-center gap-1.5 transition-colors duration-200 ${
      isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
    }`;

  const getUnderlineClass = (isActive) => (
    `absolute bottom-3 left-0 right-0 h-px bg-ink transition-all duration-300 ease-out ${
      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100'
    }`
  );

  return (
    <>
      <nav className="hidden lg:flex items-center justify-center gap-9 h-full">

        {/* ── MEGA MENU TRIGGER : CATÉGORIES ── */}
        <div
          className="h-full flex items-center"
          onMouseEnter={openMega}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            onClick={() => setMegaOpen((o) => !o)}
            aria-expanded={megaOpen}
            aria-haspopup="true"
            className={`${getNavLinkClass(megaOpen)} cursor-pointer`}
          >
            {t('navCatalogue')}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`}
            />
            <span className={getUnderlineClass(megaOpen)} />
          </button>
        </div>

        {/* ── FIDÉLITÉ ── */}
        <div className="h-full flex items-center">
          <NavLink to="/fidelite" className={({ isActive }) => getNavLinkClass(isActive)}>
            {({ isActive }) => (
              <>
                <Gem className="w-3.5 h-3.5 flex-shrink-0" />
                {t('navFidelite')}
                <span className={getUnderlineClass(isActive)} />
              </>
            )}
          </NavLink>
        </div>

        {/* ── SUIVI DE COMMANDE ── */}
        <div className="h-full flex items-center">
          <NavLink to="/suivi" className={({ isActive }) => getNavLinkClass(isActive)}>
            {({ isActive }) => (
              <>
                <Package className="w-3.5 h-3.5 flex-shrink-0" />
                {isAr ? 'تتبع' : 'Tracking'}
                <span className={getUnderlineClass(isActive)} />
              </>
            )}
          </NavLink>
        </div>

      </nav>

      {/* Full-width centered mega panel — anchored to the header's nav row. */}
      <MegaMenu
        open={megaOpen}
        onNavigate={() => setMegaOpen(false)}
        onClose={() => setMegaOpen(false)}
        onMouseEnter={openMega}
        onMouseLeave={scheduleClose}
      />
    </>
  );
}
