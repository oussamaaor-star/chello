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
  { to: '/caisse',          label: 'Daily POS',   icon: LayoutDashboard, end: true },
  { to: '/caisse/commandes', label: 'Orders',      icon: ShoppingBag, notif: true },
  { to: '/caisse/vente',    label: 'New Sale',      icon: ShoppingCart },
  { to: '/caisse/fidelite', label: 'Loyalty',       icon: Gem },
  { to: '/caisse/stock',    label: 'Stock',         icon: PackageSearch },
];

function CashierNavLink({ to, label, icon: Icon, end, badge, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-cream/10 text-cream font-semibold'
            : 'text-cream/55 hover:bg-cream/8 hover:text-cream'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-silver-light" />
          )}
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{label}</span>
          {badge > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-silver text-cream text-[10px] font-bold rounded-full flex items-center justify-center">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
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

    // WebSocket peut échouer (navigation privée, VPN/Private Relay…) → notifs
    // live optionnelles, ne jamais faire planter la caisse.
    let channel;
    try {
      channel = supabase
        .channel('cashier-orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
          setNewOrders((n) => n + 1);
          playNotifSound();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
          playNotifSound();
        })
        .subscribe();
      channelRef.current = channel;
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[realtime caisse] indisponible:', err);
    }
    return () => { if (channel) supabase.removeChannel(channel); };
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

      {/* Sidebar desktop — fixe pleine hauteur, toujours visible */}
      <aside className="hidden lg:flex flex-col w-60 bg-ink fixed inset-y-0 left-0 z-20">
        <div className="px-6 py-6 border-b border-cream/10">
          <p className="font-serif text-2xl text-cream leading-none tracking-tight">Chello</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Store className="w-3 h-3 text-silver" />
            <p className="text-silver text-[10px] font-bold uppercase tracking-widest">Caisse</p>
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
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-silver/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-silver-light text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'C'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-cream/80 truncate">{user?.name}</p>
              <p className="text-[10px] text-cream/40 truncate">{user?.email}</p>
            </div>
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-silver hover:bg-silver/10 transition-colors mb-1"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            View site
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main (décalée pour la sidebar fixe) */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <header className="bg-cream border-b border-ink/10 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-baseline gap-2 lg:hidden">
            <span className="font-serif text-lg text-ink leading-none">Chello</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-silver-deep">Caisse</span>
          </div>

          <nav className="hidden lg:flex items-center gap-2 text-xs text-ink-soft">
            <span className="font-medium text-ink">Caisse</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-silver-deep font-semibold">Chello</span>
          </nav>

          <div className="flex items-center gap-2">
            {newOrders > 0 && (
              <NavLink
                to="/caisse/commandes"
                onClick={clearBadge}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-silver text-cream rounded-full text-xs font-bold animate-pulse"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {newOrders} new
              </NavLink>
            )}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-wide border border-emerald-200">
              Cashier
            </span>
            <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center">
              <span className="text-silver-light text-xs font-bold">
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
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-silver text-cream text-[9px] font-bold rounded-full flex items-center justify-center">
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
              Log out
            </button>
          </div>
        </div>

        {/* No overflow-y-auto here: scrolling stays at the window level so it
            doesn't create an internal scroll container that fights global Lenis. */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
