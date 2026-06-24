import { useRef, useEffect, useState } from 'react';

/*
 * MarqueeEffect — pure CSS animation, no Framer Motion dependency.
 *
 * Props:
 *   children      — content to scroll (rendered twice for seamless loop)
 *   gap           — gap between items in px (default 16)
 *   speed         — px/s scrolling speed (default 100)
 *   speedOnHover  — px/s speed when hovered (optional)
 *   direction     — 'horizontal' | 'vertical' (default 'horizontal')
 *   reverse       — reverse scroll direction (default false)
 *   className     — extra classes on the outer wrapper
 */

const CSS_KEYFRAMES = `
@keyframes marquee-x {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes marquee-x-rev {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
@keyframes marquee-y {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}
@keyframes marquee-y-rev {
  from { transform: translateY(-50%); }
  to   { transform: translateY(0); }
}
`;

// Inject keyframes once into the document <head>
let keyframesInjected = false;
function ensureKeyframes() {
  if (keyframesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = CSS_KEYFRAMES;
  document.head.appendChild(style);
  keyframesInjected = true;
}

export function MarqueeEffect({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className = '',
}) {
  const trackRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [hovered, setHovered] = useState(false);

  // Measure the single-copy width/height to compute duration
  useEffect(() => {
    ensureKeyframes();
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      // The track holds two copies; half its size is one copy
      const size = direction === 'horizontal'
        ? el.scrollWidth / 2
        : el.scrollHeight / 2;
      setDuration(size / speed);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [direction, speed]);

  const isHorizontal = direction === 'horizontal';
  const animationName = isHorizontal
    ? reverse ? 'marquee-x-rev' : 'marquee-x'
    : reverse ? 'marquee-y-rev' : 'marquee-y';

  // Duration in seconds: use speedOnHover when hovered, base speed otherwise
  const effectiveDuration = (() => {
    if (duration === null) return 0;
    if (hovered && speedOnHover) {
      // Recompute duration for hover speed while keeping same distance
      const size = direction === 'horizontal'
        ? (trackRef.current?.scrollWidth ?? 0) / 2
        : (trackRef.current?.scrollHeight ?? 0) / 2;
      return size / speedOnHover;
    }
    return duration;
  })();

  const trackStyle = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: `${gap}px`,
    width: isHorizontal ? 'max-content' : '100%',
    willChange: 'transform',
    ...(effectiveDuration > 0
      ? {
          animation: `${animationName} ${effectiveDuration}s linear infinite`,
        }
      : {}),
  };

  const hoverHandlers = speedOnHover
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }
    : {};

  return (
    <div className={`overflow-hidden ${className}`} {...hoverHandlers}>
      <div ref={trackRef} style={trackStyle}>
        {children}
        {children}
      </div>
    </div>
  );
}
