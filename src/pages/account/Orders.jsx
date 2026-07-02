import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingBag, ChevronRight,
  Clock, CheckCircle, Truck, X, Eye,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Status config ────────────────────────────────────────────────

const STATUS = {
  pending:    { labelKey: 'orderStatusEnAttente',  color: 'bg-cream-deep text-ink-soft',       icon: Clock        },
  confirmed:  { labelKey: 'orderStatusConfirmee',  color: 'bg-blue-50 text-blue-600',          icon: CheckCircle  },
  processing: { labelKey: 'orderStatusEnCours',    color: 'bg-silver/10 text-silver-deep',         icon: Clock        },
  shipped:    { labelKey: 'orderStatusEnLivraison',color: 'bg-indigo-50 text-indigo-600',      icon: Truck        },
  delivered:  { labelKey: 'orderStatusLivree',     color: 'bg-emerald-50 text-emerald-600',    icon: CheckCircle  },
  cancelled:  { labelKey: 'orderStatusAnnulee',    color: 'bg-red-50 text-red-500',            icon: X            },
};

// ─── OrderCard ────────────────────────────────────────────────────

function OrderCard({ order }) {
  const { t, lang } = useLanguage();
  const cfg   = STATUS[order.status] ?? STATUS.confirmed;
  const Icon  = cfg.icon;
  const ref   = order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const date  = new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-ink font-mono tracking-wider">#{ref}</p>
          <p className="text-xs text-ink-soft mt-0.5">{date}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
          <Icon className="w-3 h-3" />{t(cfg.labelKey)}
        </span>
      </div>

      {/* Items preview */}
      {order.items?.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {order.items.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-ink-soft">
              <span className="w-5 text-center font-semibold text-ink-soft">{item.quantity}×</span>
              <span className="flex-1 truncate">{item.name}</span>
              {item.size && (
                <span className="text-ink-soft flex-shrink-0">{item.size}</span>
              )}
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-ink-soft ms-7">
              +{order.items.length - 2}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-ink/10">
        <span className="text-xs text-ink-soft">
          {order.items?.length ?? 0} {t('ordersArticle')}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink">
            {Number(order.total).toFixed(3)} ر.ع
          </span>
          <Link
            to={`/compte/commandes/${order.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-cream rounded-lg text-xs font-semibold hover:bg-ink/90 transition-colors active:scale-[0.97]"
          >
            <Eye className="w-3 h-3" />{t('ordersVoir')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────

function EmptyOrders() {
  const { t } = useLanguage();
  return (
    <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-12 text-center">
      <div className="w-20 h-20 rounded-3xl bg-cream border border-ink/10 flex items-center justify-center mx-auto mb-5">
        <ShoppingBag className="w-9 h-9 text-ink-soft" />
      </div>
      <h3 className="text-lg font-serif italic text-ink mb-2">{t('ordersVide')}</h3>
      <p className="text-sm text-ink-soft max-w-xs mx-auto mb-7 leading-relaxed">
        {t('ordersEmptyDesc')}
      </p>
      <Link to="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream rounded-full text-sm font-semibold hover:bg-ink/90 transition-all active:scale-[0.98]">
        <Package className="w-4 h-4" />{t('navCatalogue')}<ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function Orders() {
  const { t }                     = useLanguage();
  const { user }                  = useAuth();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadOrders();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif italic text-ink">{t('ordersTitle')}</h2>
          <p className="text-sm text-ink-soft mt-1">{t('ordersSubtitle')}</p>
        </div>
        {orders.length > 0 && (
          <span className="text-xs text-ink-soft bg-cream-deep px-3 py-1 rounded-full border border-ink/10">
            {orders.length} {t('ordersCommande')}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-cream-deep rounded-2xl border border-ink/10 p-5 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-3.5 w-24 bg-ink/10 rounded-full" />
                  <div className="h-2.5 w-16 bg-ink/10 rounded-full" />
                </div>
                <div className="h-6 w-20 bg-ink/10 rounded-full" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-2.5 w-3/4 bg-ink/10 rounded-full" />
                <div className="h-2.5 w-1/2 bg-ink/10 rounded-full" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-ink/10">
                <div className="h-2.5 w-16 bg-ink/10 rounded-full" />
                <div className="h-7 w-20 bg-ink/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
