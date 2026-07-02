import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProductCard } from '../product/ProductCard';
import { ScrollReveal } from '../ui/ScrollReveal';
import { EASE } from '../../lib/motion';

// PRODUCTS — Tabbed section (Featured / New)
export function FeaturedTabs({ products }) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('featured');

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const newest = products.filter((p) => p.isNew && !p.featured).slice(0, 8);
  const displayProducts = activeTab === 'featured'
    ? (featured.length ? featured : products.slice(0, 8))
    : (newest.length ? newest : products.slice(0, 8));

  return (
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
  );
}
