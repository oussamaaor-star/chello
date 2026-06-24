import { useState, useEffect } from 'react';
import { Bell, Loader2, Trash2, Package, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 20;

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = async (p = page) => {
    setLoading(true);
    try {
      const from = (p - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Fetch alerts with product info
      // Étape 1 : fetch les alertes sans join
      const { data, count, error } = await supabase
        .from('stock_alerts')
        // select('*') : le formulaire client enregistre le téléphone (pas l'email) —
        // on récupère donc phone (et tout autre champ existant) sans dépendre d'une
        // liste de colonnes figée.
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[AdminAlerts] Erreur SELECT:', error);
        throw error;
      }

      if (!data?.length) {
        setAlerts([]);
        setTotalCount(count || 0);
        return;
      }

      // Étape 2 : fetch les noms de produits séparément
      const productIds = [...new Set(data.map(a => a.product_id).filter(Boolean))];
      const { data: products } = await supabase
        .from('products')
        .select('id, name, brand, slug')
        .in('id', productIds);

      const productMap = {};
      for (const prod of (products ?? [])) productMap[prod.id] = prod;

      const enriched = data.map(a => ({ ...a, products: productMap[a.product_id] ?? null }));
      setAlerts(enriched);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAlerts(page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette alerte ?')) return;
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAlerts(alerts.filter(a => a.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-gold" />
            Alertes Stock
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Gérez les clients qui attendent le retour en stock de vos produits.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-semibold text-ink-soft hover:bg-cream-deep transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        {loading && !isRefreshing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
            <p className="text-sm text-ink-soft">Chargement des alertes...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-cream-deep rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-ink-soft/30" />
            </div>
            <h3 className="text-lg font-semibold text-ink">Aucune alerte active</h3>
            <p className="text-sm text-ink-soft mt-1 max-w-xs">
              Les clients n'ont pas encore souscrit d'alertes pour des produits en rupture.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-deep border-b border-ink/10">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Téléphone</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Produit</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Date demande</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Statut</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-cream-deep/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink">{alert.phone || alert.email}</p>
                          {alert.phone && (
                            <a
                              href={`https://wa.me/${(alert.phone).replace(/^\+/, '').replace(/^0/, '968')}?text=${encodeURIComponent(`مرحباً! المنتج "${alert.products?.name || ''}" أصبح متوفراً مجدداً في Chello ✨`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              Contacter sur WhatsApp →
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-ink">{alert.products?.name || 'Produit supprimé'}</span>
                        <span className="text-[11px] text-ink-soft uppercase tracking-tighter">{alert.products?.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-ink-soft tabular-nums">
                        {new Date(alert.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {alert.notified_at ? (
                        <Badge variant="success">Notifié le {new Date(alert.notified_at).toLocaleDateString('fr-FR')}</Badge>
                      ) : (
                        <Badge variant="warning">En attente</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {alert.products?.slug && (
                          <a
                            href={`/produit/${alert.products.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-ink-soft hover:text-gold-deep hover:bg-gold/10 rounded-lg transition-colors"
                            title="Voir le produit"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-2 text-ink-soft hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalCount > PAGE_SIZE && (
          <div className="px-6 py-4 border-t border-ink/10">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / PAGE_SIZE)}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Summary info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-gold" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">Total Alertes</p>
          </div>
          <p className="text-2xl font-bold text-ink">{totalCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">En attente</p>
          </div>
          <p className="text-2xl font-bold text-ink">
            {alerts.filter(a => !a.notified_at).length} <span className="text-sm font-normal text-ink-soft">sur cette page</span>
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">Trigger Automatique</p>
          </div>
          <p className="text-xs text-ink-soft leading-relaxed">
            Les alertes sont envoyées dès que le stock d'un produit passe de 0 à disponible dans l'admin.
          </p>
        </div>
      </div>
    </div>
  );
}
