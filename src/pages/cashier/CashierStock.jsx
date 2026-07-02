import { useState, useEffect } from 'react';
import { Search, Loader2, PackageX, Package, RefreshCw, Boxes, AlertTriangle } from 'lucide-react';
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
        <div>
          <h1 className="text-2xl font-serif text-ink">Stock</h1>
          <p className="text-sm text-ink-soft mt-0.5">Live inventory across the catalogue</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats rapides */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-3">Inventory summary</p>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-5">
            <div className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center mb-4">
              <Boxes className="w-5 h-5 text-cream" />
            </div>
            <p className="text-2xl font-serif text-ink leading-none">{products.length}</p>
            <p className="text-[10px] text-ink-soft font-bold uppercase tracking-widest mt-2">Active Products</p>
          </div>
          <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-serif text-amber-600 leading-none">{lowStockCount}</p>
            <p className="text-[10px] text-ink-soft font-bold uppercase tracking-widest mt-2">Low Stock</p>
          </div>
          <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-5">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <PackageX className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-serif text-red-500 leading-none">{outOfStockCount}</p>
            <p className="text-[10px] text-ink-soft font-bold uppercase tracking-widest mt-2">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a product..."
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-ink/15 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-silver/40"
        >
          <option value="all">All</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock (≤5)</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Liste produits */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/8 shadow-sm flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-silver" />
          </div>
          <p className="text-sm font-semibold text-ink">No products found</p>
          <p className="text-xs text-ink-soft mt-1">Try a different search or stock filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-cream-deep/40 text-left">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Product</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Category</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft text-center">Stock</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((p) => {
                  const stock = getStock(p.id);
                  const isOut = stock === 0;
                  const isLow = stock != null && stock > 0 && stock <= 5;
                  const isUntracked = stock == null; // la vue product_stock ne suit pas la quantité

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
                            <PackageX className="w-2.5 h-2.5" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
                            <Package className="w-2.5 h-2.5" /> Low
                          </span>
                        ) : isUntracked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ink/5 text-ink-soft">
                            <Package className="w-2.5 h-2.5" /> Not tracked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            <Package className="w-2.5 h-2.5" /> In Stock
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
