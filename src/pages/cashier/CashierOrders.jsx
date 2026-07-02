import { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle, Truck, XCircle, Loader2, RefreshCw, Gift, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { findMemberByPhone, addPointsFromPurchase, getLoyaltyConfig } from '../../utils/loyalty';
import { formatCurrency, shortRef } from '../../utils/cashierFormat';

// In-store POS sales are already paid AND credited with loyalty points at the
// till (see CashierPOS.submitOrder). Re-crediting them when they later move to
// "delivered" would double-count, so we detect and skip them here. Online
// orders (created from the storefront, not paid at the register) earn their
// points once, on delivery.
function wasCreditedAtTill(order) {
  return order?.payment_method === 'cash' && order?.payment_status === 'paid';
}

async function downloadInvoice(order) {
  try {
    const { generateInvoice } = await import('../../utils/generateInvoice');
    generateInvoice(order);
  } catch (err) {
    console.error('[Invoice]', err.message);
  }
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_CFG = {
  pending:    { label: 'Pending',    classes: 'bg-amber-50 text-amber-600',     icon: Clock },
  confirmed:  { label: 'Confirmed',  classes: 'bg-blue-50 text-blue-700',       icon: CheckCircle },
  processing: { label: 'Processing', classes: 'bg-amber-50 text-amber-700',     icon: Clock },
  shipped:    { label: 'Shipping',   classes: 'bg-indigo-50 text-indigo-700',   icon: Truck },
  delivered:  { label: 'Delivered',  classes: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-50 text-red-500',         icon: XCircle },
};

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

  const [loyaltyConfig, setLoyaltyConfig] = useState(null);

  useEffect(() => {
    loadOrders();
    getLoyaltyConfig().then(setLoyaltyConfig);
    // Rafraîchit la liste automatiquement quand une commande est créée/modifiée
    // (commande en ligne entrante, vente POS…) — plus besoin du bouton « Refresh ».
    let channel;
    try {
      channel = supabase
        .channel('cashier-orders-list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
        .subscribe();
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[realtime caisse-liste] indisponible:', err);
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const [loyaltyToast, setLoyaltyToast] = useState(null);

  const updateStatus = async (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    const oldStatus = order?.status;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: oldStatus } : o)));
      return;
    }

    // Credit loyalty points ONCE, when an *online* order is delivered.
    // Garde anti double-crédit : on se base sur le flag PERSISTANT `loyalty_credited`
    // (pas sur le statut courant — sinon rebasculer "delivered" re-créditerait).
    // Les ventes POS sont déjà créditées au comptoir (wasCreditedAtTill) → skip.
    if (
      newStatus === 'delivered' &&
      !order?.loyalty_credited &&
      !wasCreditedAtTill(order) &&
      order?.phone &&
      loyaltyConfig
    ) {
      const member = await findMemberByPhone(order.phone);
      if (member) {
        const { points, newTotal } = await addPointsFromPurchase(member.id, order.total ?? 0, loyaltyConfig, 'online');
        if (points > 0) {
          // Marque la commande comme créditée (persistant) → plus aucun re-crédit possible.
          await supabase.from('orders').update({ loyalty_credited: true }).eq('id', id);
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, loyalty_credited: true } : o)));
          // Use the authoritative balance returned by the RPC, not a local sum.
          setLoyaltyToast({
            name: member.full_name,
            pointsEarned: points,
            newBalance: newTotal ?? (member.points ?? 0) + points,
          });
          setTimeout(() => setLoyaltyToast(null), 5000);
        }
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
        <div className="fixed top-4 right-4 z-50 bg-white border border-silver/30 shadow-xl rounded-2xl p-4 max-w-xs animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-silver" />
            <p className="text-sm font-bold text-ink">+{loyaltyToast.pointsEarned} points</p>
          </div>
          <p className="text-xs text-ink-soft">
            {loyaltyToast.name} — {loyaltyToast.newBalance} pts total
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink">Orders</h1>
          <p className="text-sm text-ink-soft mt-0.5">In-store and online orders</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref, name or phone..."
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-ink/15 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-silver/40"
        >
          <option value="all">All statuses</option>
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
        <div className="bg-white rounded-2xl border border-ink/8 shadow-sm flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-silver" />
          </div>
          <p className="text-sm font-semibold text-ink">No orders found</p>
          <p className="text-xs text-ink-soft mt-1">Try a different search or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-ink/8 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-mono text-xs font-bold text-ink tracking-wider">#{shortRef(order.id)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-serif text-lg text-ink leading-tight">{order.full_name}</p>
                  <p className="text-sm text-ink-soft">{order.phone} — {order.city}</p>
                  <p className="text-xs text-ink-soft/60 mt-1">{new Date(order.created_at).toLocaleString('en-US')}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border border-ink/15 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-silver/40"
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
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-ink/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Total</span>
                <span className="text-lg font-serif text-ink">{formatCurrency(order.total)}</span>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => downloadInvoice(order)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-ink/15 text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
                >
                  <Download className="w-4 h-4" /> Invoice PDF
                </button>
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
