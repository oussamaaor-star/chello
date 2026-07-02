import { useEffect } from 'react';
import { X, ChevronRight, ArrowUpRight, User, Heart, ShoppingBag, Globe, Package, Newspaper, Mail, HelpCircle } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { MEGA_CATEGORIES, catLabel } from './megaMenuData';

export function MobileMenu({ isOpen, onClose }) {
  const { isAuthenticated, user } = useAuth();
  const { items: wishlistItems }  = useWishlist();
  const { t, toggleLang, lang }    = useLanguage();
  const isRtl = lang === 'ar';
  // Focus initial + piège Tab + fermeture Échap + restauration du focus.
  const panelRef = useFocusTrap(isOpen, onClose);

  const accountPath = isAuthenticated ? '/compte/profil' : '/connexion';

  useEffect(() => {
    document.body.style.overflowY = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflowY = ''; };
  }, [isOpen]);

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isRtl ? 'القائمة' : 'Menu'}
        className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex w-full max-w-[85vw] flex-col bg-cream border-e border-ink/10 shadow-2xl transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateX(0)' : isRtl ? 'translateX(100%)' : 'translateX(-100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <p className="text-xl font-serif italic text-ink">Chello</p>
          <button
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors text-ink-soft hover:text-ink"
            aria-label={t('headerFermerMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User greeting */}
        {isAuthenticated && (
          <div className="px-5 py-3.5 bg-cream-deep border-b border-ink/10">
            <p className="text-[10px] text-silver-deep uppercase tracking-widest font-bold mb-0.5">{t('navBienvenue')}</p>
            <p className="text-sm font-semibold text-ink">{user?.name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft/70 mb-3">
            {t('navCategories')}
          </p>

          {/* Image-rich category grid */}
          <div className="grid grid-cols-2 gap-2.5 px-1 mb-3">
            {MEGA_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/categorie/${cat.slug}`}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className="group relative block overflow-hidden rounded-2xl aspect-[5/4] bg-cream-deep ring-1 ring-ink/5"
              >
                <img
                  src={cat.image}
                  alt={catLabel(cat, lang)}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-active:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-1">
                  <span className="font-serif italic text-base leading-tight text-cream drop-shadow">
                    {catLabel(cat, lang)}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-cream/90 flex-shrink-0 rtl:-scale-x-100" />
                </div>
              </Link>
            ))}
          </div>

          {/* All products + Loyalty rows */}
          <ul className="space-y-0.5 mb-6">
            <li>
              <NavLink to="/catalogue" onClick={onClose} tabIndex={isOpen ? 0 : -1} className={linkClass}>
                {t('navCatalogue')}
                <ChevronRight className="w-4 h-4 opacity-40 rtl:rotate-180" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/fidelite" onClick={onClose} tabIndex={isOpen ? 0 : -1} className={linkClass}>
                {t('navFidelite')}
                <ChevronRight className="w-4 h-4 opacity-40 rtl:rotate-180" />
              </NavLink>
            </li>
          </ul>

          <div className="h-px bg-ink/10 mb-4 mx-3" />

          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft/70 mb-2">
            {t('navMonEspace')}
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to={accountPath} onClick={onClose} tabIndex={isOpen ? 0 : -1} className={linkClass}>
                <span className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  {isAuthenticated ? t('navMonCompte') : t('navConnecter')}
                </span>
                <ChevronRight className="w-4 h-4 opacity-40 rtl:rotate-180" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/favoris" onClick={onClose} tabIndex={isOpen ? 0 : -1} className={linkClass}>
                <span className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  {t('navFavoris')}
                  {wishlistItems.length > 0 && (
                    <span className="ms-1 w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 opacity-40 rtl:rotate-180" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/suivi" onClick={onClose} tabIndex={isOpen ? 0 : -1} className={linkClass}>
                <span className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  {t('headerSuivi') || 'Track my order'}
                </span>
                <ChevronRight className="w-4 h-4 opacity-40 rtl:rotate-180" />
              </NavLink>
            </li>
          </ul>

          <div className="h-px bg-ink/10 my-4 mx-3" />

          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft/70 mb-2">
            {isRtl ? 'مساعدة' : 'Help & Info'}
          </p>
          <ul className="space-y-0.5">
            {[
              { to: '/blog',    icon: Newspaper,  label: t('navBlog') || 'Blog & Tips' },
              { to: '/contact', icon: Mail,       label: t('footerContact') || 'Contact' },
              { to: '/faq',     icon: HelpCircle, label: t('footerFaq') || 'FAQ' },
            ].map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink to={to} onClick={onClose} tabIndex={isOpen ? 0 : -1} className={linkClass}>
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-40 rtl:rotate-180" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer CTA */}
        <div className="p-4 border-t border-ink/10 space-y-2 bg-cream-deep">
          <NavLink
            to="/catalogue"
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            className="flex items-center justify-center gap-2 w-full py-3 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold uppercase tracking-wide transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('navDecouvrir')}
          </NavLink>
          <button
            onClick={() => { toggleLang(); onClose(); }}
            tabIndex={isOpen ? 0 : -1}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-ink/15 text-ink-soft rounded-full text-sm font-medium hover:bg-ink/5 hover:text-ink transition-colors"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </div>
  );
}
