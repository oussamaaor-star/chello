import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Gem, PackageSearch,
  LogOut, ChevronRight, Store, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../../components/ui/PageLoader';
import { supabase } from '../../lib/supabase';
import { useSEO } from '../../hooks/useSEO';

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [0, 0.15].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660 + i * 220;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.3, now + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);
      osc.start(now + offset);
      osc.stop(now + offset + 0.2);
    });
  } catch {}
}

const NAV_ITEMS = [
  { to: '/caisse',          label: 'Caisse du jour', icon: LayoutDashboard, end: true },
  { to: '/caisse/commandes', label: 'Commandes',     icon: ShoppingBag, notif: true },
  { to: '/caisse/vente',    label: 'Nouvelle vente', icon: ShoppingCart },
  { to: '/caisse/fidelite', label: 'Fidélité',       icon: Gem },
  { to: '/caisse/stock',    label: 'Stock',          icon: PackageSearch },
];

function CashierNavLink({ to, label, icon: Icon, end, badge, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-gold/15 text-gold-light font-semibold'
            : 'text-cream/60 hover:bg-cream/8 hover:text-cream'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-gold text-cream text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
}

const ALLOWED_ROLES = ['cashier', 'admin'];

export default function CashierLayout() {
  const { isAuthenticated, loading, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [newOrders, setNewOrders] = useState(0);
  const channelRef = useRef(null);

  useSEO({ title: 'Caisse — Chello', robots: 'noindex,nofollow' });

  useEffect(() => {
    if (location.pathname === '/caisse/commandes') setNewOrders(0);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !ALLOWED_ROLES.includes(role)) return;

    const channel = supabase
      .channel('cashier-new-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        setNewOrders((n) => n + 1);
        playNotifSound();
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, role]);

  const clearBadge = useCallback(() => setNewOrders(0), []);

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: location }} replace />;
  if (!ALLOWED_ROLES.includes(role)) return <Navigate to="/" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream flex">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-ink min-h-screen sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-cream/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4 text-cream" />
            </div>
            <div>
              <p className="text-cream font-bold text-sm leading-none">Chello</p>
              <p className="text-gold text-[10px] font-semibold uppercase tracking-widest mt-0.5">Caisse</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <CashierNavLink
              key={item.to}
              {...item}
              badge={item.notif ? newOrders : 0}
              onClick={item.notif ? clearBadge : undefined}
            />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-cream/10">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-semibold text-cream/80 truncate">{user?.name}</p>
            <p className="text-[10px] text-cream/40 truncate">{user?.email}</p>
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gold hover:bg-gold/10 transition-colors mb-1"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            Voir le site
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-cream border-b border-ink/10 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 bg-gold rounded-md flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-cream" />
            </div>
            <span className="text-sm font-bold text-ink">Caisse</span>
          </div>

          <nav className="hidden lg:flex items-center gap-2 text-xs text-ink-soft">
            <span className="font-medium text-ink">Caisse</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gold-deep font-semibold">Chello</span>
          </nav>

          <div className="flex items-center gap-2">
            {newOrders > 0 && (
              <NavLink
                to="/caisse/commandes"
                onClick={clearBadge}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-cream rounded-full text-xs font-bold animate-pulse"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {newOrders} nouvelle{newOrders > 1 ? 's' : ''}
              </NavLink>
            )}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-wide border border-emerald-200">
              Caissier
            </span>
            <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center">
              <span className="text-gold-light text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'C'}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden bg-cream border-b border-ink/10 overflow-x-auto">
          <div className="flex px-4 gap-1 py-2 min-w-max">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end, notif }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={notif ? clearBadge : undefined}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-cream-deep'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {notif && newOrders > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-gold text-cream text-[9px] font-bold rounded-full flex items-center justify-center">
                    {newOrders > 99 ? '99+' : newOrders}
                  </span>
                )}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
