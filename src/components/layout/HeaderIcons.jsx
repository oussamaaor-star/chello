import { useEffect, useRef, useState } from 'react';
import { User, Heart, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useCartDrawer } from '../../hooks/useCartDrawer';
import { useLanguage } from '../../contexts/LanguageContext';

function IconButton({ children, badge, label, bump, ...props }) {
  return (
    <div className="relative group">
      <button
        className={`relative w-10 h-10 flex items-center justify-center rounded-full
                   text-ink transition-colors duration-200 hover:bg-ink/5 ${bump ? 'animate-cart-bump' : ''}`}
        aria-label={label}
        {...props}
      >
        {children}
      </button>

      {badge > 0 && (
        <span className="absolute top-0.5 -end-0.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-ink text-cream text-[9px] font-bold rounded-full pointer-events-none leading-none z-20">
          {badge > 9 ? '9+' : badge}
        </span>
      )}

      {label && (
        <span
          className="hidden lg:block pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2
                     px-2.5 py-1 rounded-md bg-ink
                     text-[10px] font-medium uppercase tracking-wider text-cream whitespace-nowrap
                     opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-200 z-30"
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function HeaderIcons() {
  const { items: wishlistItems } = useWishlist();
  const { totalItems } = useCart();
  const { isAuthenticated, role } = useAuth();
  const { open: openCart } = useCartDrawer();
  const { t } = useLanguage();

  // Rebond du panier à chaque ajout (détecte l'augmentation de totalItems).
  const [bump, setBump] = useState(false);
  const prevCount = useRef(totalItems);
  useEffect(() => {
    if (totalItems > prevCount.current) {
      setBump(true);
      const id = setTimeout(() => setBump(false), 480);
      prevCount.current = totalItems;
      return () => clearTimeout(id);
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  const accountPath = isAuthenticated ? '/compte/profil' : '/connexion';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {role === 'admin' && (
        <NavLink to="/admin" title={t('headerAdmin')}>
          <IconButton label={t('headerAdmin')}>
            <LayoutDashboard className="w-5 h-5" />
          </IconButton>
        </NavLink>
      )}

      <NavLink to="/favoris" className="hidden lg:block">
        <IconButton label={t('headerFavoris')} badge={wishlistItems.length}>
          <Heart className="w-5 h-5" />
        </IconButton>
      </NavLink>

      <NavLink to={accountPath}>
        <IconButton label={t('headerCompte')}>
          <User className="w-5 h-5" />
        </IconButton>
      </NavLink>

      {/* id : cible du vol d'image « flyToCart » (utils/microAnimations) */}
      <IconButton label={t('headerPanier')} badge={totalItems} bump={bump} onClick={openCart} id="header-cart-icon">
        <ShoppingBag className="w-5 h-5" />
      </IconButton>
    </div>
  );
}
