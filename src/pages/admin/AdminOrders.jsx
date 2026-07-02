import { useEffect, useState } from 'react';
import { Gift, Download, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { findMemberByPhone, addPointsFromPurchase, getLoyaltyConfig } from '../../utils/loyalty';

const PAGE_SIZE = 20;

async function downloadInvoice(order) {
  try {
    const { generateInvoice } = await import('../../utils/generateInvoice');
    generateInvoice(order);
  } catch (err) {
    console.error('[Invoice]', err.message);
  }
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_STYLES = {
  pending:    'bg-amber-50 text-amber-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  shipped:    'bg-blue-50 text-blue-700',
  delivered:  'bg-emerald-50 text-emerald-700',
  cancelled:  'bg-red-50 text-red-600',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [loyaltyConfig, setLoyaltyConfig] = useState(null);

  const loadOrders = async (p = page) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    setOrders(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders(page);
  }, [page]); // eslint-disable-line

  useEffect(() => {
    getLoyaltyConfig().then(setLoyaltyConfig);
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const [loyaltyToast, setLoyaltyToast] = useState(null);
  const [statusError, setStatusError] = useState(null);

  const updateStatus = async (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    const wasDelivered = order?.status === 'delivered';
    const oldStatus = order?.status;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    // .select() : un UPDATE bloqué par RLS renvoie error=null + 0 ligne.
    // On rollback aussi dans ce cas pour ne pas afficher un faux succès.
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      .select('id');
    if (error || !data || data.length === 0) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: oldStatus } : o)));
      setStatusError('Status update failed — the change was not saved.');
      setTimeout(() => setStatusError(null), 4000);
      return;
    }

    if (newStatus === 'delivered' && !wasDelivered && order?.phone && loyaltyConfig) {
      const member = await findMemberByPhone(order.phone);
      if (member) {
        const { points } = await addPointsFromPurchase(member.id, order.total ?? 0, loyaltyConfig, 'online');
        if (points > 0) {
          setLoyaltyToast({ name: member.full_name, pointsEarned: points, newBalance: member.points + points });
          setTimeout(() => setLoyaltyToast(null), 5000);
        }
      }
    }
  };

  if (loading) return <p className="text-ink-soft">Loading...</p>;

  return (
    <div className="space-y-6">
      {statusError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold bg-red-600 text-white">
          {statusError}
        </div>
      )}
      {loyaltyToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-silver/30 shadow-xl rounded-2xl p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-silver" />
            <p className="text-sm font-bold text-ink">+{loyaltyToast.pointsEarned} points</p>
          </div>
          <p className="text-xs text-ink-soft">
            {loyaltyToast.name} — {loyaltyToast.newBalance} pts total
          </p>
        </div>
      )}

      <div>
        <h1 className="font-serif text-2xl text-ink">Orders</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          {total} order{total !== 1 ? 's' : ''} total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm flex flex-col items-center justify-center py-16 text-center px-6">
          <Package className="w-10 h-10 text-ink-soft/30 mb-3" />
          <p className="text-sm text-ink-soft">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-ink">{order.full_name}</p>
                  <p className="text-sm text-ink-soft">{order.phone} — {order.city}</p>
                  <p className="text-xs text-ink-soft/60 mt-1">{new Date(order.created_at).toLocaleString('en-US')}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[order.status] ?? 'bg-cream-deep text-ink-soft'}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border border-ink/15 rounded-xl px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-silver/40 transition-all"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-sm text-ink-soft mb-2">{order.address}</p>
              {order.notes && <p className="text-sm text-ink-soft italic mb-2">{order.notes}</p>}
              <div className="border-t border-ink/8 pt-3 space-y-1">
                {(order.items ?? []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-ink">
                    <span>{item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                    <span className="tabular-nums">{item.price != null ? `${(item.price * item.quantity).toFixed(3)} OMR` : '—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-ink mt-2 pt-2 border-t border-ink/8">
                <span>Total</span>
                <span className="tabular-nums">{Number(order.total).toFixed(3)} OMR</span>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => downloadInvoice(order)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ink/15 text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
                >
                  <Download className="w-4 h-4" /> Invoice PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Page {page + 1} of {totalPages} · {total} order{total !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-lg border border-ink/10 hover:bg-cream-deep disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="p-1.5 rounded-lg border border-ink/10 hover:bg-cream-deep disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
