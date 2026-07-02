import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, TrendingUp, CreditCard, Clock,
  CheckCircle, XCircle, Truck, Receipt, Sparkles, Sunrise,
  Loader2, RefreshCw, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, shortRef } from '../../utils/cashierFormat';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const ORDER_STATUS = {
  pending:    { label: 'Pending',    classes: 'bg-amber-50 text-amber-600',     icon: Clock },
  confirmed:  { label: 'Confirmed',  classes: 'bg-blue-50 text-blue-700',       icon: CheckCircle },
  processing: { label: 'Processing', classes: 'bg-amber-50 text-amber-700',     icon: Clock },
  shipped:    { label: 'Shipping',   classes: 'bg-indigo-50 text-indigo-700',   icon: Truck },
  delivered:  { label: 'Delivered',  classes: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-50 text-red-500',         icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.classes}`}>
      <Icon className="w-2.5 h-2.5 flex-shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── KPI card (élevée, style éditorial premium) ──────────────────────────────
function KpiCard({ label, value, icon: Icon, iconBg, iconColor, sub, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {sub && !loading && (
          <span className="text-[10px] font-semibold text-ink-soft/70 bg-cream-deep rounded-full px-2 py-0.5 mt-1">
            {sub}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-cream-deep rounded-lg animate-pulse mt-4 mb-1.5" />
      ) : (
        <p className="text-2xl font-serif text-ink leading-none mt-4 truncate">{value ?? '—'}</p>
      )}
      <p className="text-[10px] text-ink-soft font-bold mt-2 uppercase tracking-widest leading-none">{label}</p>
    </div>
  );
}

// ─── Sparkline horaire (inline SVG, aucune dépendance) ───────────────────────
function HourlyChart({ buckets, peakHour }) {
  const W = 720;
  const H = 150;
  const padX = 10;
  const padTop = 14;
  const baseY = H - 26;
  const max = Math.max(1, ...buckets);
  const step = (W - padX * 2) / 23;

  const points = buckets.map((v, i) => {
    const x = padX + i * step;
    const y = padTop + (baseY - padTop) * (1 - v / max);
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${baseY} L${points[0][0].toFixed(1)},${baseY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none" role="img" aria-label="Sales through the day">
      <defs>
        <linearGradient id="cashierSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18140f" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#18140f" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke="#18140f" strokeOpacity="0.08" strokeWidth="1" />

      <path d={areaPath} fill="url(#cashierSpark)" />
      <path d={linePath} fill="none" stroke="#18140f" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* dots on hours with sales */}
      {points.map(([x, y], i) => (
        buckets[i] > 0 ? (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === peakHour ? 4 : 2.5}
            fill={i === peakHour ? '#18140f' : '#9e9e9e'}
          />
        ) : null
      ))}

      {/* hour ticks */}
      {[0, 6, 12, 18, 23].map((h) => (
        <text
          key={h}
          x={padX + h * step}
          y={H - 6}
          textAnchor={h === 0 ? 'start' : h === 23 ? 'end' : 'middle'}
          className="fill-ink-soft"
          fontSize="11"
          fontWeight="600"
        >
          {String(h).padStart(2, '0')}h
        </text>
      ))}
    </svg>
  );
}

export default function CashierDashboard() {
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadToday = async () => {
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    setTodayOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadToday(); }, []);

  const validOrders = useMemo(
    () => todayOrders.filter((o) => o.status !== 'cancelled'),
    [todayOrders],
  );

  const totalSales = useMemo(
    () => validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [validOrders],
  );

  const orderCount = validOrders.length;
  const pendingCount = todayOrders.filter((o) => o.status === 'pending').length;

  const itemsSold = useMemo(
    () => validOrders.reduce(
      (sum, o) => sum + (Array.isArray(o.items) ? o.items.reduce((n, it) => n + Number(it.quantity || 0), 0) : 0),
      0,
    ),
    [validOrders],
  );

  const avgBasket = orderCount > 0 ? totalSales / orderCount : 0;

  // 24 buckets : revenu encaissé par heure (basé sur created_at déjà chargé)
  const hourlyBuckets = useMemo(() => {
    const buckets = new Array(24).fill(0);
    validOrders.forEach((o) => {
      const h = new Date(o.created_at).getHours();
      buckets[h] += Number(o.total || 0);
    });
    return buckets;
  }, [validOrders]);

  const peakHour = useMemo(() => {
    let idx = -1, best = 0;
    hourlyBuckets.forEach((v, i) => { if (v > best) { best = v; idx = i; } });
    return idx;
  }, [hourlyBuckets]);

  const lastSale = validOrders[0] ?? null;

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink">Today's Register</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={loadToday}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-3">Till summary</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Today's Sales"
            value={orderCount}
            icon={ShoppingBag}
            iconBg="bg-ink"
            iconColor="text-cream"
            loading={loading}
          />
          <KpiCard
            label="Collected"
            value={formatCurrency(totalSales)}
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            loading={loading}
          />
          <KpiCard
            label="Items Sold"
            value={itemsSold}
            icon={Receipt}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            loading={loading}
          />
          <KpiCard
            label="Pending"
            value={pendingCount}
            icon={CreditCard}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Chart + glance band ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Sales through the day (3/5) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-ink/8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
              Sales through the day
            </h2>
            {peakHour >= 0 && !loading && (
              <span className="text-[11px] text-ink-soft">
                Peak <span className="font-semibold text-ink">{String(peakHour).padStart(2, '0')}:00</span>
              </span>
            )}
          </div>

          <div className="px-4 sm:px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center h-[150px]">
                <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
              </div>
            ) : orderCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-[150px] text-center">
                <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-3">
                  <Sunrise className="w-6 h-6 text-silver" />
                </div>
                <p className="text-sm font-semibold text-ink">The till is fresh for today</p>
                <p className="text-xs text-ink-soft mt-0.5">Sales will plot here as they come in.</p>
              </div>
            ) : (
              <HourlyChart buckets={hourlyBuckets} peakHour={peakHour} />
            )}
          </div>
        </div>

        {/* At a glance (2/5) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink/8 shadow-sm p-6 flex flex-col">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-4">At a glance</h2>

          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Average basket</span>
              {loading ? (
                <div className="h-4 w-16 bg-cream-deep rounded animate-pulse" />
              ) : (
                <span className="text-sm font-bold text-ink">{formatCurrency(avgBasket)}</span>
              )}
            </div>
            <div className="h-px bg-ink/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Items per sale</span>
              {loading ? (
                <div className="h-4 w-10 bg-cream-deep rounded animate-pulse" />
              ) : (
                <span className="text-sm font-bold text-ink">
                  {orderCount > 0 ? (itemsSold / orderCount).toFixed(1) : '—'}
                </span>
              )}
            </div>
            <div className="h-px bg-ink/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Last sale</span>
              {loading ? (
                <div className="h-4 w-14 bg-cream-deep rounded animate-pulse" />
              ) : (
                <span className="text-sm font-bold text-ink">
                  {lastSale ? formatTime(lastSale.created_at) : '—'}
                </span>
              )}
            </div>
          </div>

          <Link
            to="/caisse/vente"
            className="mt-6 flex items-center justify-center gap-2 bg-ink text-cream rounded-xl py-3 text-sm font-bold hover:bg-ink/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Start a new sale
          </Link>
        </div>
      </div>

      {/* ── Dernières commandes du jour ── */}
      <div className="bg-white rounded-2xl border border-ink/8 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
            Today's Orders
          </h2>
          <Link
            to="/caisse/commandes"
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink font-medium transition-colors"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
          </div>
        ) : todayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-silver" />
            </div>
            <p className="text-sm font-semibold text-ink">No sales recorded yet</p>
            <p className="text-xs text-ink-soft mt-1 max-w-xs">
              Ring up the first sale of the day and it will appear right here.
            </p>
            <Link
              to="/caisse/vente"
              className="mt-5 inline-flex items-center gap-2 bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-ink/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              New Sale
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {todayOrders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-cream-deep/60 transition-colors"
              >
                <div className="flex-shrink-0 w-20">
                  <p className="text-xs font-bold text-ink font-mono tracking-wider">
                    #{shortRef(order.id)}
                  </p>
                  <p className="text-[10px] text-ink-soft mt-0.5">{formatTime(order.created_at)}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">
                    {order.full_name ?? <span className="text-ink-soft">Client</span>}
                  </p>
                </div>

                <div className="flex-shrink-0 hidden sm:block">
                  <StatusBadge status={order.status} />
                </div>

                <p className="flex-shrink-0 text-sm font-bold text-ink w-20 text-right">
                  {formatCurrency(order.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
