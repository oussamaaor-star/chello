import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AutoVideo } from '../ui/AutoVideo';
import { fadeUp, scaleIn, stagger, EASE } from '../../lib/motion';

/**
 * STOREFRONT INVITE — moment de marque immersif + "shop the look".
 * À gauche : la vraie vidéo de l'enseigne Chello illuminée au mall
 * (storefront.mp4), portrait 9:16, en boucle muette (visible-only).
 * À droite : invitation luxe + raccourcis vers de vraies catégories
 * pour convertir directement.
 */
const QUICK_LINKS = [
  { to: '/categorie/abayas', ar: 'عبايات', en: 'Abayas' },
  { to: '/categorie/dresses', ar: 'ملابس جاهزة', en: 'Ready-to-wear' },
  { to: '/categorie/bags', ar: 'شنط', en: 'Bags' },
  { to: '/categorie/shoes', ar: 'أحذية', en: 'Shoes' },
];

export function StorefrontInvite() {
  const { lang } = useLanguage();
  const pick = (l) => (lang === 'ar' ? l.ar : l.en);

  return (
    <section className="bg-cream overflow-hidden border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Vidéo enseigne */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={scaleIn}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="relative aspect-[9/16] rounded-[1.75rem] overflow-hidden ring-1 ring-cream/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              <AutoVideo
                src="/videos/storefront.mp4"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/80 to-transparent" />
              <span className="absolute bottom-4 start-5 inline-flex items-center gap-2 text-cream/90 text-[13px] font-semibold tracking-wide">
                <MapPin className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'العريمي بوليفارد' : 'Al Araimi Boulevard'}
              </span>
            </div>
          </motion.div>

          {/* Invitation + raccourcis catégories */}
          <div className="text-center lg:text-start">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-silver-deep text-[11px] font-semibold tracking-[0.4em] uppercase mb-5"
            >
              {lang === 'ar' ? 'متجرنا في مسقط' : 'Step Inside'}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.05] mb-6"
            >
              {lang === 'ar'
                ? 'تجربة Chello'
                : 'The Chello Experience'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
              className="text-ink-soft text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-9"
            >
              {lang === 'ar'
                ? 'من واجهتنا المضيئة في العريمي بوليفارد إلى طلبك على باب منزلك — أناقة بلا حدود. ابدئي من تصنيفك المفضّل.'
                : 'From our glowing storefront at Al Araimi Boulevard to your doorstep — elegance without compromise. Start with your favourite edit.'}
            </motion.p>

            {/* Raccourcis catégories (conversion) */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger(0.08, 0.2)}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
            >
              {QUICK_LINKS.map((l) => (
                <motion.div key={l.to} variants={fadeUp}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-2 border border-ink/20 hover:border-ink text-ink/85 hover:text-ink font-medium uppercase tracking-[0.15em] text-[12px] rounded-full px-6 py-3 transition-all hover:bg-ink/5"
                  >
                    {pick(l)}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            >
              <Link
                to="/catalogue"
                className="group relative inline-flex items-center gap-3 rounded-full bg-ink hover:bg-ink/90 text-cream font-semibold uppercase tracking-[0.2em] text-[12px] sm:text-[13px] px-9 py-4 overflow-hidden transition-all duration-300 active:scale-[0.97]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-silver/20 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-3">
                  {lang === 'ar' ? 'تسوّقي الآن' : 'Shop Everything'}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StorefrontInvite;
