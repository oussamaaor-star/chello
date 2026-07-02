import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Clock, Truck,
  CheckCircle, XCircle,
  Loader2, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { formatCurrency, shortRef, formatDate } from '../../utils/adminFormat';

// ─── Status config — aligné sur les 6 statuts réels de la DB ──────────────────
// (pending, confirmed, processing, shipped, delivered, cancelled) — cf. AdminOrders.

export const ORDER_STATUS = {
  pending:    { label: 'Pending',    classes: 'bg-amber-50 text-amber-700',     icon: Clock,       hex: '#d97706' },
  confirmed:  { label: 'Confirmed',  classes: 'bg-blue-50 text-blue-700',       icon: CheckCircle, hex: '#2563eb' },
  processing: { label: 'Processing', classes: 'bg-indigo-50 text-indigo-700',   icon: Clock,       hex: '#4f46e5' },
  shipped:    { label: 'Shipped',    classes: 'bg-sky-50 text-sky-700',         icon: Truck,       hex: '#0284c7' },
  delivered:  { label: 'Delivered',  classes: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, hex: '#059669' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-50 text-red-500',         icon: XCircle,     hex: '#ef4444' },
};

// Ordre d'affichage des barres « Orders by status ».
export const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// ─── Hero area/line chart — Revenue last 7 days ───────────────────────────────

export function RevenueAreaChart({ series, loading }) {
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

export function StatusBars({ counts, loading }) {
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

export function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub, trend, loading }) {
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

export function MiniStatCard({ label, value, icon: Icon, classes, loading }) {
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

export function StatusBadge({ status }) {
  const cfg  = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.classes}`}>
      <Icon className="w-2.5 h-2.5 flex-shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── Dernières commandes (bloc 3/5) ───────────────────────────────────────────

export function RecentOrdersCard({ orders, loading }) {
  return (
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
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-ink-soft/50" />
          </div>
          <p className="text-sm font-medium text-ink">No orders yet</p>
          <p className="text-xs text-ink-soft mt-1">New orders will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-ink/5">
          {orders.map((order) => (
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
  );
}

// ─── Derniers produits (bloc 2/5) ─────────────────────────────────────────────

export function RecentProductsCard({ products, loading }) {
  return (
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
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-ink-soft/50" />
          </div>
          <p className="text-sm font-medium text-ink">No products</p>
        </div>
      ) : (
        <div className="divide-y divide-ink/5">
          {products.map((p, i) => (
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
  );
}
