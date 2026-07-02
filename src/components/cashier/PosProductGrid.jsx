import { Plus, Loader2, PackageX } from 'lucide-react';
import { formatCurrency } from '../../utils/cashierFormat';

// Grille de produits cliquables du POS.
// getStock(id) : stock connu (null = non suivi) ; remainingStock(id) : ce qu'on
// peut encore ajouter compte tenu du panier (Infinity = non suivi).
export function PosProductGrid({ products, loading, getStock, remainingStock, onAdd }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-ink-soft text-center py-8">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-1">
      {products.map((p) => {
        const stock = getStock(p.id);
        const isOut = stock === 0;
        const remaining = remainingStock(p.id);
        const capped = !isOut && remaining <= 0; // tracked stock fully in cart
        const disabled = isOut || capped;
        return (
        <button
          key={p.id}
          onClick={() => onAdd(p)}
          disabled={disabled}
          className={`bg-white rounded-2xl border border-ink/8 shadow-sm overflow-hidden text-left transition-all group ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-silver/30 hover:shadow-md'
          }`}
        >
          <div className="aspect-square bg-cream-deep overflow-hidden relative">
            <img
              src={p.images?.[0] ?? '/products/placeholder-dresses.svg'}
              alt={p.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${disabled ? 'grayscale' : 'group-hover:scale-105'}`}
              onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }}
            />
            {isOut && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                <PackageX className="w-2.5 h-2.5" /> Out
              </span>
            )}
            {capped && (
              <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                Max in cart
              </span>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs font-semibold text-ink leading-snug line-clamp-2 mb-1">{p.name}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-silver-deep">
                {p.price != null ? formatCurrency(p.price) : 'On request'}
              </p>
              {!disabled && <Plus className="w-4 h-4 text-ink-soft group-hover:text-silver transition-colors" />}
            </div>
            {stock != null && stock > 0 && (
              <p className="text-[10px] text-ink-soft mt-1">{stock} in stock</p>
            )}
          </div>
        </button>
        );
      })}
    </div>
  );
}
