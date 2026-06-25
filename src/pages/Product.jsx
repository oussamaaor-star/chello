import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageCircle, ArrowRight, Ruler } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { useCatalogue } from '../hooks/useCatalogue';
import { useCart } from '../hooks/useCart';
import { useCartDrawer } from '../hooks/useCartDrawer';
import { SHOP_CONFIG } from '../utils/config';
import { ProductCard } from '../components/product/ProductCard';
import { ProductTabs } from '../components/product/ProductTabs';
import { SizeGuideModal } from '../components/product/SizeGuideModal';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { fadeUp, stagger, EASE } from '../lib/motion';

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

  const product = products.find((p) => p.slug === slug);

  useSEO({
    title: product ? buildTitle(product.name) : buildTitle(lang === 'ar' ? 'منتج' : 'Product'),
    description: product?.description || '',
    robots: product ? undefined : 'noindex,nofollow',
  });

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center bg-cream min-h-screen">
        <p className="text-ink-soft text-lg mb-6">{lang === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</p>
        <Link to="/catalogue" className="text-ink underline">{lang === 'ar' ? 'الرجوع للمتجر' : 'Back to shop'}</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, 1, selectedColor);
    open();
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-cream-deep">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                src={product.images?.[activeImage] || '/products/placeholder-dresses.svg'}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto scrollbar-none">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-cream-deep border-2 transition-all duration-300 ${activeImage === i ? 'border-ink' : 'border-transparent hover:border-ink/30'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
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
            <h1 className="font-serif italic text-2xl sm:text-3xl text-ink mb-3">{product.name}</h1>
            <p className="text-ink text-xl font-medium mb-8">
              {product.price != null
                ? `${Number(product.price).toFixed(2)} ${SHOP_CONFIG.currency}`
                : (lang === 'ar' ? 'السعر عند الطلب' : 'Price on request')}
            </p>

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
                <div className="flex gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border text-sm font-medium transition-all duration-300 active:scale-95 ${
                        selectedSize === size ? 'bg-ink text-cream border-ink' : 'border-ink/20 text-ink hover:border-ink'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft/70 mb-3">{lang === 'ar' ? 'اللون' : 'Color'}{selectedColor ? ` — ${selectedColor}` : ''}</p>
                <div className="flex gap-2.5">
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

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={product.price == null}
                className="group relative flex-1 bg-ink text-cream font-medium uppercase tracking-[0.15em] text-sm rounded-full py-4 overflow-hidden transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                <span className="relative z-10">{t('addToCart')}</span>
              </button>
              <a
                href={waOrderLink(product.name, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2.5 border border-ink/20 text-ink font-medium uppercase tracking-[0.15em] text-sm rounded-full py-4 hover:border-ink transition-all duration-300"
              >
                <MessageCircle size={16} />
                {lang === 'ar' ? 'اطلبي عبر واتساب' : 'Order via WhatsApp'}
              </a>
            </div>

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
              <Link to="/catalogue" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-ink-soft hover:text-ink transition-colors group">
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
      </div>
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
