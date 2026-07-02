/** SEO configuration constants for the Chello e-commerce site */

export const SITE_NAME = 'Chello';
export const SITE_URL  = 'https://chello-nine.vercel.app';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-chello.png`;

export function buildTitle(pageTitle) {
  if (!pageTitle) return SITE_NAME;
  return `${pageTitle} | Chello`;
}

export const DEFAULT_DESCRIPTION =
  'Chello — متجر أزياء نسائية في العريمي بوليفارد، السيب، مسقط. عبايات، شنط، أحذية وعطورات. تواصل واتساب أو تسوّقي أونلاين.';

export const SEO_PRESETS = {
  home: {
    title: 'Chello — أزياء نسائية في مسقط، عُمان',
    description:
      'Chello : عبايات، ملابس جاهزة، شنط، أحذية وعطورات في العريمي بوليفارد، السيب، مسقط. تسوّقي أونلاين أو زورونا في المتجر.',
    keywords:
      'chello, تشيللو, ازياء نسائية مسقط, عبايات عمان, ملابس جاهزة السيب, العريمي بوليفارد',
    ogType: 'website',
  },
  catalogue: {
    title: buildTitle('المتجر — تسوّقي أونلاين'),
    description: 'تشكيلة Chello الكاملة: عبايات، ملابس جاهزة، شنط، أحذية وعطورات.',
    keywords: 'متجر chello, تسوق ازياء نسائية مسقط, عبايات عمان',
    ogType: 'website',
  },
  blog: {
    title: buildTitle('مدونة الأناقة'),
    description: 'نصائح أناقة، إطلالات وموضة من Chello.',
    keywords: 'مدونة ازياء, نصائح اناقة',
    ogType: 'website',
  },
  faq: {
    title: buildTitle('الأسئلة الشائعة'),
    description: 'أسئلة شائعة حول الطلب، التوصيل، الدفع وبرنامج الولاء في Chello.',
    keywords: 'اسئلة شائعة chello, توصيل عمان',
    ogType: 'website',
  },
  wishlist: {
    title: buildTitle('المفضلة'),
    description: 'منتجاتك المفضلة في Chello.',
    ogType: 'website',
    robots: 'noindex,nofollow',
  },
  login: {
    title: buildTitle('تسجيل الدخول'),
    description: 'سجّلي الدخول إلى حسابك في Chello.',
    ogType: 'website',
    robots: 'noindex,nofollow',
  },
  register: {
    title: buildTitle('إنشاء حساب'),
    description: 'انضمي إلى Chello.',
    ogType: 'website',
    robots: 'noindex,nofollow',
  },
  checkout: {
    title: buildTitle('إتمام الطلب'),
    description: 'أكملي طلبك. الدفع عند الاستلام.',
    ogType: 'website',
    robots: 'noindex,nofollow',
  },
  account: {
    title: buildTitle('حسابي'),
    description: 'إدارة الملف الشخصي والطلبات.',
    ogType: 'website',
    robots: 'noindex,nofollow',
  },
};
