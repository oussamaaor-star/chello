import { useEffect, useRef } from 'react';

/**
 * AutoVideo — lecteur vidéo léger et performant.
 *
 * Reprend exactement le pattern de ReelGallery :
 *   muted + loop + playsInline + poster + preload="metadata"
 *   IntersectionObserver → ne joue QUE lorsque la vidéo est à l'écran
 *   (économie data + batterie + perf, jamais d'autoplay hors-champ).
 *
 * Le poster est dérivé automatiquement du src si non fourni
 * (/videos/x.mp4 → /videos/posters/x.jpg).
 */
export function AutoVideo({
  src,
  poster,
  className = '',
  threshold = 0.3,
  ...props
}) {
  const ref = useRef(null);

  const resolvedPoster =
    poster ??
    src.replace('/videos/', '/videos/posters/').replace('.mp4', '.jpg');

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <video
      ref={ref}
      src={src}
      poster={resolvedPoster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
      {...props}
    />
  );
}

export default AutoVideo;
