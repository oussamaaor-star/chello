import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * useFocusTrap — accessibilité des modales.
 *
 * - `active` true : déplace le focus dans le conteneur à l'ouverture,
 *   piège Tab / Shift+Tab à l'intérieur, appelle `onEscape` sur Échap,
 *   et restaure le focus à l'élément déclencheur à la fermeture.
 *
 * Retourne une ref à attacher au conteneur de la modale.
 */
export function useFocusTrap(active, onEscape) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onEscapeRef = useRef(onEscape);

  // Garde la dernière callback sans relancer l'effet.
  useEffect(() => { onEscapeRef.current = onEscape; }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    // Mémorise l'élément focalisé avant l'ouverture pour le restaurer après.
    previousFocusRef.current = document.activeElement;

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Focus initial : premier élément focalisable, sinon le conteneur lui-même.
    const focusFirst = () => {
      const focusable = getFocusable();
      if (focusable.length) {
        focusable[0].focus();
      } else {
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    };
    // requestAnimationFrame : laisse le DOM/animation se monter avant de focus.
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (!focusable.length) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      // Restaure le focus au déclencheur.
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [active]);

  return containerRef;
}
