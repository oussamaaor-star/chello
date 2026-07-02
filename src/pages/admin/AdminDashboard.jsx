import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Users, TrendingUp,
  Clock, AlertTriangle, CreditCard, Truck,
  CheckCircle, XCircle,
  Loader2, RefreshCw, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  if (amount == null) return '—';
  // Admin en anglais → chiffres latins + "OMR" (cohérent avec les autres écrans admin).
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(amount) + ' OMR';
}

function shortRef(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

// ─── Status config — aligné sur les 6 statuts réels de la DB ──────────────────
// (pending, confirmed, processing, shipped, delivered, cancelled) — cf. AdminOrders.

const ORDER_STATUS = {
  pending:    { label: 'Pending',    classes: 'bg-amber-50 text-amber-700',     icon: Clock,       hex: '#d97706' },
  confirmed:  { label: 'Confirmed',  classes: 'bg-blue-50 text-blue-700',       icon: CheckCircle, hex: '#2563eb' },
  processing: { label: 'Processing', classes: 'bg-indigo-50 text-indigo-700',   icon: Clock,       hex: '#4f46e5' },
  shipped:    { label: 'Shipped',    classes: 'bg-sky-50 text-sky-700',         icon: Truck,       hex: '#0284c7' },
  delivered:  { label: 'Delivered',  classes: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, hex: '#059669' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-50 text-red-500',         icon: XCircle,     hex: '#ef4444' },
};

// Ordre d'affichage des barres « Orders by status ».
const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// ─── Inline-SVG sparkline (KPI footer) ────────────────────────────────────────

function Sparkline({ data, stroke = '#18140f', fill = 'rgba(158,158,158,0.18)', height = 32 }) {
  const w = 120;
  const h = height;
  const pts = data && data.length > 1 ? data : [0, 0];
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const range = max - min || 1;
  const step = w / (pts.length - 1);

  const coords = pts.map((v, i) => {
    const x = i * step;
    const y = h - 4 - ((v - min) / range) * (h - 8);
    return [x, y];
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  const gid = `spark-${stroke.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Hero area/line chart — Revenue last 7 days ───────────────────────────────

function RevenueAreaChart({ series, loading }) {
  const W = 720;
  const H = 220;
  const padX = 8;
  const padTop = 18;
  const padBottom = 30;

  const hasData = series.some((d) => d.total > 0);
  const max = Math.max(...series.map((d) => d.total), 1);
  const n = series.length;
  const innerW = W - padX * 2;
  const chartH = H - padTop - padBottom;
  const step = n > 1 ? innerW / (n - 1) : innerW;

  const points = series.map((d, i) => {
    const x = padX + i * step;
    const y = hasData
      ? padTop + chartH - (d.total / max) * chartH
      : padTop + chartH * 0.55; // flat-ish baseline for empty state
    return [x, y];
  });

  // smooth path (Catmull-Rom-ish via mid-points)
  const linePath = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C${cx.toFixed(1)},${py.toFixed(1)} ${cx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L${(padX + (n - 1) * step).toFixed(1)},${padTop + chartH} L${padX},${padTop + chartH} Z`;

  const totalWeek = series.reduce((s, d) => s + d.total, 0);

  return (
    <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Revenue</p>
          <p className="text-sm text-ink-soft mt-1">Last 7 days</p>
        </div>
        <div className="text-right">
          {loading ? (
            <div className="h-7 w-24 bg-cream-deep rounded-lg animate-pulse" />
          ) : (
            <p className="font-serif text-2xl text-ink leading-none">{formatCurrency(totalWeek)}</p>
          )}
          {!loading && (
            <p className="text-[11px] text-ink-soft mt-1.5">
              {hasData ? 'Total this week' : 'Awaiting first sale'}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }} role="img" aria-label="Revenue last 7 days">
          <defs>
            <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(110,110,110,0.22)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* horizontal guides */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1={padX}
              x2={W - padX}
              y1={padTop + chartH * g}
              y2={padTop + chartH * g}
              stroke="#18140f"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          ))}

          {/* area + line */}
          <path d={areaPath} fill="url(#revArea)" />
          <path
            d={linePath}
            fill="none"
            stroke={hasData ? '#18140f' : '#9e9e9e'}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={hasData ? '0' : '4 5'}
            strokeOpacity={hasData ? 1 : 0.55}
          />

          {/* data dots */}
          {hasData && points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#18140f" strokeWidth="1.5" />
          ))}

          {/* day labels */}
          {series.map((d, i) => (
            <text
              key={i}
              x={padX + i * step}
              y={H - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#6e6e6e"
              fontFamily="inherit"
            >
              {d.label}
            </text>
          ))}
        </svg>

        {/* elegant empty-state caption */}
        {!hasData && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-3">
            <span className="text-xs text-ink-soft bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-ink/8">
              No sales data yet
            </span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders by status — horizontal bars ───────────────────────────────────────

function StatusBars({ counts, loading }) {
  const order = STATUS_ORDER;
  const total = order.reduce((s, k) => s + (counts[k] || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Orders by status</p>
        <span className="text-[11px] text-ink-soft">{total} total</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {order.map((k) => (
            <div key={k} className="h-3 bg-cream-deep rounded-full animate-pulse" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="space-y-4">
          {order.map((k) => {
            const cfg = ORDER_STATUS[k];
            return (
              <div key={k}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-ink-soft">{cfg.label}</span>
                  <span className="text-xs text-ink-soft tabular-nums">0</span>
                </div>
                <div className="h-2 rounded-full bg-cream-deep" />
              </div>
            );
          })}
          <p className="text-[11px] text-ink-soft pt-1">No orders yet — bars will fill as sales come in.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {order.map((k) => {
            const cfg = ORDER_STATUS[k];
            const v = counts[k] || 0;
            const pct = total ? Math.round((v / total) * 100) : 0;
            return (
              <div key={k}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-ink">{cfg.label}</span>
                  <span className="text-xs text-ink-soft tabular-nums">{v} · {pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-cream-deep overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, v > 0 ? 4 : 0)}%`, backgroundColor: cfg.hex }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── KPI stat card ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub, trend, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
        </div>
        {trend && !loading && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold">
            <ArrowUpRight className="w-2.5 h-2.5" />
            {trend}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-7 w-20 bg-cream-deep rounded-lg animate-pulse" />
      ) : (
        <p className="font-serif text-[26px] text-ink leading-none truncate">{value ?? '—'}</p>
      )}
      <p className="text-[9px] text-ink-soft font-bold mt-2 uppercase tracking-widest leading-none">{label}</p>
      {sub && !loading && (
        <p className="text-[10px] text-ink-soft mt-1 truncate">{sub}</p>
      )}
    </div>
  );
}

// ─── Mini stat card (2e ligne) ────────────────────────────────────────────────

function MiniStatCard({ label, value, icon: Icon, classes, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-4 flex items-center gap-3">
      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${classes}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        {loading ? (
          <div className="h-5 w-10 bg-cream-deep rounded animate-pulse mb-1" />
        ) : (
          <p className="text-lg font-bold text-ink leading-none truncate">{value ?? '—'}</p>
        )}
        <p className="text-[10px] text-ink-soft mt-1 uppercase tracking-widest leading-none">{label}</p>
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
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading]         = useState(true);

  // ── Derived from stockData ────────────────────────────────────────

  const outOfStockCount = useMemo(
    () => stockData.filter((s) => s.stock === 0).length,
    [stockData],
  );

  // ── Build empty 7-day skeleton (Mon..Sun style labels) ────────────

  const build7DaySkeleton = () => {
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
  };

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

  // Sparkline series derived from the 7-day data
  const revenueSpark = useMemo(() => revenueSeries.map((d) => d.total), [revenueSeries]);
  const ordersSpark = useMemo(() => {
    // approximate orders-per-day shape from revenue presence (purely visual)
    return revenueSeries.map((d) => (d.total > 0 ? 1 : 0));
  }, [revenueSeries]);

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
            spark={revenueSpark}
            sparkStroke="#059669"
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

        {/* ── Dernières commandes (3/5) ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-ink/8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink font-medium transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5 text-ink-soft/50" />
              </div>
              <p className="text-sm font-medium text-ink">No orders yet</p>
              <p className="text-xs text-ink-soft mt-1">New orders will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/5">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 px-6 py-3.5 hover:bg-cream-deep/50 transition-colors"
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
                      {order.client_name ?? <span className="text-ink-soft">Guest</span>}
                    </p>
                    <p className="text-[11px] text-ink-soft truncate">{order.client_email ?? '—'}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Total */}
                  <p className="flex-shrink-0 text-sm font-bold text-ink w-20 text-right">
                    {Number(order.total).toFixed(3)} OMR
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Derniers produits (2/5) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink/8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
              Recent Products
            </h2>
            <Link
              to="/admin/products"
              className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink font-medium transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-3">
                <Package className="w-5 h-5 text-ink-soft/50" />
              </div>
              <p className="text-sm font-medium text-ink">No products</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/5">
              {topProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream-deep/50 transition-colors"
                >
                  <span className={`flex-shrink-0 w-5 text-center text-xs font-bold tabular-nums ${
                    i === 0 ? 'text-silver-deep' : 'text-ink-soft/40'
                  }`}>{i + 1}</span>

                  <div className="flex-shrink-0 w-9 h-10 rounded-xl overflow-hidden bg-cream-deep border border-ink/8">
                    <img
                      src={p.images?.[0] ?? '/products/placeholder-dresses.svg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate leading-snug">{p.name}</p>
                    {p.category && (
                      <p className="text-[10px] text-ink-soft uppercase tracking-wide truncate mt-0.5">{p.category}</p>
                    )}
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
