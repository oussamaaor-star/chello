import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS, SITE_URL } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useCatalogue } from '../hooks/useCatalogue';
import { ProductCard, ProductCardSkeleton } from '../components/product/ProductCard';
import { CategoryMenu } from '../components/ui/CategoryMenu';
import { CatalogueToolbar } from '../components/catalogue/CatalogueToolbar';
import { FlipReveal, FlipRevealItem } from '../components/ui/FlipReveal';
import categoriesData from '../data/categories.json';
import { EASE } from '../lib/motion';

// Ordre stable des tailles vêtements ; les valeurs inconnues sont rejetées à la fin.
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL'];
const sizeRank = (s) => {
  const i = SIZE_ORDER.indexOf(String(s).toUpperCase());
  if (i !== -1) return i;
  const n = parseFloat(s);
  return Number.isFinite(n) ? 1000 + n : 9999;
};

const isOutOfStock = (p) => p.stock === 0 || p.inStock === false;
const isBestseller = (p) => p.tags?.includes('bestseller') ?? false;

export default function Catalogue() {
  const { slug: categorySlug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { products, loading, error } = useCatalogue();

  // Catégorie active = état local (filtre animé client-side, sans recharger la page).
  // Initialisée depuis l'URL (deep-link /categorie/:slug).
  const [activeCat, setActiveCat] = useState(categorySlug || 'all');
  // Synchronise l'état DEPUIS l'URL (deep-link initial + boutons back/forward du
  // navigateur). setState avec la même valeur est idempotent → React bail-out,
  // donc pas de double déclenchement de l'animation Flip.
  useEffect(() => {
    setActiveCat(categorySlug || 'all');
  }, [categorySlug]);

  // Changement de catégorie côté UI (CategoryMenu contrôlé) :
  //  1) on met à jour l'état tout de suite → FlipReveal anime instantanément ;
  //  2) on pousse l'URL correspondante (deep-link / SEO / back cohérent) SANS
  //     recharger la page (navigate côté client). L'effet ci-dessus re-synchronisera
  //     l'état avec la même valeur (no-op), l'animation n'est donc jouée qu'une fois.
  const handleSelectCat = useCallback(
    (slug) => {
      const next = slug || 'all';
      setActiveCat(next);
      const url = next === 'all' ? '/catalogue' : `/categorie/${next}`;
      navigate(url);
    },
    [navigate],
  );

  // ── Tri + filtres (taille / en-stock) ────────────────────────────────────────
  // La catégorie reste gérée par CategoryMenu + FlipReveal ; ici on prépare le
  // tableau (tri + filtres taille/stock) AVANT le rendu de la grille.
  const [sort, setSort] = useState('new');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Tailles disponibles, SCOPÉES à la catégorie active (en mode "all" → tout le
  // catalogue). Évite de proposer des tailles qui n'existent pas dans la catégorie
  // affichée (ex. pointures de chaussures quand on regarde les abayas).
  const availableSizes = useMemo(() => {
    const set = new Set();
    products
      .filter((p) => activeCat === 'all' || p.category === activeCat)
      .forEach((p) => (p.sizes ?? []).forEach((s) => s && set.add(String(s))));
    return Array.from(set).sort((a, b) => sizeRank(a) - sizeRank(b));
  }, [products, activeCat]);

  // Si la taille filtrée n'existe plus (changement de données), on réinitialise.
  useEffect(() => {
    if (sizeFilter !== 'all' && !availableSizes.includes(sizeFilter)) setSizeFilter('all');
  }, [availableSizes, sizeFilter]);

  // Produits filtrés (taille + stock) puis triés. Le filtre CATÉGORIE n'est PAS
  // appliqué ici (FlipReveal s'en charge visuellement).
  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (inStockOnly && isOutOfStock(p)) return false;
      if (sizeFilter !== 'all' && !(p.sizes ?? []).map(String).includes(sizeFilter)) return false;
      return true;
    });

    const byPrice = (a, b, dir) => {
      const pa = a.price ?? Infinity;
      const pb = b.price ?? Infinity;
      return (pa - pb) * dir;
    };

    list = [...list];
    switch (sort) {
      case 'priceA': list.sort((a, b) => byPrice(a, b, 1)); break;
      case 'priceD': list.sort((a, b) => byPrice(a, b, -1)); break;
      case 'name':   list.sort((a, b) => String(a.name).localeCompare(String(b.name), lang === 'ar' ? 'ar' : 'en')); break;
      case 'best':   list.sort((a, b) => (isBestseller(b) ? 1 : 0) - (isBestseller(a) ? 1 : 0)); break;
      case 'new':
      default:       list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }
    return list;
  }, [products, sizeFilter, inStockOnly, sort, lang]);

  // Compteur = produits réellement visibles pour la catégorie active après filtres.
  const visibleCount = useMemo(
    () => visibleProducts.filter((p) => activeCat === 'all' || p.category === activeCat).length,
    [visibleProducts, activeCat],
  );

  const category = activeCat !== 'all' ? categoriesData.find((c) => c.slug === activeCat) : null;

  // Canonical explicite : sans ça la page hérite du canonical de la home (bug SEO).
  // /categorie/<slug> quand une catégorie est active, sinon /catalogue.
  const canonical = category ? `${SITE_URL}/categorie/${category.slug}` : `${SITE_URL}/catalogue`;

  useSEO(
    category
      ? {
          title: `${lang === 'ar' ? category.label : category.labelEn} | Chello`,
          description: `تشكيلة ${category.label} في متجر Chello — مسقط، عُمان.`,
          canonical,
        }
      : { ...SEO_PRESETS.catalogue, canonical },
  );

  // Signature des produits → re-applique le filtre quand les données changent (fallback → Supabase).
  // On signe l'ORDRE des produits visibles : le tri réordonne le tableau, donc cette
  // signature change et force Flip à recapturer correctement la nouvelle disposition.
  const productsSig = visibleProducts.map((p) => p.id).join(',');
  const flipDataKey = `${productsSig}|${sort}|${sizeFilter}|${inStockOnly}`;
  const hasMatch = visibleCount > 0;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center mb-8"
        >
          <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
            {lang === 'ar' ? 'تشكيلتنا' : 'Our Collection'}
          </p>
          <h1 className="font-serif italic text-3xl sm:text-4xl text-ink">
            {category
              ? (lang === 'ar' ? category.label : category.labelEn)
              : (lang === 'ar' ? 'كل المنتجات' : 'All Products')}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="mb-10"
        >
          <CategoryMenu activeSlug={activeCat === 'all' ? '' : activeCat} onSelect={handleSelectCat} />
        </motion.div>

        {/* Barre Tri + Filtres + Compteur (desktop inline / mobile bottom-sheet) */}
        <CatalogueToolbar
          count={visibleCount}
          sort={sort}
          onSortChange={setSort}
          sizes={availableSizes}
          sizeFilter={sizeFilter}
          onSizeChange={setSizeFilter}
          inStockOnly={inStockOnly}
          onInStockChange={setInStockOnly}
        />

        {/* États du hook useCatalogue :
            - error               → message (les données n'ont pas pu charger) ;
            - 1er chargement vide → grille de squelettes (avant tout produit) ;
            - sinon               → grille produits animée (GSAP Flip). */}
        {error ? (
          <p className="text-center text-ink-soft text-sm py-16">
            {lang === 'ar'
              ? 'تعذّر تحميل المنتجات. يُرجى المحاولة مرة أخرى.'
              : 'Could not load products. Please try again.'}
          </p>
        ) : loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Grille produits avec filtre ANIMÉ (GSAP Flip).
                On rend `visibleProducts` (déjà filtré taille/stock + trié) ; FlipReveal
                gère le filtre CATÉGORIE en masquant/affichant les items via `keys`.
                `dataKey` intègre la signature tri+filtres → Flip recapture l'état. */}
            <FlipReveal
              keys={[activeCat]}
              dataKey={flipDataKey}
              hideClass="hidden"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
            >
              {visibleProducts.map((p, i) => (
                <FlipRevealItem key={p.id} flipKey={p.category}>
                  <ProductCard product={p} priority={i < 4} />
                </FlipRevealItem>
              ))}
            </FlipReveal>

            {!hasMatch && (
              <p className="text-center text-ink-soft text-sm py-16">
                {sizeFilter !== 'all' || inStockOnly
                  ? (lang === 'ar' ? 'لا توجد منتجات تطابق الفلاتر المحددة.' : 'No products match the selected filters.')
                  : (lang === 'ar' ? 'لا توجد منتجات في هذه الفئة بعد.' : 'No products in this category yet.')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
