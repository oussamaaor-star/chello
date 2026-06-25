import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { MapPin, MessageCircle, Gem, ArrowRight, Instagram, ChevronLeft } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useCatalogue } from '../hooks/useCatalogue';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from '../components/product/ProductCard';
import categoriesData from '../data/categories.json';
import { SHOP_CONFIG } from '../utils/config';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { fadeUp, scaleIn, stagger, EASE } from '../lib/motion';

const CATEGORY_COVERS = {
  dresses: '/products/trench-beige.png',
  abayas: '/products/co-ord-beige.png',
  bags: '/products/collection-sacs.png',
  shoes: '/products/sandale-talon-beige.png',
  perfumes: '/products/etagere-parfums.png',
};

const MARQUEE_ITEMS = [
  { ar: 'توصيل لكل عُمان', en: 'Delivery across Oman' },
  { ar: 'الدفع عند الاستلام', en: 'Cash on delivery' },
  { ar: 'تصاميم حصرية', en: 'Exclusive designs' },
  { ar: 'جودة فاخرة', en: 'Premium quality' },
  { ar: 'العريمي بوليفارد', en: 'Al Araimi Boulevard' },
  { ar: 'شحن سريع', en: 'Fast shipping' },
];

export default function Home() {
  const { t, lang } = useLanguage();
  const { products } = useCatalogue();
  const heroRef = useRef(null);
  const lookbookRef = useRef(null);

  useSEO(SEO_PRESETS.home);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, -80]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

  const { scrollYProgress: lookbookProgress } = useScroll({
    target: lookbookRef,
    offset: ['start end', 'end start'],
  });
  const lookbookY1 = useTransform(lookbookProgress, [0, 1], [60, -60]);
  const lookbookY2 = useTransform(lookbookProgress, [0, 1], [-40, 40]);

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const newest = (featured.length ? featured : products).slice(0, 8);
  const lookbookProducts = [
    products.find((p) => p.slug === 'robe-blazer-lavande'),
    products.find((p) => p.slug === 'top-cache-coeur-multicolore'),
  ].filter(Boolean);

  return (
    <div className="bg-cream overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          HERO — Full-bleed cinematic with parallax
      ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[85vh] lg:min-h-screen flex items-center bg-cream">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] right-[20%] rtl:right-auto rtl:left-[20%] w-[350px] h-[350px] rounded-full bg-silver/[0.05] blur-[100px]" />
          <div className="absolute bottom-[20%] left-[5%] rtl:left-auto rtl:right-[5%] w-[250px] h-[250px] rounded-full bg-ink/[0.02] blur-[80px]" />
          <motion.div style={{ y: heroY }} className="absolute top-[12%] left-1/2 -translate-x-1/2 w-px h-[200px] bg-gradient-to-b from-transparent via-silver/20 to-transparent" />
        </div>

        <motion.div
          style={{ opacity: heroContentOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28 lg:py-0"
        >
          <div className="text-center max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="text-silver-deep text-[11px] sm:text-xs font-semibold tracking-[0.35em] uppercase mb-8"
            >
              {lang === 'ar' ? 'العريمي بوليفارد · السيب · مسقط' : 'Al Araimi Boulevard · Seeb · Muscat'}
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: EASE }}
              className="w-12 h-px bg-silver mx-auto mb-10"
            />

            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 0.35, ease: EASE }}
                className="font-serif italic text-[3.5rem] sm:text-7xl lg:text-8xl text-ink leading-[1.05]"
              >
                {lang === 'ar' ? 'أناقتك' : 'Your'}
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 0.5, ease: EASE }}
                className="font-serif italic text-[3.5rem] sm:text-7xl lg:text-8xl text-ink leading-[1.05]"
              >
                {lang === 'ar' ? 'تستحق الأفضل' : 'Elegance'}
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
              className="text-ink-soft text-base sm:text-lg leading-relaxed mb-12 max-w-lg mx-auto"
            >
              {lang === 'ar'
                ? 'عبايات، ملابس جاهزة، شنط، أحذية وعطورات — تسوّقي الآن أو زورينا في المتجر.'
                : 'Abayas, ready-to-wear, bags, shoes & perfumes — shop online or visit us in store.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/catalogue"
                className="group relative inline-flex items-center gap-3 bg-ink text-cream font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-9 py-4 overflow-hidden transition-colors duration-300 active:scale-[0.97]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-3">
                  {lang === 'ar' ? 'تسوّقي الآن' : 'Shop Now'}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/fidelite"
                className="inline-flex items-center gap-2.5 border border-ink/20 hover:border-ink text-ink font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-9 py-4 transition-all duration-300"
              >
                <Gem className="w-3.5 h-3.5 text-silver-deep" />
                {lang === 'ar' ? 'برنامج الولاء' : 'Loyalty'}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[9px] uppercase tracking-[0.25em] text-ink-soft/50 font-medium">
            {lang === 'ar' ? 'اكتشفي' : 'Scroll'}
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-10 bg-gradient-to-b from-silver to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MARQUEE — Infinite scrolling brand values
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-ink/[0.06] bg-cream-deep/60 overflow-hidden py-4">
        <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '40s' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-6 mx-6">
              <span className="text-[13px] font-medium tracking-wide text-ink-soft/70 uppercase">
                {lang === 'ar' ? item.ar : item.en}
              </span>
              <span className="w-1 h-1 rounded-full bg-silver/50 flex-shrink-0" />
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORIES — Editorial grid with images
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
        <ScrollReveal>
          <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase text-center mb-4">
            {lang === 'ar' ? 'تصنيفاتنا' : 'Our Collections'}
          </p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-ink text-center mb-14">
            {lang === 'ar' ? 'تسوّقي حسب التصنيف' : 'Shop by Category'}
          </h2>
        </ScrollReveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger(0.1)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {categoriesData.filter(c => {
            const count = products.filter(p => p.category === c.slug).length;
            return count > 0;
          }).map((cat, idx) => (
            <motion.div key={cat.slug} variants={fadeUp} className={idx === 0 ? 'col-span-2 row-span-2' : ''}>
              <Link
                to={`/categorie/${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl bg-cream-deep aspect-[3/4]"
              >
                <img
                  src={CATEGORY_COVERS[cat.slug]}
                  alt={lang === 'ar' ? cat.label : cat.labelEn}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <h3 className="text-cream font-serif italic text-xl sm:text-2xl mb-1">
                    {lang === 'ar' ? cat.label : cat.labelEn}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-cream/70 text-xs font-medium uppercase tracking-wider group-hover:text-cream transition-colors">
                    {lang === 'ar' ? 'اكتشفي' : 'Discover'}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NEW ARRIVALS — Product grid with staggered reveal
      ═══════════════════════════════════════════════════════════ */}
      {newest.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
          <ScrollReveal className="flex items-end justify-between mb-12">
            <div>
              <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">
                {lang === 'ar' ? 'جديد في المتجر' : 'Just Landed'}
              </p>
              <h2 className="font-serif italic text-3xl sm:text-4xl text-ink">
                {lang === 'ar' ? 'وصل حديثاً' : 'New In'}
              </h2>
            </div>
            <Link
              to="/catalogue"
              className="hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-ink-soft hover:text-ink transition-colors group"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger(0.07)}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
          >
            {newest.map((p) => (
              <motion.div key={p.id} variants={fadeUp}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>

          <ScrollReveal className="mt-10 text-center sm:hidden">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 border border-ink/20 hover:border-ink text-ink font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-3.5 transition-colors"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </ScrollReveal>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LOOKBOOK — Editorial two-image parallax section
      ═══════════════════════════════════════════════════════════ */}
      <section ref={lookbookRef} className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="relative h-[500px] sm:h-[600px] lg:h-[680px]">
            {lookbookProducts[0] && (
              <motion.div style={{ y: lookbookY1 }} className="absolute left-0 top-0 w-[65%] sm:w-[60%] h-[75%] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(24,20,15,0.12)]">
                <img
                  src={lookbookProducts[0].images?.[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            )}
            {lookbookProducts[1] && (
              <motion.div style={{ y: lookbookY2 }} className="absolute right-0 bottom-0 w-[55%] sm:w-[50%] h-[60%] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(24,20,15,0.15)] border-4 border-cream z-10">
                <img
                  src={lookbookProducts[1].images?.[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            )}
            <div className="absolute -bottom-4 -left-4 rtl:-right-4 rtl:left-auto w-24 h-24 rounded-full border border-silver/30 flex items-center justify-center backdrop-blur-sm bg-cream/60 z-20">
              <span className="font-serif italic text-silver-deep text-[10px] tracking-wider text-center leading-tight">
                {lang === 'ar' ? 'مجموعة\nحصرية' : 'Exclusive\nCollection'}
              </span>
            </div>
          </div>

          <ScrollReveal className="lg:ps-8">
            <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">
              {lang === 'ar' ? 'لوك بوك' : 'Lookbook'}
            </p>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-6 leading-snug">
              {lang === 'ar' ? 'أسلوبك يعكس شخصيتك' : 'Your Style Tells Your Story'}
            </h2>
            <p className="text-ink-soft text-base leading-relaxed mb-8 max-w-md">
              {lang === 'ar'
                ? 'في Chello، نختار لك قطعاً تجمع بين الأناقة والراحة. كل تصميم يحكي قصة مختلفة — اختاري القصة التي تشبهك.'
                : 'At Chello, we curate pieces that blend elegance with comfort. Each design tells a different story — choose the one that speaks to you.'}
            </p>
            <Link
              to="/catalogue"
              className="group inline-flex items-center gap-3 border-b-2 border-ink pb-2 text-[13px] font-semibold uppercase tracking-[0.15em] text-ink hover:border-silver-deep hover:text-silver-deep transition-colors"
            >
              {lang === 'ar' ? 'استكشفي المجموعة' : 'Explore Collection'}
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LOYALTY — Premium dark banner
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <ScrollReveal variants={scaleIn}>
          <div className="max-w-5xl mx-auto rounded-[2rem] bg-ink relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(158,158,158,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(158,158,158,0.06),transparent_50%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver/30 to-transparent" />

            <div className="relative z-10 px-8 sm:px-14 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="w-12 h-12 rounded-full border border-silver/25 flex items-center justify-center mb-6">
                  <Gem className="text-silver-light" size={20} strokeWidth={1.5} />
                </div>
                <h2 className="font-serif italic text-3xl sm:text-4xl text-cream mb-4 leading-snug">
                  {lang === 'ar' ? 'بطاقة الولاء' : 'Loyalty Card'}
                </h2>
                <p className="text-cream/55 text-base leading-relaxed max-w-md mb-8">
                  {lang === 'ar'
                    ? 'سجّلي الآن واجمعي زياراتك — كل 8 زيارات تستحقين مفاجأة حصرية من Chello.'
                    : 'Sign up and collect visits — every 8 visits earn you an exclusive surprise from Chello.'}
                </p>
                <Link
                  to="/fidelite"
                  className="group relative inline-flex items-center gap-3 bg-silver hover:bg-silver-light text-ink font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-9 py-4 transition-all duration-300 overflow-hidden active:scale-[0.97]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                  <span className="relative z-10">
                    {lang === 'ar' ? 'سجّلي بياناتك' : 'Register Now'}
                  </span>
                </Link>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border border-silver/[0.08]"
                      style={{
                        width: `${160 + i * 80}px`,
                        height: `${160 + i * 80}px`,
                        top: '50%', left: '50%',
                        x: '-50%', y: '-50%',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 25 + i * 10, repeat: Infinity, ease: 'linear' }}
                    />
                  ))}
                  <div className="relative w-20 h-20 rounded-full bg-silver/10 flex items-center justify-center">
                    <span className="font-serif italic text-silver-light text-3xl">8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LOCATION — Google Maps + store info
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
            {lang === 'ar' ? 'موقعنا' : 'Our Location'}
          </p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-4">
            {lang === 'ar' ? 'زورينا في المتجر' : 'Visit Our Store'}
          </h2>
          <p className="text-ink-soft max-w-lg mx-auto">
            {lang === 'ar' ? SHOP_CONFIG.address_ar : SHOP_CONFIG.address_en}
          </p>
        </ScrollReveal>

        <ScrollReveal variants={scaleIn}>
          <div className="rounded-2xl overflow-hidden border border-ink/[0.06] shadow-[0_8px_40px_rgba(24,20,15,0.06)] bg-cream-deep">
            <a
              href="https://www.google.com/maps/place/Al+Araimi+Boulevard/@23.655748,58.182519,16z"
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative"
            >
              <div className="flex items-center justify-center py-20 sm:py-28 px-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ink/[0.06] flex items-center justify-center mx-auto mb-6 group-hover:bg-ink/10 transition-colors">
                    <MapPin className="w-7 h-7 text-ink-soft" />
                  </div>
                  <p className="font-serif italic text-2xl sm:text-3xl text-ink mb-3">
                    {lang === 'ar' ? 'العريمي بوليفارد' : 'Al Araimi Boulevard'}
                  </p>
                  <p className="text-ink-soft text-sm mb-6">
                    {lang === 'ar'
                      ? 'الطابق الأول، شارع المطاعم، السيب، مسقط'
                      : '1st Floor, Restaurant Street, Seeb, Muscat'}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-ink-soft group-hover:text-ink transition-colors">
                    {lang === 'ar' ? 'افتحي في الخريطة' : 'Open in Maps'}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://www.google.com/maps/place/chello%D8%8C+58.182519%D8%8C+23.655748/data=!4m2!3m1!1s0x3e8de5ab487d02b5:0xa76bb0a2578292a4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-ink text-cream font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-colors hover:bg-ink/90 active:scale-[0.97]"
          >
            <MapPin size={16} />
            {lang === 'ar' ? 'افتحي في الخريطة' : 'Open in Maps'}
          </a>
          <a
            href={SHOP_CONFIG.wa_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border border-ink/20 hover:border-ink text-ink font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-colors"
          >
            <MessageCircle size={16} />
            {lang === 'ar' ? 'تواصلي واتساب' : 'Chat on WhatsApp'}
          </a>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INSTAGRAM CTA — Follow us
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-ink/[0.06] bg-cream-deep/40">
        <ScrollReveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <Instagram className="mx-auto text-ink-soft/40 mb-5" size={28} strokeWidth={1.5} />
          <h2 className="font-serif italic text-2xl sm:text-3xl text-ink mb-3">
            {lang === 'ar' ? 'تابعينا على إنستغرام' : 'Follow Us on Instagram'}
          </h2>
          <p className="text-ink-soft text-sm mb-8">
            {lang === 'ar' ? 'اكتشفي آخر التصاميم والعروض الحصرية' : 'Discover the latest designs and exclusive offers'}
          </p>
          <a
            href={SHOP_CONFIG.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border border-ink/20 hover:border-ink text-ink font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-colors"
          >
            @chello.om
          </a>
        </ScrollReveal>
      </section>
    </div>
  );
}
