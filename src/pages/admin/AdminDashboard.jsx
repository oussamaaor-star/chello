import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Users, TrendingUp,
  Clock, Truck, AlertTriangle, CreditCard,
  CheckCircle, XCircle,
  Loader2, RefreshCw, ChevronRight, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('ar-OM', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(amount) + ' ر.ع.';
}

function shortRef(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Status config (shared avec AdminOrders) ──────────────────────────────────

const ORDER_STATUS = {
  pending:    { label: 'En attente',   classes: 'bg-gray-100 text-gray-600',      icon: Clock       },
  confirmed:  { label: 'Confirmée',    classes: 'bg-blue-50 text-blue-700',       icon: CheckCircle },
  processing: { label: 'En cours',     classes: 'bg-amber-50 text-amber-700',     icon: Clock       },
  shipped:    { label: 'En livraison', classes: 'bg-indigo-50 text-indigo-700',   icon: Truck       },
  delivered:  { label: 'Livrée',       classes: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  cancelled:  { label: 'Annulée',      classes: 'bg-red-50 text-red-500',         icon: XCircle     },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, sub, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5 text-cream" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <div className="h-7 w-16 bg-cream-deep rounded-lg animate-pulse mb-1" />
        ) : (
          <p className="text-xl font-bold text-ink leading-none truncate">{value ?? '—'}</p>
        )}
        <p className="text-xs text-ink-soft font-medium mt-1 uppercase tracking-wider leading-none">{label}</p>
        {sub && !loading && (
          <p className="text-[11px] text-ink-soft mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Mini stat card (2e ligne) ────────────────────────────────────────────────

function MiniStatCard({ label, value, icon: Icon, classes, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-4 flex items-center gap-3">
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${classes}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div>
        {loading ? (
          <div className="h-5 w-10 bg-cream-deep rounded animate-pulse mb-1" />
        ) : (
          <p className="text-base font-bold text-ink leading-none">{value ?? '—'}</p>
        )}
        <p className="text-[11px] text-ink-soft mt-0.5 uppercase tracking-wider leading-none">{label}</p>
      </div>
    </div>
  );
}

// ─── Status badge (compact) ───────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg  = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.classes}`}>
      <Icon className="w-2.5 h-2.5 flex-shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats]             = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stockData, setStockData]     = useState([]);
  const [productsCount, setProductsCount] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [rpcUnavailable, setRpcUnavailable] = useState(false);

  // ── Derived from stockData ────────────────────────────────────────

  const outOfStockCount = useMemo(
    () => stockData.filter((s) => s.stock === 0).length,
    [stockData],
  );

  // ── Data fetching ─────────────────────────────────────────────────

  const loadAll = async () => {
    setLoading(true);
    setRpcUnavailable(false);

    const [statsRes, ordersRes, stockRes, productsCountRes, topProductsRes] = await Promise.all([
      supabase.rpc('admin_get_stats'),
      supabase.rpc('admin_get_recent_orders', { lim: 5 }),
      supabase.from('product_stock').select('product_id, stock'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('products').select('id, name, brand, images').eq('active', true).order('created_at', { ascending: false }).limit(5),
    ]);

    if (statsRes.error) {
      // RPC not yet deployed (migration pending) or access denied
      setRpcUnavailable(true);
    } else {
      setStats(statsRes.data);
    }

    if (!ordersRes.error && ordersRes.data) {
      setRecentOrders(ordersRes.data);
    }

    if (!stockRes.error && stockRes.data) {
      setStockData(stockRes.data);
    }

    if (!productsCountRes.error) {
      setProductsCount(productsCountRes.count ?? null);
    }

    if (!topProductsRes.error && topProductsRes.data) {
      setTopProducts(topProductsRes.data.map((p) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
      })));
    }

    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // ── Computed values ───────────────────────────────────────────────

  const avgFormatted = stats?.avg_order_value != null
    ? formatCurrency(stats.avg_order_value)
    : '—';

  const revenueFormatted = stats?.total_revenue != null
    ? formatCurrency(stats.total_revenue)
    : '—';

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink">Dashboard</h1>
          <p className="text-sm text-ink-soft mt-0.5">Vue d'ensemble de votre boutique.</p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* ── Migration warning ── */}
      {rpcUnavailable && !loading && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Migration 008 requise</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Les fonctions RPC admin ne sont pas encore déployées. Appliquez{' '}
              <code className="bg-amber-100 px-1 rounded">008_admin_rls.sql</code>{' '}
              dans Supabase Dashboard → SQL Editor pour activer les statistiques réelles.
            </p>
          </div>
        </div>
      )}

      {/* ── Row 1 : Stats primaires ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-3">
          Vue globale
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Commandes"
            value={stats?.total_orders != null ? Number(stats.total_orders).toLocaleString('fr-FR') : null}
            icon={ShoppingBag}
            iconBg="bg-ink"
            loading={loading}
          />
          <StatCard
            label="Chiffre d'affaires"
            value={revenueFormatted}
            icon={TrendingUp}
            iconBg="bg-emerald-600"
            sub="Commandes payées"
            loading={loading}
          />
          <StatCard
            label="Catalogue"
            value={productsCount != null ? productsCount.toLocaleString('fr-FR') : null}
            icon={Package}
            iconBg="bg-silver"
            sub="Produits actifs"
            loading={loading}
          />
          <StatCard
            label="Utilisateurs"
            value={stats?.total_users != null ? Number(stats.total_users).toLocaleString('fr-FR') : null}
            icon={Users}
            iconBg="bg-blue-600"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Row 2 : Stats secondaires ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-3">
          Détail opérationnel
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStatCard
            label="En attente"
            value={stats?.pending_orders != null ? Number(stats.pending_orders) : null}
            icon={Clock}
            classes="bg-amber-50 text-amber-600"
            loading={loading}
          />
          <MiniStatCard
            label="Livrées"
            value={stats?.delivered_orders != null ? Number(stats.delivered_orders) : null}
            icon={CheckCircle}
            classes="bg-emerald-50 text-emerald-600"
            loading={loading}
          />
          <MiniStatCard
            label="Rupture stock"
            value={outOfStockCount}
            icon={AlertTriangle}
            classes="bg-red-50 text-red-500"
            loading={loading && stockData.length === 0}
          />
          <MiniStatCard
            label="Panier moyen"
            value={avgFormatted}
            icon={CreditCard}
            classes="bg-indigo-50 text-indigo-600"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Row 3 : Blocs info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Dernières commandes (3/5) ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              Dernières commandes
            </h2>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink font-medium transition-colors"
            >
              Tout voir <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <ShoppingBag className="w-8 h-8 text-ink-soft/30 mb-3" />
              <p className="text-sm text-ink-soft">Aucune commande disponible.</p>
              {rpcUnavailable && (
                <p className="text-xs text-silver-deep mt-1">Migration 008 requise.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-ink/5">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 px-6 py-3.5 hover:bg-cream-deep/60 transition-colors"
                >
                  {/* Ref */}
                  <div className="flex-shrink-0 w-20">
                    <p className="text-xs font-bold text-ink font-mono tracking-wider">
                      #{shortRef(order.id)}
                    </p>
                    <p className="text-[10px] text-ink-soft mt-0.5">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Client */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">
                      {order.client_name ?? <span className="text-ink-soft">Invité</span>}
                    </p>
                    <p className="text-[11px] text-ink-soft truncate">{order.client_email ?? '—'}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Total */}
                  <p className="flex-shrink-0 text-sm font-bold text-ink w-16 text-right">
                    {Number(order.total).toFixed(3)} ر.ع.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Derniers produits (2/5) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              Derniers produits
            </h2>
            <Link
              to="/admin/products"
              className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink font-medium transition-colors"
            >
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Package className="w-8 h-8 text-ink-soft/30 mb-3" />
              <p className="text-sm text-ink-soft">Aucun produit.</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/5">
              {topProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream-deep/60 transition-colors"
                >
                  <span className={`flex-shrink-0 w-5 text-center text-xs font-bold tabular-nums ${
                    i === 0 ? 'text-silver' : 'text-ink-soft/40'
                  }`}>{i + 1}</span>

                  <div className="flex-shrink-0 w-9 h-10 rounded-xl overflow-hidden bg-cream-deep border border-ink/10">
                    <img
                      src={p.images?.[0] ?? '/products/placeholder-dresses.svg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate leading-snug">{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
