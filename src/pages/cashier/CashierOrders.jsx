import { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle, Truck, XCircle, Loader2, RefreshCw, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { addLoyaltyVisitByPhone } from '../../utils/loyalty';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_CFG = {
  pending:    { label: 'En attente',   classes: 'bg-amber-50 text-amber-600',     icon: Clock },
  confirmed:  { label: 'Confirmée',    classes: 'bg-blue-50 text-blue-700',       icon: CheckCircle },
  processing: { label: 'En cours',     classes: 'bg-amber-50 text-amber-700',     icon: Clock },
  shipped:    { label: 'En livraison', classes: 'bg-indigo-50 text-indigo-700',   icon: Truck },
  delivered:  { label: 'Livrée',       classes: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  cancelled:  { label: 'Annulée',      classes: 'bg-red-50 text-red-500',         icon: XCircle },
};

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('ar-OM', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(amount) + ' ر.ع.';
}

function shortRef(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export default function CashierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const [loyaltyToast, setLoyaltyToast] = useState(null);

  const updateStatus = async (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    const wasDelivered = order?.status === 'delivered';
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);

    if (newStatus === 'delivered' && !wasDelivered && order?.phone) {
      const result = await addLoyaltyVisitByPhone(order.phone);
      if (result) {
        setLoyaltyToast(result);
        setTimeout(() => setLoyaltyToast(null), 5000);
      }
    }
  };

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const ref = shortRef(o.id).toLowerCase();
      const name = (o.full_name || '').toLowerCase();
      const phone = (o.phone || '').toLowerCase();
      if (!ref.includes(q) && !name.includes(q) && !phone.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Loyalty toast */}
      {loyaltyToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gold/30 shadow-xl rounded-2xl p-4 max-w-xs animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-gold" />
            <p className="text-sm font-bold text-ink">Fidélité +1</p>
          </div>
          <p className="text-xs text-ink-soft">
            {loyaltyToast.name} — {loyaltyToast.stamps}/8 tampons
            {loyaltyToast.rewardReady && ' 🎁 Récompense !'}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-serif text-ink">Commandes</h1>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher par ref, nom ou téléphone..."
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-ink/15 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          <option value="all">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CFG[s].label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-ink-soft text-center py-12">Aucune commande trouvée.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-xs font-bold text-ink tracking-wider">#{shortRef(order.id)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-semibold text-ink">{order.full_name}</p>
                  <p className="text-sm text-ink-soft">{order.phone} — {order.city}</p>
                  <p className="text-xs text-ink-soft/60 mt-1">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border border-ink/15 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                  ))}
                </select>
              </div>

              {order.address && <p className="text-sm text-ink-soft mb-2">{order.address}</p>}
              {order.notes && <p className="text-sm text-ink-soft/70 italic mb-2">{order.notes}</p>}

              <div className="border-t border-ink/5 pt-3 space-y-1">
                {(order.items ?? []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-ink-soft">
                    <span>{item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                    <span>{item.price != null ? formatCurrency(item.price * item.quantity) : '—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-ink mt-2 pt-2 border-t border-ink/5">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.classes}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}
