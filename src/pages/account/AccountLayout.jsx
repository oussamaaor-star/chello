import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../../components/ui/PageLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSEO } from '../../hooks/useSEO';
import { SEO_PRESETS } from '../../utils/seo';

// ─── Sidebar / mobile nav link ────────────────────────────────────────────────

function AccountNavLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-ink text-cream shadow-sm'
            : 'text-ink-soft hover:bg-cream-deep hover:text-ink'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </NavLink>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AccountLayout() {
  useSEO(SEO_PRESETS.account);
  const { isAuthenticated, loading, user, avatarUrl, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { to: '/compte/profil',    label: t('profileTitle'),  icon: User    },
    { to: '/compte/commandes', label: t('navCommandes'),  icon: Package },
    { to: '/compte/adresses',  label: t('navAdresses'),   icon: MapPin  },
  ];

  // Attendre la résolution de la session Supabase avant de décider
  if (loading) return <PageLoader />;

  // Route guard
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  // Redirect /compte → /compte/profil
  if (pathname === '/compte') return <Navigate to="/compte/profil" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Compact hero ── */}
      <div className="bg-cream-deep py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-ink-soft mb-5 uppercase tracking-wider">
            <Link
              to="/"
              className="hover:text-ink transition-colors"
            >
              {t('breadcrumbAccueil')}
            </Link>
            <ChevronRight className="w-3 h-3 opacity-50 rtl:rotate-180" />
            <span className="text-silver">{t('navMonCompte')}</span>
          </nav>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-silver/10 border border-silver/20 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={t('profilePhotoLabel')} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-silver select-none">{initials}</span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-silver-deep mb-0.5">{t('navBienvenue')}</p>
              <h1 className="text-xl font-serif italic text-ink leading-tight">
                {user?.name ?? t('navBienvenue')}
              </h1>
              <p className="text-sm text-ink-soft">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile tab nav ── */}
      <div className="lg:hidden bg-cream-deep border-b border-ink/10 overflow-x-auto">
        <div className="flex px-4 gap-1 py-2 min-w-max">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-ink text-cream'
                    : 'text-ink-soft hover:bg-cream'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 whitespace-nowrap transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('navDeconnexion')}
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + outlet ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Desktop sidebar — flux normal (Lenis casse `position: sticky`) */}
          <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
            <div className="bg-cream-deep rounded-2xl border border-ink/10 p-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <AccountNavLink key={item.to} {...item} />
              ))}

              <div className="my-2 border-t border-ink/10" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full text-start"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {t('navDeconnexion')}
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}
