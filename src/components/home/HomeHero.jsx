import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { imgUrl } from '../../utils/img';
import { Sparkles } from '../ui/Sparkles';
import { EASE } from '../../lib/motion';

const HERO_IMAGE = '/products/abaya-black-1.jpg';

// HERO — Full-screen cinematic with image background
export function HomeHero() {
  const { lang } = useLanguage();
  const heroRef = useRef(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const heroOverlayOpacity = useTransform(heroProgress, [0, 1], [0.45, 0.7]);

  return (
    <section ref={heroRef} className="relative h-screen min-h-[100svh] max-h-[1200px] overflow-hidden">
      {/* Background image with parallax zoom */}
      <motion.div style={{ scale: heroScale }} className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          srcSet={[
            `${imgUrl(HERO_IMAGE, { w: 768, q: 70 })} 768w`,
            `${imgUrl(HERO_IMAGE, { w: 1280, q: 72 })} 1280w`,
            `${imgUrl(HERO_IMAGE, { w: 1920, q: 75 })} 1920w`,
          ].join(', ')}
          sizes="100vw"
          alt=""
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />
      </motion.div>

      {/* Dark overlay */}
      <motion.div
        style={{ opacity: heroOverlayOpacity }}
        className="absolute inset-0 bg-ink"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />

      {/* Content */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6"
      >
        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-cream/40" />
          <span className="text-cream/60 text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase">
            {lang === 'ar' ? 'بوتيك أزياء نسائي' : 'Women\'s Fashion Boutique'}
          </span>
          <div className="w-8 h-px bg-cream/40" />
        </motion.div>

        {/* Main title — massive (montée + fondu, SANS masque → aucun rognage des harakat/descendantes) */}
        <div className="relative text-center mb-6 sm:mb-8">
          <Sparkles className="z-0 opacity-60" count={6} />
          <motion.h1
            initial={{ opacity: 0, y: '22%' }}
            animate={{ opacity: 1, y: '0%' }}
            transition={{ duration: 1, delay: 0.4, ease: EASE }}
            className={`font-serif text-cream ${lang === 'ar'
              ? 'not-italic tracking-normal leading-[1.3] py-[0.08em] text-[2.6rem] sm:text-[3.75rem] md:text-[5rem] lg:text-[6.25rem]'
              : 'italic tracking-tight leading-[0.95] text-[2.85rem] min-[400px]:text-[3.5rem] sm:text-[5rem] md:text-[5.5rem] lg:text-[6rem]'}`}
          >
            {lang === 'ar' ? 'أناقتكِ' : 'Your'}
          </motion.h1>
          <motion.span
            initial={{ opacity: 0, y: '22%' }}
            animate={{ opacity: 1, y: '0%' }}
            transition={{ duration: 1, delay: 0.55, ease: EASE }}
            className={`block font-serif text-cream ${lang === 'ar'
              ? 'not-italic tracking-normal leading-[1.3] py-[0.08em] text-[2.6rem] sm:text-[3.75rem] md:text-[5rem] lg:text-[6.25rem]'
              : 'italic tracking-tight leading-[0.95] text-[2.85rem] min-[400px]:text-[3.5rem] sm:text-[5rem] md:text-[5.5rem] lg:text-[6rem]'}`}
          >
            {lang === 'ar' ? 'تستحقّ الأفضل' : 'Elegance'}
          </motion.span>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: EASE }}
          className="text-cream/70 text-sm sm:text-base max-w-lg text-center mb-10 leading-relaxed"
        >
          {lang === 'ar'
            ? 'عبايات، ملابس جاهزة، شنط، أحذية وعطورات — تسوّقي الآن أو زورينا في المتجر'
            : 'Abayas, ready-to-wear, bags, shoes & perfumes — shop online or visit us in store'}
        </motion.p>

        {/* CTA Buttons — empilés proprement sur mobile, en ligne dès sm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
          className="flex flex-col w-full max-w-xs mx-auto sm:flex-row sm:w-auto items-center justify-center gap-3 sm:gap-4"
        >
          {/* CTA primaire dominant */}
          <Link
            to="/catalogue"
            viewTransition
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-cream text-ink hover:bg-white px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] overflow-hidden transition-all active:scale-[0.97]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-silver/20 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-2.5">
              {lang === 'ar' ? 'تسوّقي الآن' : 'Shop Now'}
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </span>
          </Link>
          {/* CTA secondaire (outline) — vers les abayas, pas un doublon */}
          <Link
            to="/categorie/abayas"
            viewTransition
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-cream/30 hover:border-cream hover:bg-cream/10 text-cream px-8 py-4 text-[13px] font-medium uppercase tracking-[0.18em] transition-all active:scale-[0.97]"
          >
            {lang === 'ar' ? 'العبايات' : 'Abayas'}
          </Link>
        </motion.div>

        {/* Micro-réassurance sous les CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4, ease: EASE }}
          className="mt-6 text-cream/70 text-[11px] tracking-wide text-center px-4"
        >
          {lang === 'ar'
            ? 'الدفع عند الاستلام · توصيل لكل عُمان · إرجاع خلال 7 أيام'
            : 'Cash on delivery · Delivery across Oman · 7-day returns'}
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-cream/40 font-medium">
          {lang === 'ar' ? 'اكتشفي' : 'Scroll'}
        </span>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-cream/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
