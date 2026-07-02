import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MEGA_CATEGORIES, catLabel } from './megaMenuData';

const EASE = [0.22, 1, 0.36, 1];
const panelVariants = {
  hidden: { opacity: 0, y: -14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.25, ease: EASE } },
};

/**
 * MEGA MENU — desktop. Rendu via PORTAL en position fixed (ancré sous le header,
 * mesuré dynamiquement) → ne peut JAMAIS être coupé par un parent overflow-hidden
 * ni mal positionné. Un seul fondu d'ensemble (pas d'orchestration fragile).
 */
export function MegaMenu({ open, onNavigate, onClose, onMouseEnter, onMouseLeave }) {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const dismiss = onClose || onNavigate;

  const [mounted, setMounted] = useState(false);
  const [top, setTop] = useState(96);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const h = document.querySelector('header');
      setTop(h ? Math.round(h.getBoundingClientRect().bottom) : 96);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Catcher clic-extérieur — commence SOUS le header (ne recouvre pas le bouton,
              sinon mouseleave → fermeture auto) */}
          <motion.div
            key="mega-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            style={{ top }}
            className="fixed left-0 right-0 bottom-0 z-[90] bg-ink/20 backdrop-blur-[2px]"
          />
          {/* Panneau */}
          <motion.div
            key="mega"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ top }}
            className="fixed left-0 right-0 z-[100]"
          >
            <div className="bg-cream border-b border-ink/10 shadow-[0_28px_60px_-20px_rgba(24,20,15,0.25)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 xl:py-11">

                {/* Intro */}
                <div className="text-center mb-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-silver-deep">
                    {isAr ? 'تسوّقي حسب الفئة' : 'Shop by Category'}
                  </p>
                  <h3 className="mt-2 font-serif italic text-3xl xl:text-4xl text-ink">
                    {isAr ? 'مجموعاتنا' : 'Our Collections'}
                  </h3>
                  <span className="mx-auto mt-4 block h-px w-16 bg-silver/60" />
                </div>

                {/* Grille de cartes catégories */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-5">
                  {MEGA_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/categorie/${cat.slug}`}
                      onClick={onNavigate}
                      className="group/card block focus:outline-none"
                    >
                      <div className="relative overflow-hidden rounded-2xl bg-cream-deep aspect-[4/5] ring-1 ring-ink/5 transition-shadow duration-500 group-hover/card:shadow-[0_20px_40px_-18px_rgba(24,20,15,0.35)]">
                        <img
                          src={cat.image}
                          alt={catLabel(cat, lang)}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover/card:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent opacity-80 transition-opacity duration-500 group-hover/card:opacity-95" />
                        <span className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink translate-y-2 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
                          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                        </span>
                      </div>
                      <p className="mt-3.5 text-center font-serif italic text-xl text-ink transition-colors duration-300 group-hover/card:text-silver-deep">
                        {catLabel(cat, lang)}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* Tout voir */}
                <div className="mt-9 text-center">
                  <Link
                    to="/catalogue"
                    onClick={onNavigate}
                    className="group/all inline-flex items-center gap-2.5 rounded-full border border-ink/15 bg-cream px-7 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:bg-ink hover:text-cream hover:border-ink"
                  >
                    {t('navCatalogue')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/all:translate-x-1 rtl:-scale-x-100" />
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
