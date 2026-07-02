export const SHOP_CONFIG = {
  name:          'Chello',
  wa_number:     '96896777671',
  wa_url:        'https://wa.me/96896777671',
  instagram_url: 'https://www.instagram.com/chello.stor',
  currency:      'ر.ع.',
  currency_code: 'OMR',
  address_ar:    'العريمي بوليفارد، الطابق الأول، شارع المطاعم، السيب، مسقط',
  address_en:    'Al Araimi Boulevard, 1st Floor, Restaurants Street, Seeb, Muscat',
};

// ── Livraison : UNE seule source de vérité (utilisée partout) ────────────────
// Seuil (en OMR) à partir duquel la livraison devient gratuite.
export const FREE_SHIPPING_AT = 30;
// Forfait de livraison unique (en OMR) appliqué sous le seuil.
export const SHIPPING_FEE = 1.5;

// Coût de livraison effectif pour un sous-total donné.
// → 0 si sous-total ≥ seuil (gratuit), sinon le forfait unique.
export function getShippingCost(subtotal) {
  return subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
}
