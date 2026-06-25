import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { addLoyaltyVisitByPhone } from '../../utils/loyalty';

const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];
const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmée', delivered: 'Livrée', cancelled: 'Annulée' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders(data ?? []);
      setLoading(false);
    });
  }, []);

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

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      {loyaltyToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gold/30 shadow-xl rounded-2xl p-4 max-w-xs">
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
      <h1 className="text-xl font-bold text-gray-900 mb-6">Commandes ({orders.length})</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{order.full_name}</p>
                  <p className="text-sm text-gray-500">{order.phone} — {order.city}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <p className="text-sm text-gray-600 mb-2">{order.address}</p>
              {order.notes && <p className="text-sm text-gray-500 italic mb-2">{order.notes}</p>}
              <div className="border-t border-gray-100 pt-3 space-y-1">
                {(order.items ?? []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                    <span>{item.price != null ? `${(item.price * item.quantity).toFixed(2)} OMR` : '—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-gray-900 mt-2 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{Number(order.total).toFixed(2)} OMR</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
