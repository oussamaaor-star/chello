import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Package, Trash2, ArrowRight, Loader2, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StockAlerts() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const { data: alertRows, error } = await supabase
          .from('stock_alerts')
          .select('id, created_at, notified_at, product_id, phone')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!alertRows?.length) { setAlerts([]); setLoading(false); return; }

        const productIds = [...new Set(alertRows.map(a => a.product_id).filter(Boolean))];
        const { data: products } = await supabase
          .from('products')
          .select('id, name, brand, slug, images')
          .in('id', productIds);

        const productMap = {};
        for (const p of (products ?? [])) productMap[p.id] = p;

        setAlerts(alertRows.map(a => ({ ...a, products: productMap[a.product_id] ?? null })));
      } catch (err) {
        console.error('Error fetching user alerts:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('alertsSupprimer'))) return;
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert(t('alertsErrSupp'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
        <p className="text-sm text-ink-soft font-medium">{t('alertsChargement')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif italic text-ink flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-gold" />
          {t('alertsTitle')}
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-ink-soft font-bold">
          {alerts.length} {t('alertsTitle').toLowerCase()}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-cream-deep border border-ink/10 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-ink-soft" />
          </div>
          <p className="text-ink font-medium mb-1">{t('alertsAucune')}</p>
          <p className="text-sm text-ink-soft mb-6">
            {t('alertsAucuneDesc')}
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold transition-colors"
          >
            {t('alertsDecouvrir')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="group bg-cream-deep border border-ink/10 hover:border-ink/20 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Product Image placeholder or real */}
                <div className="w-16 h-16 rounded-xl bg-cream overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {alert.products?.images?.[0] ?? null ? (
                    <img src={alert.products.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-ink-soft" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gold-deep uppercase tracking-widest font-bold mb-0.5">
                    {alert.products?.brand}
                  </p>
                  <h3 className="text-sm font-semibold text-ink truncate">
                    {alert.products?.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-ink-soft flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('alertsInscrit')} {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {alert.notified_at ? (
                      <Badge variant="success" className="text-[9px] py-0">{t('alertsNotifie')}</Badge>
                    ) : (
                      <Badge variant="warning" className="text-[9px] py-0">{t('alertsEnAttente')}</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {alert.products?.slug && (
                    <Link
                      to={`/produit/${alert.products.slug}`}
                      className="p-2.5 text-ink-soft hover:text-ink hover:bg-cream rounded-xl transition-all"
                      title={t('alertsVoirProduit')}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2.5 text-ink-soft hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title={t('alertsSupprimerTitle')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info card */}
      <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-gold" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gold-deep mb-1">{t('alertsComment')}</p>
          <p className="text-xs text-gold/80 leading-relaxed">
            {t('alertsCommentDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
