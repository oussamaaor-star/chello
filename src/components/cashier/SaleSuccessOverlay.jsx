import { CheckCircle, Gift, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/cashierFormat';

// Overlay de confirmation après encaissement.
// `result` : { total, customerName, loyalty: { pointsEarned, newBalance, bestReward } | null }
export function SaleSuccessOverlay({ result, onDismiss }) {
  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onDismiss}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-serif text-ink mb-1">Sale recorded</h2>
        <p className="text-ink-soft text-sm mb-2">{result.customerName}</p>
        <p className="text-3xl font-serif text-ink mb-6">{formatCurrency(result.total)}</p>

        {result.loyalty ? (
          <div className={`rounded-2xl p-5 mb-6 ${result.loyalty.bestReward ? 'bg-silver/10 border-2 border-silver' : 'bg-cream-deep border border-ink/10'}`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-silver" />
              <p className="text-sm font-bold text-ink">
                +{result.loyalty.pointsEarned} points earned!
              </p>
            </div>

            <div className="bg-white/60 rounded-xl px-4 py-3 mb-3 text-center">
              <p className="text-2xl font-bold text-ink">{result.loyalty.newBalance}</p>
              <p className="text-xs text-ink-soft">total points</p>
            </div>

            {result.loyalty.bestReward && (
              <div className="flex items-center justify-center gap-2 bg-silver/15 rounded-xl px-3 py-2">
                <Gift className="w-4 h-4 text-silver" />
                <p className="text-sm font-semibold text-silver-deep">
                  Can redeem {result.loyalty.bestReward.discount_omr} OMR discount!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-cream-deep rounded-2xl p-4 mb-6 border border-ink/10">
            <p className="text-xs text-ink-soft">
              No loyalty account linked to this number.
            </p>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="w-full bg-ink text-cream py-3 rounded-xl font-bold text-sm hover:bg-ink/90 transition-colors"
        >
          New Sale
        </button>
      </div>
    </div>
  );
}
