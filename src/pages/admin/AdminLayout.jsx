import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Tag, Users, Star, LogOut, ChevronRight, Gem, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../../components/ui/PageLoader';
import { supabase } from '../../lib/supabase';
import { useSEO } from '../../hooks/useSEO';

// ─── Notification sound via Web Audio API ─────────────────────────────────────

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [0, 0.15, 0.3].forEach((offset, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880 + i * 220;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.4, now + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
      osc.start(now + offset);
      osc.stop(now + offset + 0.25);
    });
  } catch {
    // Audio not available
  }
}

// ─── Navigation items ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/orders',   label: 'Orders',       icon: ShoppingBag, notif: true },
  { to: '/admin/products', label: 'Products',     icon: Package },
  { to: '/admin/promos',   label: 'Promo Codes',  icon: Tag },
  { to: '/admin/loyalty',  label: 'Loyalty',      icon: Gem },
  { to: '/admin/users',    label: 'Users',        icon: Users },
  { to: '/admin/reviews',  label: 'Reviews',      icon: Star  },
];

// ─── Sidebar link ─────────────────────────────────────────────────────────────

function AdminNavLink({ to, label, icon: Icon, end, badge, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
          isActive
            ? 'bg-cream/10 text-cream font-semibold'
            : 'text-cream/55 hover:bg-cream/5 hover:text-cream/90 font-medium'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* active accent bar */}
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-silver-light transition-all ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-silver-light' : ''}`} />
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

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const { isAuthenticated, loading, user, role, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [newOrders, setNewOrders] = useState(0);
  const channelRef = useRef(null);
  const mobileNavRef = useRef(null);

  useSEO({ title: 'Administration — Chello', robots: 'noindex,nofollow' });

  // Reset badge when navigating to orders page
  useEffect(() => {
    if (location.pathname === '/admin/orders') {
      setNewOrders(0);
    }
  }, [location.pathname]);

  // Mobile : faire défiler la barre d'onglets pour que l'onglet ACTIF soit visible
  // (sinon on reste bloqué au début et l'onglet courant est hors écran).
  useEffect(() => {
    const active = mobileNavRef.current?.querySelector('[aria-current="page"]');
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [location.pathname]);

  // Subscribe to new orders via Supabase Realtime
  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') return;

    // Le WebSocket peut échouer (navigation privée, VPN/Private Relay, in-app
    // browser → "WebSocket: The operation is insecure"). Les notifs live sont
    // optionnelles : on ne doit JAMAIS faire planter l'admin pour autant.
    let channel;
    try {
      channel = supabase
        .channel('admin-orders')
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
      if (import.meta.env.DEV) console.warn('[realtime admin] indisponible:', err);
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isAuthenticated, role]);

  const clearBadge = useCallback(() => setNewOrders(0), []);

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: location }} replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    // Interface admin 100 % en anglais → on la force en LTR (le site est en RTL
    // par défaut, ce qui renversait titres/tableaux/ponctuation/chiffres).
    <div dir="ltr" className="min-h-screen bg-cream flex">

      {/* ── Sidebar (desktop) — fixe pleine hauteur, toujours visible ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-ink fixed inset-y-0 left-0 z-20">

        {/* Logo / brand */}
        <div className="px-6 pt-6 pb-5 border-b border-cream/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cream/5 border border-cream/10 flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-silver-light text-lg leading-none">C</span>
            </div>
            <div>
              <p className="font-serif text-cream text-lg leading-none tracking-wide">Chello</p>
              <p className="text-silver text-[9px] font-bold uppercase tracking-[0.25em] mt-1">Administration</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
          <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-cream/30">Menu</p>
          {NAV_ITEMS.map((item) => (
            <AdminNavLink
              key={item.to}
              {...item}
              badge={item.notif ? newOrders : 0}
              onClick={item.notif ? clearBadge : undefined}
            />
          ))}
        </nav>

        {/* Footer : user + logout */}
        <div className="px-3 py-4 border-t border-cream/10">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-cream/5">
            <div className="w-8 h-8 rounded-full bg-silver/20 border border-silver/20 flex items-center justify-center flex-shrink-0">
              <span className="text-silver-light text-xs font-bold">{user?.name?.[0]?.toUpperCase() ?? 'A'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-cream/85 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-cream/40 truncate leading-tight">{user?.email}</p>
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

      {/* ── Main area (décalée pour la sidebar fixe) ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* Top bar (mobile + desktop) */}
        <header className="bg-cream border-b border-ink/10 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-10">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
              <span className="font-serif text-silver-light text-sm leading-none">C</span>
            </div>
            <span className="font-serif text-base text-ink">Chello</span>
          </div>

          {/* Breadcrumb (desktop) */}
          <nav className="hidden lg:flex items-center gap-2 text-xs text-ink-soft">
            <span className="font-medium text-ink">Administration</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-silver-deep font-semibold">Chello</span>
          </nav>

          {/* Right: new-order indicator + user badge */}
          <div className="flex items-center gap-2">
            {newOrders > 0 && (
              <NavLink
                to="/admin/orders"
                onClick={clearBadge}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-silver text-cream rounded-full text-xs font-bold animate-pulse"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {newOrders} new order{newOrders > 1 ? 's' : ''}
              </NavLink>
            )}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-silver/10 text-silver-deep rounded-full text-[11px] font-bold uppercase tracking-wide border border-silver/20">
              Admin
            </span>
            <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center">
              <span className="text-silver-light text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile nav tabs */}
        <div ref={mobileNavRef} className="lg:hidden bg-cream border-b border-ink/10 overflow-x-auto">
          <div className="flex px-4 gap-1 py-2 min-w-max">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end, notif }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={notif ? clearBadge : undefined}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-ink text-cream'
                      : 'text-ink-soft hover:bg-cream-deep'
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
            <NavLink
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-silver-deep hover:bg-cream-deep whitespace-nowrap transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View site
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 whitespace-nowrap transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
