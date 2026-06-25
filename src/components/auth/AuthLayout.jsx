import { memo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── AnimatedInput ────────────────────────────────────────────────────────────

export const AnimatedInput = memo(function AnimatedInput({ className = '', type, ...props }) {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(${visible ? '110px' : '0px'} circle at ${mouseX}px ${mouseY}px, rgba(158,158,158,0.25), transparent 80%)`;

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{ background: bg }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="rounded-xl p-[2px] transition duration-300"
    >
      <input
        type={type}
        className={`flex h-12 w-full rounded-xl border border-ink/10 bg-cream px-4 py-2 text-[16px]
          text-ink placeholder-ink-soft/50 transition duration-300
          focus:outline-none focus:border-silver focus:ring-2 focus:ring-silver/30 ${className}`}
        {...props}
      />
    </motion.div>
  );
});

// ─── BoxReveal ────────────────────────────────────────────────────────────────

export const BoxReveal = memo(function BoxReveal({
  children, width = 'fit-content', boxColor = 'rgba(158,158,158,0.5)',
  duration = 0.4, overflow = 'hidden', className,
}) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section ref={ref} style={{ position: 'relative', width, overflow }} className={className}>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden" animate={mainControls}
        transition={{ duration, delay: 0.1 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial="hidden" animate={slideControls}
        transition={{ duration, ease: 'easeIn' }}
        style={{ position: 'absolute', top: 4, bottom: 4, left: 0, right: 0, zIndex: 20, background: boxColor, borderRadius: 4 }}
      />
    </section>
  );
});

// ─── OrbitItem — Framer Motion (positions initiales garanties) ───────────────

function OrbitItem({ name, size, radius, duration, startAngle, cw, showPath }) {
  const half = size / 2;
  const endAngle = startAngle + (cw ? 360 : -360);

  return (
    <>
      {showPath && (
        <motion.svg
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none', overflow: 'visible',
            transformOrigin: '50% 50%',
          }}
          animate={{ rotate: cw ? 360 : -360 }}
          transition={{ duration: duration * 5, repeat: Infinity, ease: 'linear' }}
        >
          <circle
            cx="50%" cy="50%" r={radius}
            fill="none"
            stroke="rgba(158,158,158,0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </motion.svg>
      )}

      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
        <motion.div
          style={{
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            top: `${-(radius + half)}px`,
            left: `${-half}px`,
            transformOrigin: `${half}px ${radius + half}px`,
          }}
          animate={{ rotate: [startAngle, endAngle] }}
          transition={{ duration, repeat: Infinity, ease: 'linear', delay: 0 }}
        >
          <motion.div
            style={{ width: '100%', height: '100%' }}
            animate={{ rotate: [-startAngle, -endAngle] }}
            transition={{ duration, repeat: Infinity, ease: 'linear', delay: 0 }}
          >
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f5f0e8, #ece5d8)',
              border: '1px solid rgba(158,158,158,0.35)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 0 12px rgba(158,158,158,0.08)',
            }}>
              <span style={{
                fontSize: size >= 52 ? '11px' : '10px',
                fontWeight: 700,
                color: '#8f6c3e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1.25,
                padding: '0 6px',
              }}>
                {name}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Marques en orbite ────────────────────────────────────────────────────────

const BRANDS = [
  // Orbite 1 — r=95, 14s, horaire
  { name: 'CHELLO', size: 54, radius: 95,  duration: 14, startAngle: 0,   cw: true,  showPath: true  },
  { name: 'ZARA',   size: 48, radius: 95,  duration: 14, startAngle: 180, cw: true,  showPath: false },
  // Orbite 2 — r=160, 22s, anti-horaire
  { name: 'MANGO',  size: 60, radius: 160, duration: 22, startAngle: 90,  cw: false, showPath: true  },
  { name: 'H&M',    size: 52, radius: 160, duration: 22, startAngle: 270, cw: false, showPath: false },
  // Orbite 3 — r=230, 30s, horaire
  { name: 'SHEIN',  size: 56, radius: 230, duration: 30, startAngle: 45,  cw: true,  showPath: true  },
  { name: 'ZARA',   size: 50, radius: 230, duration: 30, startAngle: 165, cw: true,  showPath: false },
  { name: 'MANGO',  size: 50, radius: 230, duration: 30, startAngle: 285, cw: true,  showPath: false },
  // Orbite 4 — r=300, 42s, anti-horaire
  { name: 'CHELLO', size: 56, radius: 300, duration: 42, startAngle: 315, cw: false, showPath: true  },
  { name: 'H&M',    size: 50, radius: 300, duration: 42, startAngle: 135, cw: false, showPath: false },
];

// ─── Ripple ──────────────────────────────────────────────────────────────────

function Ripple() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {[120, 180, 240, 300, 360, 420].map((s, i) => (
        <span
          key={i}
          className="animate-ripple"
          style={{
            position: 'absolute',
            borderRadius: '50%',
            width: `${s}px`,
            height: `${s}px`,
            border: '1px solid rgba(158,158,158,0.15)',
            opacity: 0.2 - i * 0.025,
            animationDelay: `${i * 0.1}s`,
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Panneau animé ────────────────────────────────────────────────────────────

function AnimatedPanel({ side = 'left' }) {
  const logoCorner = { position: 'absolute', top: 28, [side]: 28, zIndex: 20 };

  return (
    <div
      style={{ position: 'fixed', top: 0, [side]: 0, width: '50%', height: '100vh', overflow: 'hidden', zIndex: 1 }}
      className="hidden lg:block"
    >
      {/* Fond */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #faf8f4 0%, #f1ece2 50%, #e8dfd0 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(158,158,158,0.08), transparent 70%)' }} />

      {/* Logo dans le coin extérieur du panneau */}
      <div style={logoCorner}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, color: '#b8915a' }}>
            Chello
          </span>
        </Link>
      </div>

      {/* Zone orbites */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 10 }}>
        <Ripple />
        {BRANDS.map((b, i) => <OrbitItem key={i} {...b} />)}

        {/* Centre */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pointerEvents: 'none', userSelect: 'none' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '3.2rem', fontWeight: 700, lineHeight: 1.1, background: 'linear-gradient(to bottom, rgba(24,20,15,0.6), rgba(24,20,15,0.15))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
            Chello
          </p>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(143,108,62,0.6)', marginTop: 10 }}>
            Women's Fashion
          </p>
        </div>
      </div>

      {/* Bullets de réassurance */}
      <div style={{ position: 'absolute', bottom: 52, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', margin: 0, padding: 0 }}>
          {['الدفع عند الاستلام', 'تصاميم أصلية', 'برنامج ولاء بمكافآت'].map((label) => (
            <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(158,158,158,0.4)', background: 'rgba(158,158,158,0.08)' }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 6l3 3 5-5" stroke="#b8915a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span style={{ fontSize: 12.5, letterSpacing: '0.04em', color: 'rgba(24,20,15,0.55)' }}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
        <p style={{ fontSize: 9, color: 'rgba(24,20,15,0.15)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          © 2026 Chello
        </p>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function AuthLayout({ children }) {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" dir="ltr">
      {/* En arabe : panneau à droite, formulaire à gauche */}
      <AnimatedPanel side={isAr ? 'right' : 'left'} />

      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className={`flex flex-col min-h-screen bg-cream relative overflow-hidden ${isAr ? 'lg:col-start-1' : 'lg:col-start-2'}`}
      >
        {/* Mobile decorative glow */}
        <div className="lg:hidden absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-silver/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-silver/5 rounded-full blur-[60px]" />
        </div>
        <div className="flex items-center justify-center pt-6 pb-4 lg:hidden">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="font-serif italic text-2xl text-silver group-hover:text-silver-deep transition-colors">Chello</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 lg:py-12 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-ink/10 bg-cream-deep/80 backdrop-blur-sm px-6 sm:px-8 py-8 sm:py-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
            {/* Liseré doré supérieur */}
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-silver/50 to-transparent" />
            {children}
          </div>
        </div>
        <div className="flex justify-center pb-6 lg:hidden">
          <Link to="/" className="text-xs text-ink-soft hover:text-ink transition-colors">
            {t('accountRetour')}
          </Link>
        </div>
      </div>
    </div>
  );
}
