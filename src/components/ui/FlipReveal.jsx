import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

// Garde SSR : n'enregistre les plugins que côté client (le prerender tourne sous Node).
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip, useGSAP);
}

const splitCls = (c) => (c || '').split(' ').filter(Boolean);

export function FlipRevealItem({ flipKey, ...props }) {
  return <div data-flip={flipKey} {...props} />;
}

/**
 * FlipReveal — filtre animé (GSAP Flip). Les enfants <FlipRevealItem flipKey="...">
 * apparaissent/disparaissent avec un effet flip+scale selon `keys`.
 * `keys` = liste de catégories actives ("all" = tout).
 */
export function FlipReveal({ keys, hideClass = 'hidden', showClass = '', dataKey = '', children, ...props }) {
  const wrapperRef = useRef(null);

  const isShow = (key) => !!key && (keys.includes('all') || keys.includes(key));

  useGSAP(
    () => {
      const root = wrapperRef.current;
      if (!root) return;

      const items = Array.from(root.querySelectorAll('[data-flip]'));
      const state = Flip.getState(items);

      items.forEach((item) => {
        const key = item.getAttribute('data-flip');
        if (isShow(key)) {
          if (showClass) item.classList.add(...splitCls(showClass));
          if (hideClass) item.classList.remove(...splitCls(hideClass));
        } else {
          if (showClass) item.classList.remove(...splitCls(showClass));
          if (hideClass) item.classList.add(...splitCls(hideClass));
        }
      });

      Flip.from(state, {
        duration: 0.55,
        scale: true,
        ease: 'power1.inOut',
        stagger: 0.04,
        absolute: true,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.6 },
          ),
        onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0, duration: 0.45 }),
      });
    },
    { scope: wrapperRef, dependencies: [Array.isArray(keys) ? keys.join(',') : keys, dataKey] },
  );

  return (
    <div {...props} ref={wrapperRef}>
      {children}
    </div>
  );
}

export default FlipReveal;
