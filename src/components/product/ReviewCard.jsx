import { Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function ReviewCard({ review }) {
  const { rating, date, text, verified } = review;
  const { t } = useLanguage();
  // Garde-fou : certains avis (données legacy) peuvent ne pas avoir de nom.
  const name = (review.name ?? '').trim() || t('reviewClientVerifie');
  const initial = name.charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-cream-deep rounded-2xl p-5 border border-ink/10 hover:border-ink/20 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-ink text-cream flex items-center justify-center text-sm font-bold flex-shrink-0 select-none">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink text-sm truncate">{name}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < rating ? 'fill-amber-500 text-amber-500' : 'text-ink-soft/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-ink-soft flex-shrink-0 mt-0.5">{date}</span>
      </div>

      <p className="text-ink-soft text-sm leading-relaxed">{text}</p>

      {verified && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          {t('reviewVerifie')}
        </div>
      )}
    </div>
  );
}
