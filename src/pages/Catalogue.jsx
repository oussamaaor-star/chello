import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useCatalogue } from '../hooks/useCatalogue';
import { ProductGrid } from '../components/product/ProductGrid';
import categoriesData from '../data/categories.json';
import { fadeUp, EASE } from '../lib/motion';

export default function Catalogue() {
  const { slug: categorySlug } = useParams();
  const { t, lang } = useLanguage();
  const { products, loading } = useCatalogue();

  const category = categorySlug ? categoriesData.find((c) => c.slug === categorySlug) : null;

  useSEO(
    category
      ? {
          title: `${lang === 'ar' ? category.label : category.labelEn} | Chello`,
          description: `تشكيلة ${category.label} في متجر Chello — مسقط، عُمان.`,
        }
      : SEO_PRESETS.catalogue,
  );

  const filtered = categorySlug ? products.filter((p) => p.category === categorySlug) : products;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center mb-10"
        >
          <p className="text-gold-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
            {lang === 'ar' ? 'تشكيلتنا' : 'Our Collection'}
          </p>
          <h1 className="font-serif italic text-3xl sm:text-4xl text-ink">
            {category ? (lang === 'ar' ? category.label : category.labelEn) : (lang === 'ar' ? 'كل المنتجات' : 'All Products')}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="flex items-center justify-center gap-2 overflow-x-auto pb-2 mb-12 scrollbar-none"
        >
          <Link
            to="/catalogue"
            className={`shrink-0 text-xs font-semibold uppercase tracking-wider rounded-full px-5 py-2.5 border transition-all duration-300 ${
              !categorySlug ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink-soft hover:border-ink hover:text-ink'
            }`}
          >
            {lang === 'ar' ? 'الكل' : 'All'}
          </Link>
          {categoriesData.map((cat) => (
            <Link
              key={cat.slug}
              to={`/categorie/${cat.slug}`}
              className={`shrink-0 text-xs font-semibold uppercase tracking-wider rounded-full px-5 py-2.5 border transition-all duration-300 ${
                categorySlug === cat.slug ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink-soft hover:border-ink hover:text-ink'
              }`}
            >
              {lang === 'ar' ? cat.label : cat.labelEn}
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
        >
          <ProductGrid products={filtered} loading={loading && filtered.length === 0} />
        </motion.div>
      </div>
    </div>
  );
}
