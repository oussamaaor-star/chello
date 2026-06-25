import { useState, useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { BorderBeam } from './BorderBeam';

const AMBER_SHADES = [
  'from-silver/20 via-cream-deep to-cream border-silver/30',
  'from-silver-deep/15 via-cream-deep to-cream border-silver-deep/20',
  'from-silver-light/20 via-cream-deep to-cream border-silver-light/25',
];

function ReviewAvatar({ name, index }) {
  const shade = AMBER_SHADES[index % AMBER_SHADES.length];
  return (
    <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center
                     bg-gradient-to-br ${shade} border shadow-inner`}>
      <span className="text-silver font-serif font-bold text-base leading-none select-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function ReviewCard({
  review, index, total, isMobile,
  scaleStep, verticalSpacing, horizontalSpacing, animationDuration,
  interactionType, onCycle, onInteractStart, onInteractEnd,
}) {
  const dragStartY = useRef(null);

  const scale    = 1 + index * scaleStep;
  const tx       = !isMobile ? index * horizontalSpacing : 0;
  const ty       = index * -verticalSpacing;
  const opacity  = Math.max(0.1, 1 - index * 0.22);
  const zIndex   = total - index;
  const dur      = `${animationDuration}s`;
  const ease     = 'cubic-bezier(0.25,0.46,0.45,0.94)';

  const style = {
    position: 'absolute',
    width: '100%',
    transform: `translateX(${tx}px) translateY(${ty}px) scale(${scale})`,
    opacity,
    zIndex,
    transition: `transform ${dur} ${ease}, opacity ${dur} ${ease}`,
  };

  function handlePointerDown(e) {
    if (interactionType !== 'drag') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    onInteractStart();
  }

  function handlePointerUp(e) {
    if (interactionType !== 'drag' || dragStartY.current === null) return;
    const delta = Math.abs(e.clientY - dragStartY.current);
    dragStartY.current = null;
    onInteractEnd();
    if (delta > 8) onCycle();
  }

  function handleClick() {
    if (interactionType === 'click') {
      onInteractStart();
      onCycle();
      setTimeout(onInteractEnd, Math.round(animationDuration * 1000));
    }
  }

  return (
    <div
      style={style}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      className={`overflow-hidden rounded-2xl bg-cream border border-ink/10
                   ${interactionType === 'drag' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
    >
      <div className="relative p-5 sm:p-6">
        <Quote className="absolute top-4 right-5 w-8 h-8 text-silver/10 rotate-180" />

        <div className="flex items-center gap-3 mb-4">
          <ReviewAvatar name={review.name} index={index} />
          <div className="min-w-0">
            <p className="text-ink font-semibold text-sm leading-tight">{review.name}</p>
            {review.city && (
              <p className="text-ink-soft/70 text-[11px] mt-0.5">
                {review.city}{review.date ? ` · ${review.date}` : ''}
              </p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < (review.rating ?? 5) ? 'text-silver fill-silver' : 'text-ink/15'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-ink-soft text-sm leading-relaxed italic line-clamp-3 mb-4">
          "{review.text}"
        </p>

        {review.product && (
          <div className="flex items-center gap-2 pt-3 border-t border-ink/10">
            <span className="text-silver-deep/50 text-[10px] select-none">◆</span>
            <p className="text-[11px] text-silver-deep/70 font-medium truncate">{review.product}</p>
          </div>
        )}

        {index === 0 && (
          <BorderBeam
            size={220}
            colorFrom="#f59e0b"
            colorTo="#92400e"
            duration={10}
            delay={0}
            borderWidth={1}
          />
        )}
      </div>
    </div>
  );
}

export function AnimatedReviewCards({
  reviews: initialReviews = [],
  interactionType = 'drag',
  animationDuration = 0.35,
  scaleStep = 0.04,
  verticalSpacing = 12,
  horizontalSpacing = 18,
  autoRotate = true,
  rotateInterval = 5500,
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (initialReviews.length > 0) setReviews(initialReviews);
  }, [initialReviews.length]);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const handleCycle = (index) => {
    setReviews((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      next.push(removed);
      return next;
    });
  };

  useEffect(() => {
    if (!autoRotate || isInteracting) return;
    const id = setInterval(() => handleCycle(0), rotateInterval);
    return () => clearInterval(id);
  }, [autoRotate, rotateInterval, isInteracting]);

  if (reviews.length === 0) return null;

  return (
    <div className="relative h-[280px] sm:h-[360px] w-full select-none overflow-hidden">
      <div className="absolute left-1/2 top-[36%] -translate-x-1/2
                      w-[290px] sm:w-[420px] md:w-[580px] h-0">
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            index={index}
            total={reviews.length}
            isMobile={isMobile}
            scaleStep={scaleStep}
            verticalSpacing={verticalSpacing}
            horizontalSpacing={horizontalSpacing}
            animationDuration={animationDuration}
            interactionType={interactionType}
            onCycle={() => handleCycle(index)}
            onInteractStart={() => setIsInteracting(true)}
            onInteractEnd={() => setIsInteracting(false)}
          />
        ))}
      </div>
    </div>
  );
}
