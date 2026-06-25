import { useState, useEffect } from 'react';
import { Search, Loader2, PackageX, Package, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CashierStock() {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    const [productsRes, stockRes] = await Promise.all([
      supabase.from('products').select('id, name, slug, images, category, active').eq('active', true).order('name'),
      supabase.from('product_stock').select('product_id, stock'),
    ]);

    setProducts(productsRes.data ?? []);

    const map = {};
    (stockRes.data ?? []).forEach((s) => { map[s.product_id] = s.stock; });
    setStockMap(map);

    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const getStock = (id) => stockMap[id] ?? null;

  const filtered = products.filter((p) => {
    const stock = getStock(p.id);
    if (filter === 'in_stock' && (stock == null || stock <= 0)) return false;
    if (filter === 'out_of_stock' && stock !== 0) return false;
    if (filter === 'low_stock' && (stock == null || stock > 5 || stock <= 0)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  const outOfStockCount = products.filter((p) => getStock(p.id) === 0).length;
  const lowStockCount = products.filter((p) => {
    const s = getStock(p.id);
    return s != null && s > 0 && s <= 5;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-serif text-ink">Stock</h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-ink">{products.length}</p>
          <p className="text-[10px] text-ink-soft font-medium uppercase tracking-wider mt-1">Produits actifs</p>
        </div>
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
          <p className="text-[10px] text-ink-soft font-medium uppercase tracking-wider mt-1">Stock faible</p>
        </div>
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{outOfStockCount}</p>
          <p className="text-[10px] text-ink-soft font-medium uppercase tracking-wider mt-1">Rupture</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher un produit..."
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-ink/15 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-silver/40"
        >
          <option value="all">Tous</option>
          <option value="in_stock">En stock</option>
          <option value="low_stock">Stock faible (≤5)</option>
          <option value="out_of_stock">Rupture</option>
        </select>
      </div>

      {/* Liste produits */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-ink-soft text-center py-8">Aucun produit trouvé.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-ink-soft">
                  <th className="px-5 py-3 font-medium">Produit</th>
                  <th className="px-5 py-3 font-medium">Catégorie</th>
                  <th className="px-5 py-3 font-medium text-center">Stock</th>
                  <th className="px-5 py-3 font-medium text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((p) => {
                  const stock = getStock(p.id);
                  const isOut = stock === 0;
                  const isLow = stock != null && stock > 0 && stock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-cream-deep/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-xl overflow-hidden bg-cream-deep border border-ink/10 flex-shrink-0">
                            <img
                              src={p.images?.[0] ?? '/products/placeholder-dresses.svg'}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }}
                            />
                          </div>
                          <p className="text-ink font-medium leading-snug line-clamp-2">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-ink-soft capitalize bg-cream-deep px-2 py-1 rounded-lg">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-sm font-bold ${isOut ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-ink'}`}>
                          {stock ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-500">
                            <PackageX className="w-2.5 h-2.5" /> Rupture
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
                            <Package className="w-2.5 h-2.5" /> Faible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            <Package className="w-2.5 h-2.5" /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
