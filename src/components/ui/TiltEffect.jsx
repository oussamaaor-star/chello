import { useRef } from 'react';

const isTouchDevice = typeof window !== 'undefined'
  && (window.matchMedia('(hover: none)').matches || 'ontouchstart' in window);

export function TiltEffect({ children, tiltFactor = 8, perspective = 900 }) {
  if (isTouchDevice) {
    return <div className="h-full">{children}</div>;
  }
  return <TiltDesktop tiltFactor={tiltFactor} perspective={perspective}>{children}</TiltDesktop>;
}

function TiltDesktop({ children, tiltFactor, perspective }) {
  const ref = useRef(null);
  const innerRef = useRef(null);

  function onMove(e) {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const rect = el.getBoundingClientRect();
    const rx = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -tiltFactor;
    const ry = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * tiltFactor;
    inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }

  function onLeave() {
    if (innerRef.current) innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }

  return (
    <div
      ref={ref}
      style={{ perspective, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="h-full"
    >
      <div
        ref={innerRef}
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.18s ease-out' }}
        className="h-full"
      >
        {children}
      </div>
    </div>
  );
}
