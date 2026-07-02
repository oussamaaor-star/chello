import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageCircle, ArrowRight, Ruler, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { StarRating } from '../components/ui/StarRating';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { useCatalogue } from '../hooks/useCatalogue';
import { useCart } from '../hooks/useCart';
import { useCartDrawer } from '../hooks/useCartDrawer';
import { SHOP_CONFIG } from '../utils/config';
import { ProductCard } from '../components/product/ProductCard';
import { RecentlyViewedProducts } from '../components/product/RecentlyViewedProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { ProductTabs } from '../components/product/ProductTabs';
import { ProductGallery } from '../components/product/ProductGallery';
import { SizeGuideModal } from '../components/product/SizeGuideModal';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { fadeUp, stagger, EASE } from '../lib/motion';
import { imgUrl } from '../utils/img';
import { flyToCart } from '../utils/microAnimations';
import categoriesData from '../data/categories.json';

function waOrderLink(productName, lang) {
  const text =
    lang === 'ar'
      ? `مرحباً، أرغب بالاستفسار عن: ${productName}`
      : `Hi, I'd like to ask about: ${productName}`;
  return `${SHOP_CONFIG.wa_url}?text=${encodeURIComponent(text)}`;
}

export default function Product() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const { products } = useCatalogue();
  const { addToCart } = useCart();
  const { open } = useCartDrawer();
  const { addProduct } = useRecentlyViewed();

  const product = products.find((p) => p.slug === slug);

  useSEO({
    title: product ? buildTitle(product.name) : buildTitle(lang === 'ar' ? 'منتج' : 'Product'),
    description: product?.description || '',
    robots: product ? undefined : 'noindex,nofollow',
    canonical: product ? `https://chello-nine.vercel.app/produit/${product.slug}` : undefined,
    jsonLd: product ? [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || undefined,
        image: product.images?.length ? product.images : undefined,
        sku: product.slug,
        brand: { '@type': 'Brand', name: 'Chello' },
        offers: product.price != null ? {
          '@type': 'Offer',
          url: `https://chello-nine.vercel.app/produit/${product.slug}`,
          priceCurrency: 'OMR',
          price: product.price,
          availability: product.inStock !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'Chello' },
        } : undefined,
      },
      (() => {
        const cat = categoriesData.find((c) => c.slug === product.category);
        const items = [
          { '@type': 'ListItem', position: 1, name: lang === 'ar' ? 'الرئيسية' : 'Home', item: 'https://chello-nine.vercel.app/' },
          ...(cat ? [{
            '@type': 'ListItem',
            position: 2,
            name: lang === 'ar' ? cat.label : cat.labelEn,
            item: `https://chello-nine.vercel.app/categorie/${product.category}`,
          }] : []),
          { '@type': 'ListItem', position: cat ? 3 : 2, name: product.name, item: `https://chello-nine.vercel.app/produit/${product.slug}` },
        ];
        return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
      })(),
    ] : undefined,
  });

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  // Barre d'achat sticky mobile : on l'affiche quand le CTA principal sort du viewport
  const mainCtaRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    setSelectedSize(null);
    setSelectedColor(null);
    setSizeError(false);
  }, [slug]);

  useEffect(() => {
    const el = mainCtaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: '0px 0px -64px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [slug, product?.id]);

  // Enregistre le produit dans "vu récemment" (localStorage)
  useEffect(() => {
    if (product) addProduct(product);
  }, [product?.id, addProduct]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center bg-cream min-h-screen">
        <p className="text-ink-soft text-lg mb-6">{lang === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</p>
        <Link to="/catalogue" className="text-ink underline">{lang === 'ar' ? 'الرجوع للمتجر' : 'Back to shop'}</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const isOutOfStock = product.inStock === false;

  // Rareté : champ `stock` (normalizeDbProduct) — n'affiche rien si null/élevé
  const stock = typeof product.stock === 'number' ? product.stock : null;
  const isLowStock = !isOutOfStock && stock != null && stock >= 1 && stock <= 3;

  // Note ★ : strictement conditionnel — n'affiche rien si aucune note réelle.
  // (le produit ne porte pas de note/avis agrégés à ce niveau, cf. ProductTabs)
  const ratingValue = typeof product.rating === 'number' ? product.rating : null;
  const reviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : null;

  const priceLabel = product.price != null
    ? `${Number(product.price).toFixed(3)} ${SHOP_CONFIG.currency}`
    : (lang === 'ar' ? 'السعر عند الطلب' : 'Price on request');

  const waHref = waOrderLink(product.name, lang);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, 1, selectedColor);
    // L'image vole de la galerie vers l'icône panier, PUIS le drawer s'ouvre
    // (sinon il recouvrirait le vol). Sans animation (reduced motion,
    // navigateur ancien) : ouverture immédiate comme avant.
    const flew = flyToCart(
      document.getElementById('product-hero-zone'),
      imgUrl(product.images?.[0], { w: 120, q: 70 }),
    );
    if (flew) setTimeout(open, 550);
    else open();
  };

  const categoryData = categoriesData.find((c) => c.slug === product.category);
  const hasMultipleColors = product.name?.includes('بألوان متعددة') && !(product.colors?.length > 0);

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-ink-soft mb-6 flex items-center gap-1.5 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" viewTransition className="hover:text-ink transition-colors">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-ink-soft/50">&gt;</span>
          {categoryData ? (
            <>
              <Link to={`/categorie/${product.category}`} viewTransition className="hover:text-ink transition-colors">
                {lang === 'ar' ? categoryData.label : categoryData.labelEn}
              </Link>
              <span className="text-ink-soft/50">&gt;</span>
            </>
          ) : null}
          <span className="text-ink-soft/80">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <ProductGallery images={product.images} productName={product.name} />
          </motion.div>

          {/* Product details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          >
            <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
              {product.isNew ? (lang === 'ar' ? 'جديد' : 'New') : 'Chello'}
            </p>
            <h1 className="font-serif italic text-2xl sm:text-3xl text-ink mb-2">{product.name}</h1>

            {/* Note ★ — conditionnel : rien si aucune note réelle (pas de chiffre inventé) */}
            {ratingValue != null && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={ratingValue} showValue />
                {reviewCount != null && reviewCount > 0 && (
                  <span className="text-xs text-ink-soft/70">
                    ({reviewCount.toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-US')} {t('productAvisCount')})
                  </span>
                )}
              </div>
            )}

            <p className="text-2xl font-semibold text-ink mb-2">{priceLabel}</p>

            {/* Rareté — orange, uniquement si stock 1-3 */}
            {isLowStock && (
              <p className="text-sm font-semibold text-orange-600 mb-6">
                {stock === 1 ? t('productLowStockOne') : t('productLowStockFew', { n: stock })}
              </p>
            )}
            {!isLowStock && <div className="mb-8" />}

            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft/70">{lang === 'ar' ? 'المقاس' : 'Size'}</p>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-silver-deep hover:text-ink transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    {t('sizeGuideLink')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`w-12 h-12 rounded-full border text-sm font-medium transition-all duration-300 active:scale-95 ${
                        selectedSize === size ? 'bg-ink text-cream border-ink' : sizeError ? 'border-red-400 text-ink' : 'border-ink/20 text-ink hover:border-ink'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && <p className="text-xs text-red-500 mt-2">{t('productSelectSize')}</p>}
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft/70 mb-3">{lang === 'ar' ? 'اللون' : 'Color'}{selectedColor ? ` — ${selectedColor}` : ''}</p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 active:scale-95 ${
                        selectedColor === color.name ? 'border-ink scale-110' : 'border-ink/15 hover:border-ink/40'
                      }`}
                    >
                      <span
                        className="block w-full h-full rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isOutOfStock ? (
              <div className="mb-4 space-y-3">
                <div className="px-4 py-3 rounded-2xl bg-ink/5 border border-ink/10">
                  <span className="text-sm font-semibold text-ink">{lang === 'ar' ? 'غير متوفر حالياً' : 'Currently out of stock'}</span>
                </div>
                <p className="text-xs text-ink-soft">
                  {lang === 'ar'
                    ? 'هذا المنتج غير متوفر مؤقتاً. تواصلي معنا عبر واتساب لمعرفة موعد توفره.'
                    : "This item is temporarily unavailable. Contact us on WhatsApp to check when it's back."}
                </p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 border border-ink/20 text-ink font-medium uppercase tracking-[0.1em] sm:tracking-[0.15em] text-sm rounded-full py-4 hover:border-ink transition-all duration-300"
                >
                  <MessageCircle size={16} />
                  {lang === 'ar' ? 'اطلبي عبر واتساب' : 'Order via WhatsApp'}
                </a>
              </div>
            ) : (
              <div ref={mainCtaRef} className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.price == null}
                  className="group relative flex-1 bg-ink text-cream font-medium uppercase tracking-[0.15em] text-sm rounded-full py-4 overflow-hidden transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                  <span className="relative z-10">{t('addToCart')}</span>
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 border border-ink/20 text-ink font-medium uppercase tracking-[0.1em] sm:tracking-[0.15em] text-sm rounded-full py-4 hover:border-ink transition-all duration-300"
                >
                  <MessageCircle size={16} />
                  {lang === 'ar' ? 'اطلبي عبر واتساب' : 'Order via WhatsApp'}
                </a>
              </div>
            )}

            {/* Réassurance — pictos discrets sous le CTA d'ajout */}
            {!isOutOfStock && (
              <div className="grid grid-cols-3 gap-3 mb-8 border-t border-ink/10 pt-5">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-silver-deep" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold text-ink leading-tight">{t('productPaiementLivraison')}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Truck className="w-5 h-5 text-silver-deep" strokeWidth={1.5} />
                  <span className="text-[11px] text-ink-soft leading-tight">{t('productLivraisonDesc')}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <RotateCcw className="w-5 h-5 text-silver-deep" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold text-ink leading-tight">{lang === 'ar' ? 'إرجاع خلال 7 أيام' : '7-day returns'}</span>
                </div>
              </div>
            )}

            {hasMultipleColors && (
              <p className="text-xs text-ink-soft leading-relaxed mb-10">
                {lang === 'ar'
                  ? 'متوفر بألوان متعددة — اختاري اللون عبر واتساب'
                  : 'Available in multiple colors — choose your color via WhatsApp'}
              </p>
            )}

            {!hasMultipleColors && <div className="mb-10" />}

            {product.description && (
              <div className="pt-7 border-t border-ink/10">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft/70 mb-3">{lang === 'ar' ? 'الوصف' : 'Description'}</h2>
                <p className="text-ink-soft leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Product tabs (Description, About/Notes, Reviews) */}
        <section className="mt-16">
          <ProductTabs product={product} />
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-28">
            <ScrollReveal className="flex items-center justify-between mb-12">
              <div>
                <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">
                  {lang === 'ar' ? 'اختاري المزيد' : 'Keep Exploring'}
                </p>
                <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">{lang === 'ar' ? 'منتجات مشابهة' : 'You May Also Like'}</h2>
              </div>
              <Link to="/catalogue" viewTransition className="hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-ink-soft hover:text-ink transition-colors group">
                {lang === 'ar' ? 'عرض الكل' : 'View all'}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </ScrollReveal>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger(0.08)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-10"
            >
              {related.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Vu récemment */}
        <RecentlyViewedProducts currentProductId={product.id} />
      </div>

      {/* ── Barre d'achat sticky mobile (apparaît quand le CTA principal sort du viewport) ── */}
      {!isOutOfStock && (
        <div
          className={`fixed bottom-0 inset-x-0 z-40 lg:hidden bg-cream/95 backdrop-blur-sm border-t border-ink/10 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all duration-300 ${
            showStickyBar ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[10px] text-ink-soft/70 truncate">{product.name}</span>
              <span className="text-base font-semibold text-ink whitespace-nowrap">{priceLabel}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.price == null}
              className="flex-1 bg-ink text-cream font-semibold uppercase tracking-[0.08em] text-sm rounded-full py-3.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              {t('addToCart')}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={lang === 'ar' ? 'اطلبي عبر واتساب' : 'Order via WhatsApp'}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center border border-ink/20 text-ink rounded-full hover:border-ink active:scale-95 transition-all"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      )}

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
