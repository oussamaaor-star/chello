import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { MapPin, MessageCircle, ArrowRight, Instagram, Star, Mail } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useCatalogue } from '../hooks/useCatalogue';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from '../components/product/ProductCard';
import { RecentlyViewedProducts } from '../components/product/RecentlyViewedProducts';
import categoriesData from '../data/categories.json';
import { SHOP_CONFIG } from '../utils/config';
import { imgUrl } from '../utils/img';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { ReelGallery } from '../components/ui/ReelGallery';
import { CinematicLookbook } from '../components/home/CinematicLookbook';
import { StorefrontInvite } from '../components/home/StorefrontInvite';
import { TrustSignals } from '../components/home/TrustSignals';
import { LocationMap } from '../components/ui/LocationMap';
import { Sparkles } from '../components/ui/Sparkles';
import { InstagramSlider } from '../components/ui/InstagramSlider';
import { ScrollExpandMedia } from '../components/ui/ScrollExpandMedia';
import { getLoyaltyConfig } from '../utils/loyalty';
import { fadeUp, scaleIn, stagger, EASE } from '../lib/motion';

const HERO_IMAGE = '/products/abaya-black-1.jpg';
const HERO_IMAGE_2 = '/products/abaya-beige-1.jpg';

const CATEGORY_COVERS = {
  dresses: '/products/trench-coat-1.jpg',
  abayas: '/products/abaya-beige-1.jpg',
  bags: '/feed/bag.jpg',
  shoes: '/products/heel-sandal-1.jpg',
  perfumes: '/feed/perfume.jpg',
};

const BRAND_IMAGE = '/feed/our-story-bg.jpg';

// NB : ne PAS répéter les messages de <TrustSignals/> (توصيل/دفع/أصلي/الموقع) —
// ce bandeau sert de relais PROMO/éditorial pour éviter la redondance.
const MARQUEE_ITEMS = [
  { ar: 'خصم ١٠٪ على أول طلب', en: '10% off your first order' },
  { ar: 'تشكيلة ٢٠٢٦ الجديدة', en: 'New 2026 collection' },
  { ar: 'توصيل مجاني للطلبات فوق ٣٠ ر.ع', en: 'Free delivery over 30 OMR' },
  { ar: 'عبايات · فساتين · شنط · عطور', en: 'Abayas · Dresses · Bags · Perfumes' },
  { ar: 'وصل حديثاً كل أسبوع', en: 'New arrivals every week' },
  { ar: 'تسوّقي عبر واتساب بسهولة', en: 'Easy ordering on WhatsApp' },
];

export default function Home() {
  const { t, lang } = useLanguage();
  const { products } = useCatalogue();
  const heroRef = useRef(null);
  const brandRef = useRef(null);
  const [activeTab, setActiveTab] = useState('featured');

  // Newsletter (state local — pas de backend requis)
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone, setNlDone] = useState(false);

  // Bonus d'inscription fidélité chiffré (même source que RegisterLoyalty)
  const [signupBonus, setSignupBonus] = useState(5);

  useEffect(() => {
    getLoyaltyConfig()
      .then((c) => setSignupBonus(c?.signup_bonus ?? 5))
      .catch(() => {});
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlDone(true);
  };

  useSEO(SEO_PRESETS.home);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const heroOverlayOpacity = useTransform(heroProgress, [0, 1], [0.45, 0.7]);

  const { scrollYProgress: brandProgress } = useScroll({
    target: brandRef,
    offset: ['start end', 'end start'],
  });
  const brandY = useTransform(brandProgress, [0, 1], [80, -80]);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const newest = products.filter((p) => p.isNew && !p.featured).slice(0, 8);
  const displayProducts = activeTab === 'featured'
    ? (featured.length ? featured : products.slice(0, 8))
    : (newest.length ? newest : products.slice(0, 8));

  const cats = categoriesData.filter(c => products.filter(p => p.category === c.slug).length > 0);

  return (
    <div className="bg-cream overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Full-screen cinematic with image background
      ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════
          TRUST SIGNALS — réassurance juste après le hero
      ═══════════════════════════════════════════════════════════════ */}
      <TrustSignals />

      {/* ═══════════════════════════════════════════════════════════════
          MARQUEE — Bold scrolling strip
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-cream overflow-hidden py-5 border-y border-ink/10">
        <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '35s' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-8 mx-8">
              <span className="text-sm sm:text-base font-semibold tracking-[0.15em] text-ink/80 uppercase">
                {lang === 'ar' ? item.ar : item.en}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-silver/50 flex-shrink-0" />
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CINEMATIC LOOKBOOK — moment vidéo plein écran (lookbook.mp4)
      ═══════════════════════════════════════════════════════════════ */}
      <CinematicLookbook />

      {/* ═══════════════════════════════════════════════════════════════
          COLLECTIONS — Asymmetric bento grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
            {lang === 'ar' ? 'تصنيفاتنا' : 'Our Collections'}
          </p>
          <h2 className="font-serif italic text-4xl sm:text-5xl text-ink">
            {lang === 'ar' ? 'تسوّقي حسب التصنيف' : 'Shop by Category'}
          </h2>
        </ScrollReveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger(0.12)}
          className="grid grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 auto-rows-[160px] sm:auto-rows-[200px] lg:auto-rows-[215px]"
        >
          {/* Dresses — large */}
          {cats.find(c => c.slug === 'dresses') && (
            <motion.div variants={fadeUp} className="col-span-2 lg:col-span-7 row-span-2">
              <Link to="/categorie/dresses" className="group relative block w-full h-full overflow-hidden rounded-2xl">
                <img
                  src={CATEGORY_COVERS.dresses}
                  alt={lang === 'ar' ? 'ملابس جاهزة' : 'Ready-to-wear'}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent group-hover:from-ink/80 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                  <p className="text-cream/50 text-[11px] font-semibold tracking-[0.3em] uppercase mb-2">Collection</p>
                  <h3 className="text-cream font-serif italic text-3xl sm:text-4xl lg:text-[2.5rem] mb-3">
                    {lang === 'ar' ? 'ملابس جاهزة' : 'Ready-to-wear'}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-cream/70 text-sm font-medium uppercase tracking-wider group-hover:text-cream transition-colors">
                    {lang === 'ar' ? 'اكتشفي المجموعة' : 'Explore Collection'}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform duration-300" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Abayas */}
          {cats.find(c => c.slug === 'abayas') && (
            <motion.div variants={fadeUp} className="col-span-1 lg:col-span-5">
              <Link to="/categorie/abayas" className="group relative block w-full h-full overflow-hidden rounded-2xl">
                <img
                  src={CATEGORY_COVERS.abayas}
                  alt={lang === 'ar' ? 'عبايات' : 'Abayas'}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent group-hover:from-ink/80 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <h3 className="text-cream font-serif italic text-2xl sm:text-3xl mb-2">
                    {lang === 'ar' ? 'عبايات' : 'Abayas'}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-cream/60 text-xs font-medium uppercase tracking-wider group-hover:text-cream transition-colors">
                    {lang === 'ar' ? 'اكتشفي' : 'Discover'}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Bags */}
          {cats.find(c => c.slug === 'bags') && (
            <motion.div variants={fadeUp} className="col-span-1 lg:col-span-5">
              <Link to="/categorie/bags" className="group relative block w-full h-full overflow-hidden rounded-2xl">
                <img
                  src={CATEGORY_COVERS.bags}
                  alt={lang === 'ar' ? 'شنط' : 'Bags'}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent group-hover:from-ink/80 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <h3 className="text-cream font-serif italic text-2xl sm:text-3xl mb-2">
                    {lang === 'ar' ? 'شنط' : 'Bags'}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-cream/60 text-xs font-medium uppercase tracking-wider group-hover:text-cream transition-colors">
                    {lang === 'ar' ? 'اكتشفي' : 'Discover'}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Shoes */}
          {cats.find(c => c.slug === 'shoes') && (
            <motion.div variants={fadeUp} className="col-span-1 lg:col-span-6">
              <Link to="/categorie/shoes" className="group relative block w-full h-full overflow-hidden rounded-2xl">
                <img
                  src={CATEGORY_COVERS.shoes}
                  alt={lang === 'ar' ? 'أحذية' : 'Shoes'}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent group-hover:from-ink/80 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <h3 className="text-cream font-serif italic text-2xl sm:text-3xl mb-2">
                    {lang === 'ar' ? 'أحذية' : 'Shoes'}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-cream/60 text-xs font-medium uppercase tracking-wider group-hover:text-cream transition-colors">
                    {lang === 'ar' ? 'اكتشفي' : 'Discover'}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Perfumes */}
          {cats.find(c => c.slug === 'perfumes') && (
            <motion.div variants={fadeUp} className="col-span-1 lg:col-span-6">
              <Link to="/categorie/perfumes" className="group relative block w-full h-full overflow-hidden rounded-2xl">
                <img
                  src={CATEGORY_COVERS.perfumes}
                  alt={lang === 'ar' ? 'عطورات' : 'Perfumes'}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent group-hover:from-ink/80 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <h3 className="text-cream font-serif italic text-2xl sm:text-3xl mb-2">
                    {lang === 'ar' ? 'عطورات' : 'Perfumes'}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-cream/60 text-xs font-medium uppercase tracking-wider group-hover:text-cream transition-colors">
                    {lang === 'ar' ? 'اكتشفي' : 'Discover'}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PRODUCTS — Tabbed section (Featured / New)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-cream border-y border-ink/10">
        <div className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
              {lang === 'ar' ? 'منتجاتنا' : 'Our Products'}
            </p>
            <h2 className="font-serif italic text-4xl sm:text-5xl text-ink mb-8">
              {lang === 'ar' ? 'اختاري ما يناسبك' : 'Curated for You'}
            </h2>

            {/* Tabs — pastille sombre qui GLISSE d'un onglet à l'autre (layoutId) */}
            <div className="relative inline-flex items-center gap-1 bg-ink/[0.04] rounded-full p-1.5 border border-ink/15">
              <button
                onClick={() => setActiveTab('featured')}
                className={`relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  activeTab === 'featured' ? 'text-cream' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {activeTab === 'featured' && (
                  <motion.span
                    layoutId="homeProductTab"
                    className="absolute inset-0 rounded-full bg-ink shadow-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{lang === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}</span>
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  activeTab === 'new' ? 'text-cream' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {activeTab === 'new' && (
                  <motion.span
                    layoutId="homeProductTab"
                    className="absolute inset-0 rounded-full bg-ink shadow-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{lang === 'ar' ? 'وصل حديثاً' : 'New In'}</span>
              </button>
            </div>
          </ScrollReveal>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
          >
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>

          <ScrollReveal className="mt-14 text-center">
            <Link
              to="/catalogue"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-ink text-cream hover:bg-ink/90 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.97]"
            >
              {lang === 'ar' ? 'عرض كل المنتجات' : 'View All Products'}
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STOREFRONT INVITE — vidéo enseigne (storefront.mp4) + shop the look
      ═══════════════════════════════════════════════════════════════ */}
      <StorefrontInvite />

      {/* ═══════════════════════════════════════════════════════════════
          BRAND — Immersive full-width section
      ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════
          LOYALTY — Premium dark card
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <ScrollReveal variants={scaleIn}>
          <div className="max-w-5xl mx-auto rounded-3xl bg-cream-deep border border-ink/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(110,110,110,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(110,110,110,0.04),transparent_50%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver/30 to-transparent" />

            <div className="relative z-10 px-8 sm:px-14 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full border border-silver/40 flex items-center justify-center">
                    <Star className="text-silver-deep" size={20} strokeWidth={1.5} />
                  </div>
                  <span className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase">
                    {lang === 'ar' ? 'نظام النقاط' : 'Points System'}
                  </span>
                </div>
                <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-4 leading-snug">
                  {lang === 'ar' ? 'اجمعي نقاطك' : 'Collect Your Points'}
                </h2>
                <p className="text-ink-soft text-base leading-relaxed max-w-md mb-6">
                  {lang === 'ar'
                    ? 'سجّلي الآن واجمعي نقاط مع كل عملية شراء — استبدلي نقاطك بخصومات حصرية من Chello.'
                    : 'Sign up and earn points with every purchase — redeem your points for exclusive discounts from Chello.'}
                </p>
                {/* Bonus d'inscription CHIFFRÉ (valeur depuis getLoyaltyConfig, fallback 5) */}
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 bg-silver/10 border border-silver/30 rounded-full px-4 py-2">
                    <Star size={15} className="text-silver-deep flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-ink">
                      {t('loyaltySignupBonus').replace('{points}', signupBonus)}
                    </span>
                  </span>
                </div>
                <Link
                  to="/fidelite"
                  className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-ink hover:bg-ink/90 text-cream px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] overflow-hidden transition-all active:scale-[0.97]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-silver/20 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                  <span className="relative z-10">
                    {lang === 'ar' ? 'سجّلي الآن' : 'Register Now'}
                  </span>
                </Link>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border border-silver/25"
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
                  <div className="relative w-24 h-24 rounded-full bg-silver/15 flex items-center justify-center">
                    <Star className="text-silver-deep" size={32} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          NEWSLETTER — ancre #newsletter (levier -10% depuis le Footer)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="newsletter" className="bg-cream border-t border-ink/10 scroll-mt-24">
        <ScrollReveal className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Mail className="mx-auto text-silver-deep mb-5" size={28} strokeWidth={1.5} />
          <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-3">
            {t('nlTitle')}
          </h2>
          <p className="text-ink-soft text-sm sm:text-base mb-8 max-w-md mx-auto">
            {lang === 'ar'
              ? 'اشتركي لتصلك آخر الإطلالات والعروض الحصرية من Chello.'
              : 'Subscribe for the latest looks and exclusive Chello offers.'}
          </p>

          {nlDone ? (
            <p className="text-ink font-medium text-base bg-silver/10 border border-silver/30 rounded-full inline-block px-6 py-3">
              {lang === 'ar'
                ? '🎉 تم الاشتراك! ستصلك جديد إطلالاتنا وعروضنا.'
                : '🎉 You\'re subscribed! Our latest looks and offers are on the way.'}
            </p>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col w-full max-w-md mx-auto sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                placeholder={t('nlPlaceholder')}
                className="flex-1 bg-cream border border-ink/15 rounded-full py-3.5 px-5 text-ink placeholder-ink-soft/40 focus:border-ink outline-none text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-ink hover:bg-ink/90 text-cream px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.97]"
              >
                {t('nlBtn')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>
          )}
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE BOUTIQUE IN MOTION — galerie de reels (vidéos boutique)
      ═══════════════════════════════════════════════════════════════ */}
      <ReelGallery />

      {/* ═══════════════════════════════════════════════════════════════
          INSTAGRAM — Follow us
      ═══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-ink/10 bg-cream py-16 sm:py-24 overflow-hidden">
        <ScrollReveal className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <Instagram className="mx-auto text-silver-deep mb-5" size={28} strokeWidth={1.5} />
          <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-3">
            {lang === 'ar' ? 'تابعينا على إنستغرام' : 'Follow Us on Instagram'}
          </h2>
          <a
            href={SHOP_CONFIG.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="inline-block text-ink-soft hover:text-ink text-sm tracking-wide transition-colors"
          >
            @chello.stor
          </a>
        </ScrollReveal>

        {/* Galerie défilante pleine largeur (vraies images boutique) */}
        <InstagramSlider />

        <div className="text-center mt-12 px-4">
          <a
            href={SHOP_CONFIG.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-ink hover:bg-ink/90 text-cream font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-all active:scale-[0.97]"
          >
            <Instagram size={16} />
            {lang === 'ar' ? 'تابعينا' : 'Follow Us'}
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LOCATION — bande compacte (adresse + Maps + WhatsApp)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-cream border-t border-ink/10">
        <ScrollReveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-start">
            {/* Adresse + boutons */}
            <div className="flex flex-col items-center lg:items-start gap-7">
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-12 h-12 rounded-full border border-ink/15 flex items-center justify-center text-silver-deep">
                  <MapPin className="w-5 h-5" strokeWidth={1.5} />
                </span>
                <div className="text-start">
                  <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-2">
                    {lang === 'ar' ? 'زورينا في المتجر' : 'Visit Our Store'}
                  </p>
                  <p className="font-serif italic text-2xl sm:text-3xl text-ink mb-1.5">
                    {lang === 'ar' ? 'العريمي بوليفارد' : 'Al Araimi Boulevard'}
                  </p>
                  <p className="text-ink-soft text-sm max-w-sm">
                    {lang === 'ar'
                      ? 'الطابق الأول، شارع المطاعم، السيب، مسقط'
                      : '1st Floor, Restaurants Street, Seeb, Muscat'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href="https://www.google.com/maps/place/Al+Araimi+Boulevard/@23.655748,58.182519,16z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-ink hover:bg-ink/90 text-cream font-semibold uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-colors active:scale-[0.97]"
                >
                  <MapPin size={16} />
                  {lang === 'ar' ? 'الخريطة' : 'Google Maps'}
                </a>
                <a
                  href={SHOP_CONFIG.wa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 border border-ink/20 hover:border-ink text-ink font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-colors hover:bg-ink/5"
                >
                  <MessageCircle size={16} />
                  {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
                </a>
              </div>
            </div>

            {/* Carte interactive (cliquer pour déplier) */}
            <div className="shrink-0 flex justify-center pb-8 lg:pb-0">
              <LocationMap
                location={lang === 'ar' ? 'العريمي بوليفارد' : 'Al Araimi Boulevard'}
                coordinates="23.656° N · 58.183° E"
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          RECENTLY VIEWED — historique (n'apparaît que si l'utilisateur a vu des produits)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <RecentlyViewedProducts currentProductId={null} />
        </div>
      </section>
    </div>
  );
}
