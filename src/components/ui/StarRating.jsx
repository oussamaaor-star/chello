import { Star, StarHalf } from 'lucide-react';

export function StarRating({ rating, max = 5, showValue = false, className = '' }) {
  if (rating == null) return null;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = max - Math.ceil(rating);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-gold text-gold" />
        ))}
        {hasHalfStar && <StarHalf className="w-3.5 h-3.5 fill-gold text-gold" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-ink/20 fill-ink/10" />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-ink-soft font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
