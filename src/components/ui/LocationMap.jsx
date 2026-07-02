import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

// Carte interactive stylisée (décorative) — palette Chello : crème / ink / silver.
// Cliquer pour déplier ; léger effet 3D au survol.
export function LocationMap({
  location = 'Al Araimi Boulevard',
  coordinates = '23.588° N · 58.287° E',
  className = '',
}) {
  const { lang } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8]);
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsExpanded((v) => !v)}
    >
      <motion.div
        className={`relative overflow-hidden rounded-2xl bg-cream border border-ink/10 shadow-sm transition-[width] duration-500 ease-out ${
          isExpanded
            ? 'w-[min(360px,calc(100vw-2.5rem))]'
            : 'w-[min(240px,calc(100vw-2.5rem))]'
        }`}
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d' }}
        animate={{ height: isExpanded ? 280 : 140 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink/[0.04] via-transparent to-ink/[0.08]" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-cream-deep" />

              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <motion.line x1="0%" y1="35%" x2="100%" y2="35%" className="stroke-ink/25" strokeWidth="4"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                <motion.line x1="0%" y1="65%" x2="100%" y2="65%" className="stroke-ink/25" strokeWidth="4"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
                <motion.line x1="30%" y1="0%" x2="30%" y2="100%" className="stroke-ink/20" strokeWidth="3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
                <motion.line x1="70%" y1="0%" x2="70%" y2="100%" className="stroke-ink/20" strokeWidth="3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
                {[20, 50, 80].map((y, i) => (
                  <motion.line key={`h-${i}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} className="stroke-ink/10" strokeWidth="1.5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }} />
                ))}
                {[15, 45, 55, 85].map((x, i) => (
                  <motion.line key={`v-${i}`} x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%" className="stroke-ink/10" strokeWidth="1.5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }} />
                ))}
              </svg>

              {/* Buildings — tons silver */}
              <motion.div className="absolute top-[40%] left-[10%] w-[15%] h-[20%] rounded-sm bg-silver/40 border border-silver/30"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
              <motion.div className="absolute top-[15%] left-[35%] w-[12%] h-[15%] rounded-sm bg-silver/30 border border-silver/20"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.6 }} />
              <motion.div className="absolute top-[70%] left-[75%] w-[18%] h-[18%] rounded-sm bg-silver/35 border border-silver/25"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.7 }} />
              <motion.div className="absolute top-[20%] right-[10%] w-[10%] h-[25%] rounded-sm bg-silver/30 border border-silver/20"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.55 }} />

              {/* Pin (ink) */}
              <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(24,20,15,0.35))' }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#18140F" />
                  <circle cx="12" cy="9" r="2.5" fill="#FAF8F4" />
                </svg>
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-cream-deep via-transparent to-transparent opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid pattern — collapsed only */}
        <motion.div className="absolute inset-0 opacity-[0.04]" animate={{ opacity: isExpanded ? 0 : 0.04 }} transition={{ duration: 0.3 }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="chello-map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" className="stroke-ink" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#chello-map-grid)" />
          </svg>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="text-ink"
              animate={{ opacity: isExpanded ? 0 : 1 }} transition={{ duration: 0.3 }}>
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" x2="9" y1="3" y2="18" />
              <line x1="15" x2="15" y1="6" y2="21" />
            </motion.svg>

            <motion.div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
              animate={{ scale: isHovered ? 1.05 : 1, backgroundColor: isHovered ? 'rgba(24,20,15,0.08)' : 'rgba(24,20,15,0.05)' }}
              transition={{ duration: 0.2 }}>
              <div className="w-1.5 h-1.5 rounded-full bg-ink" />
              <span className="text-[10px] font-semibold text-ink-soft tracking-wide uppercase">Oman</span>
            </motion.div>
          </div>

          <div className="space-y-1">
            <motion.h3 className="text-ink font-semibold text-sm tracking-tight"
              animate={{ x: isHovered ? 4 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              {location}
            </motion.h3>

            <AnimatePresence>
              {isExpanded && (
                <motion.p dir="ltr" className="text-ink-soft text-xs font-mono text-start"
                  initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.25 }}>
                  {coordinates}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div className="h-px bg-gradient-to-r from-ink/40 via-silver/40 to-transparent"
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: isHovered || isExpanded ? 1 : 0.3 }}
              transition={{ duration: 0.4, ease: 'easeOut' }} />
          </div>
        </div>
      </motion.div>

      {/* Hint — masqué sur tactile (hover-only), traduit sur desktop */}
      <motion.p className="hidden lg:block absolute -bottom-6 left-1/2 text-[10px] text-ink-soft whitespace-nowrap" style={{ x: '-50%' }}
        initial={{ opacity: 0 }} animate={{ opacity: isHovered && !isExpanded ? 1 : 0, y: isHovered ? 0 : 4 }} transition={{ duration: 0.2 }}>
        {isExpanded ? '' : (lang === 'ar' ? 'اضغطي للتكبير' : 'Tap to expand')}
      </motion.p>
    </motion.div>
  );
}

export default LocationMap;
