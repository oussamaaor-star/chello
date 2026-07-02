import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/cashierFormat';

// Ligne du panier POS. `sizes` : tailles disponibles pour le sélecteur ;
// `remaining` ≤ 0 désactive le bouton + (stock suivi épuisé).
export function PosCartItem({ item, sizes, remaining, onQty, onSize, onRemove }) {
  return (
    <div className="px-5 py-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-14 rounded-xl overflow-hidden bg-cream-deep flex-shrink-0">
          <img src={item.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ink leading-snug line-clamp-2">{item.name}</p>
          <p className="text-xs text-silver-deep font-bold mt-0.5">{formatCurrency(item.price)}</p>
          {item.selectedSize && (
            <select
              value={item.selectedSize}
              onChange={(e) => onSize(item.id, e.target.value)}
              className="mt-1 text-[10px] border border-ink/10 rounded-lg px-1.5 py-0.5 bg-cream-deep"
            >
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
        <button onClick={() => onRemove(item.id)} className="text-ink-soft/40 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button onClick={() => onQty(item.id, -1)} className="w-7 h-7 rounded-lg border border-ink/15 flex items-center justify-center hover:bg-cream-deep transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-bold text-ink w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => onQty(item.id, 1)}
            disabled={remaining <= 0}
            className="w-7 h-7 rounded-lg border border-ink/15 flex items-center justify-center hover:bg-cream-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <p className="text-sm font-bold text-ink">{formatCurrency(item.price * item.quantity)}</p>
      </div>
    </div>
  );
}
