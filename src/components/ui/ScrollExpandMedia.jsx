import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

/**
 * Média qui s'AGRANDIT au scroll — version sûre (scroll-LIÉ, pas de détournement).
 * N'attache AUCUN écouteur global wheel/scroll/touch, ne fait pas preventDefault ni
 * scrollTo → 100% compatible avec Lenis (smooth scroll global du site).
 * L'échelle est pilotée par la progression de la section dans le viewport.
 */
export function ScrollExpandMedia({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  alt = '',
  className = '',
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.78, 1.06]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.35, 1]);

  // Lecture vidéo uniquement quand visible (perf + données)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{ scale, opacity }}
        className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-cream/10 will-change-transform"
      >
        {mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={mediaSrc}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={mediaSrc}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent" />
      </motion.div>
    </div>
  );
}

export default ScrollExpandMedia;
