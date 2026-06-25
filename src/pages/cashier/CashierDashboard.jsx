import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, TrendingUp, CreditCard, Clock,
  CheckCircle, XCircle, Truck,
  Loader2, RefreshCw, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('ar-OM', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(amount) + ' ر.ع.';
}

function shortRef(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const ORDER_STATUS = {
  pending:    { label: 'En attente',   classes: 'bg-amber-50 text-amber-600',     icon: Clock },
  confirmed:  { label: 'Confirmée',    classes: 'bg-blue-50 text-blue-700',       icon: CheckCircle },
  processing: { label: 'En cours',     classes: 'bg-amber-50 text-amber-700',     icon: Clock },
  shipped:    { label: 'En livraison', classes: 'bg-indigo-50 text-indigo-700',   icon: Truck },
  delivered:  { label: 'Livrée',       classes: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  cancelled:  { label: 'Annulée',      classes: 'bg-red-50 text-red-500',         icon: XCircle },
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

function StatCard({ label, value, icon: Icon, iconBg, loading }) {
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
      </div>
    </div>
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

  const totalSales = useMemo(
    () => todayOrders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total || 0), 0),
    [todayOrders],
  );

  const orderCount = todayOrders.filter((o) => o.status !== 'cancelled').length;
  const pendingCount = todayOrders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink">Caisse du jour</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={loadToday}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Ventes du jour"
          value={orderCount}
          icon={ShoppingBag}
          iconBg="bg-ink"
          loading={loading}
        />
        <StatCard
          label="Total encaissé"
          value={formatCurrency(totalSales)}
          icon={TrendingUp}
          iconBg="bg-emerald-600"
          loading={loading}
        />
        <StatCard
          label="En attente"
          value={pendingCount}
          icon={CreditCard}
          iconBg="bg-amber-500"
          loading={loading}
        />
      </div>

      {/* Dernières commandes du jour */}
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-soft">
            Commandes du jour
          </h2>
          <Link
            to="/caisse/commandes"
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink font-medium transition-colors"
          >
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
          </div>
        ) : todayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <ShoppingBag className="w-8 h-8 text-ink-soft/30 mb-3" />
            <p className="text-sm text-ink-soft">Aucune commande aujourd'hui.</p>
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
