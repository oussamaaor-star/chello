import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ChevronRight, Package, Gem } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import categoriesData from '../../data/categories.json';

export function NavLinks() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname]);

  const handleMouseEnter = (menu) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

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
    <nav className="hidden lg:flex items-center gap-9 h-full">

      {/* ── MEGA MENU : CATÉGORIES ── */}
      <div
        className="h-full flex items-center"
        onMouseEnter={() => handleMouseEnter('categories')}
        onMouseLeave={handleMouseLeave}
      >
        <NavLink to="/catalogue" className={({ isActive }) => getNavLinkClass(isActive)}>
          {({ isActive }) => (
            <>
              {t('navCatalogue')}
              <span className={getUnderlineClass(isActive)} />
            </>
          )}
        </NavLink>

        <div className={`absolute top-full left-0 w-full transition-all duration-300 ease-out z-50 transform ${
          activeMenu === 'categories'
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible translate-y-2 pointer-events-none'
        }`}>
          <div className="absolute -top-4 left-0 right-0 h-4" />
          <div className="absolute inset-0 bg-cream border-b border-ink/10 shadow-[0_20px_40px_rgba(24,20,15,0.08)] -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-wrap gap-x-12 gap-y-6">
            {categoriesData.map((cat) => (
              <Link
                key={cat.slug}
                to={`/categorie/${cat.slug}`}
                className="text-2xl font-serif italic text-ink hover:text-silver-deep transition-colors flex items-center gap-2 group/link"
              >
                {isAr ? cat.label : cat.labelEn}
                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-silver rtl:rotate-180" />
              </Link>
            ))}
          </div>
        </div>
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
              {isAr ? 'تتبع' : 'Suivi'}
              <span className={getUnderlineClass(isActive)} />
            </>
          )}
        </NavLink>
      </div>

    </nav>
  );
}
