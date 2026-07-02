import { useState, useEffect, useCallback } from 'react';

export function useScroll(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return scrolled;
}

// Header condensé : true quand on DESCEND au-delà du seuil (le header se
// replie), false dès qu'on remonte ou qu'on revient près du haut (il se
// redéploie). Throttlé sur requestAnimationFrame (compatible Lenis, qui
// anime le scroll natif de la fenêtre).
export function useScrollCondensed(threshold = 140) {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > threshold && y > lastY + 2) setCondensed(true);
        else if (y < lastY - 2 || y <= threshold) setCondensed(false);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return condensed;
}
