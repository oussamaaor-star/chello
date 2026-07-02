import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Package, Users, TrendingUp,
  Clock, AlertTriangle, CreditCard,
  CheckCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/adminFormat';
import {
  RevenueAreaChart, StatusBars, StatCard, MiniStatCard,
  RecentOrdersCard, RecentProductsCard,
} from '../../components/admin/DashboardWidgets';

// ── Build empty 7-day skeleton (Mon..Sun style labels) ────────────────────────

function build7DaySkeleton() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
      total: 0,
    });
  }
  return days;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats]             = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stockData, setStockData]     = useState([]);
  const [productsCount, setProductsCount] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading]         = useState(true);

  // ── Derived from stockData ────────────────────────────────────────

  const outOfStockCount = useMemo(
    () => stockData.filter((s) => s.stock === 0).length,
    [stockData],
  );

  // ── Data fetching ─────────────────────────────────────────────────

  const loadAll = async () => {
    setLoading(true);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [statsRes, ordersRes, stockRes, productsCountRes, topProductsRes, revenueRes, statusRes] = await Promise.all([
      supabase.rpc('admin_get_stats'),
      supabase.rpc('admin_get_recent_orders', { lim: 5 }),
      supabase.from('product_stock').select('product_id, stock'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('products').select('id, name, category, images').eq('active', true).order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('created_at, total, status').gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('orders').select('status'),
    ]);

    if (!statsRes.error) {
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

    // Group revenue by day for the 7-day area chart
    const skeleton = build7DaySkeleton();
    if (!revenueRes.error && revenueRes.data) {
      const byDay = {};
      revenueRes.data.forEach((o) => {
        if (o.status === 'cancelled') return; // exclude cancelled from revenue
        const key = new Date(o.created_at).toISOString().slice(0, 10);
        byDay[key] = (byDay[key] || 0) + Number(o.total || 0);
      });
      skeleton.forEach((d) => { d.total = byDay[d.key] || 0; });
    }
    setRevenueSeries(skeleton);

    // Count orders by status for the bars — on garde les 6 statuts réels
    // de la DB sans les fusionner (cohérence avec AdminOrders).
    if (!statusRes.error && statusRes.data) {
      const counts = {};
      statusRes.data.forEach((o) => {
        counts[o.status] = (counts[o.status] || 0) + 1;
      });
      setStatusCounts(counts);
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
          <h1 className="font-serif text-2xl text-ink">Dashboard</h1>
          <p className="text-sm text-ink-soft mt-0.5">Overview of your store.</p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/8 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Row 1 : KPI Stats ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-3">
          Overview
        </p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Orders"
            value={stats?.total_orders != null ? Number(stats.total_orders).toLocaleString('en-US') : null}
            icon={ShoppingBag}
            iconBg="bg-ink"
            iconColor="text-cream"
            sub="All time"
            loading={loading}
          />
          <StatCard
            label="Revenue"
            value={revenueFormatted}
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            sub="Paid orders"
            loading={loading}
          />
          <StatCard
            label="Catalog"
            value={productsCount != null ? productsCount.toLocaleString('en-US') : null}
            icon={Package}
            iconBg="bg-silver/15"
            iconColor="text-silver-deep"
            sub="Active products"
            loading={loading}
          />
          <StatCard
            label="Users"
            value={stats?.total_users != null ? Number(stats.total_users).toLocaleString('en-US') : null}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            sub="Registered"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Row 2 : Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAreaChart series={revenueSeries} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <StatusBars counts={statusCounts} loading={loading} />
        </div>
      </div>

      {/* ── Row 3 : Stats secondaires ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-3">
          Operational Details
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStatCard
            label="Pending"
            value={stats?.pending_orders != null ? Number(stats.pending_orders) : null}
            icon={Clock}
            classes="bg-amber-50 text-amber-600"
            loading={loading}
          />
          <MiniStatCard
            label="Delivered"
            value={stats?.delivered_orders != null ? Number(stats.delivered_orders) : null}
            icon={CheckCircle}
            classes="bg-emerald-50 text-emerald-600"
            loading={loading}
          />
          <MiniStatCard
            label="Out of Stock"
            value={outOfStockCount}
            icon={AlertTriangle}
            classes="bg-red-50 text-red-500"
            loading={loading && stockData.length === 0}
          />
          <MiniStatCard
            label="Avg. Order"
            value={avgFormatted}
            icon={CreditCard}
            classes="bg-indigo-50 text-indigo-600"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Row 4 : Blocs info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <RecentOrdersCard orders={recentOrders} loading={loading} />
        <RecentProductsCard products={topProducts} loading={loading} />
      </div>
    </div>
  );
}
