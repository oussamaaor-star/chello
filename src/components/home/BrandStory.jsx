import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { ScrollExpandMedia } from '../ui/ScrollExpandMedia';

const BRAND_IMAGE = '/feed/our-story-bg.jpg';

// BRAND — Immersive full-width section
export function BrandStory() {
  const { lang } = useLanguage();
  const brandRef = useRef(null);

  const { scrollYProgress: brandProgress } = useScroll({
    target: brandRef,
    offset: ['start end', 'end start'],
  });
  const brandY = useTransform(brandProgress, [0, 1], [80, -80]);

  return (
    <section ref={brandRef} className="relative overflow-hidden min-h-[70vh] lg:min-h-[80vh] flex items-center">
      {/* Background image with parallax */}
      <motion.div style={{ y: brandY }} className="absolute inset-[-20%] sm:inset-[-10%]">
        <img
          src={BRAND_IMAGE}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 bg-ink/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-ink/40" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <ScrollReveal>
            <motion.p
              className="text-cream/50 text-[11px] font-semibold tracking-[0.3em] uppercase mb-6"
            >
              {lang === 'ar' ? 'من نحن' : 'Our Story'}
            </motion.p>
            <h2 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-cream mb-8 leading-[1.05]">
              Chello
            </h2>
            <p className="text-cream/60 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              {lang === 'ar'
                ? 'في Chello، نؤمن بأن كل امرأة تستحق أن تشعر بالأناقة والثقة. نختار لك بعناية أرقى التصاميم من أفضل الماركات العالمية — عبايات فاخرة، ملابس عصرية، شنط وأحذية راقية، وعطورات مميزة.'
                : 'At Chello, we believe every woman deserves to feel elegant and confident. We carefully curate the finest designs from top global brands — luxury abayas, modern fashion, premium bags and shoes, and distinctive perfumes.'}
            </p>
            <div className="flex flex-wrap gap-8 mb-10">
              {[
                { n: '500+', l: lang === 'ar' ? 'منتج متوفر' : 'Products Available' },
                { n: '1000+', l: lang === 'ar' ? 'عميلة سعيدة' : 'Happy Customers' },
                { n: '5★', l: lang === 'ar' ? 'تقييم العملاء' : 'Customer Rating' },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-cream text-2xl sm:text-3xl font-bold">{s.n}</p>
                  <p className="text-cream/40 text-xs uppercase tracking-wider mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <Link
              to="/a-propos"
              className="group inline-flex items-center gap-3 border-b-2 border-cream/40 pb-2 text-cream text-[13px] font-semibold uppercase tracking-[0.15em] hover:border-cream transition-colors"
            >
              {lang === 'ar' ? 'اعرفي المزيد' : 'Learn More'}
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          {/* Média qui s'agrandit au scroll (effet "scroll expand" — compatible Lenis) */}
          <ScrollExpandMedia
            mediaType="image"
            mediaSrc="/feed/our-story.jpg"
            alt="Chello — notre boutique"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
