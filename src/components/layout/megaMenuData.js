// Shared category data for the desktop mega-menu + mobile menu.
// Image paths are verified to exist in /public.
export const MEGA_CATEGORIES = [
  {
    slug: 'dresses',
    en: 'Ready-to-wear',
    ar: 'ملابس جاهزة',
    image: '/products/trench-coat-1.jpg',
  },
  {
    slug: 'abayas',
    en: 'Abayas',
    ar: 'عبايات',
    image: '/products/abaya-beige-1.jpg',
  },
  {
    slug: 'bags',
    en: 'Bags',
    ar: 'شنط',
    image: '/feed/bag.jpg',
  },
  {
    slug: 'shoes',
    en: 'Shoes',
    ar: 'أحذية',
    image: '/products/heel-sandal-1.jpg',
  },
  {
    slug: 'perfumes',
    en: 'Perfumes',
    ar: 'عطورات',
    image: '/feed/perfume.jpg',
  },
];

// Resolve the right label for the current language (ar/en only — en is the
// default non-AR display per the header convention).
export function catLabel(cat, lang) {
  return lang === 'ar' ? cat.ar : cat.en;
}
