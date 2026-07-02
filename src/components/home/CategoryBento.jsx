import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import categoriesData from '../../data/categories.json';
import { fadeUp, stagger } from '../../lib/motion';

const CATEGORY_COVERS = {
  dresses: '/products/trench-coat-1.jpg',
  abayas: '/products/abaya-beige-1.jpg',
  bags: '/feed/bag.jpg',
  shoes: '/products/heel-sandal-1.jpg',
  perfumes: '/feed/perfume.jpg',
};

// COLLECTIONS — Asymmetric bento grid
// N'affiche que les catégories ayant au moins un produit.
export function CategoryBento({ products }) {
  const { lang } = useLanguage();

  const cats = categoriesData.filter(c => products.filter(p => p.category === c.slug).length > 0);

  return (
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
  );
}
