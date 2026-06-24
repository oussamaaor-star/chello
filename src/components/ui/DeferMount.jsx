import { useState, useEffect, useRef } from 'react';

/**
 * Rend ses enfants seulement une fois le navigateur au repos (requestIdleCallback)
 * OU quand le bloc approche du viewport. Allège le rendu initial de la page
 * (moins de travail sur le fil principal → réduit le Total Blocking Time).
 *
 * À utiliser uniquement pour du contenu SOUS la ligne de flottaison
 * (sinon risque de décalage visible). `minHeight` réserve l'espace pour
 * éviter tout saut de mise en page.
 */
export function DeferMount({ children, minHeight = 0 }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (show) return undefined;
    const mount = () => setShow(true);

    // 1) Monte dès que le navigateur est au repos après le premier rendu.
    let idleId;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(mount, { timeout: 1500 });
    } else {
      idleId = window.setTimeout(mount, 300);
    }

    // 2) …ou immédiatement si l'utilisateur scrolle jusqu'ici avant.
    let io;
    if ('IntersectionObserver' in window && ref.current) {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) mount();
      }, { rootMargin: '400px' });
      io.observe(ref.current);
    }

    return () => {
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      io?.disconnect();
    };
  }, [show]);

  return (
    <div ref={ref} style={minHeight ? { minHeight } : undefined}>
      {show ? children : null}
    </div>
  );
}
