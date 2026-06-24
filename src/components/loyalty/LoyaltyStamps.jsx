import { Shirt } from 'lucide-react';

export function LoyaltyStamps({ count = 0, total = 8 }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: total }, (_, i) => {
        const filled = i < count;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                filled ? 'border-gold bg-gold/15 text-gold-light' : 'border-cream/15 text-cream/30'
              }`}
            >
              <Shirt size={18} />
            </div>
            <span className={`text-xs ${filled ? 'text-gold-light' : 'text-cream/30'}`}>{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}
