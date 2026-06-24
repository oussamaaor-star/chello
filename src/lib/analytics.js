// ─── Plausible Analytics helpers ─────────────────────────────────────────────
//
// Plausible injecte window.plausible() via le script dans index.html.
// Ce module expose des fonctions typées pour envoyer des événements custom.
//
// Usage :
//   import { trackEvent, trackPurchase } from '../lib/analytics';
//   trackEvent('Ajout panier', { props: { produit: 'chanel-n5' } });
//

function plausible(eventName, options) {
  if (typeof window === 'undefined') return;
  if (typeof window.plausible !== 'function') return;
  window.plausible(eventName, options);
}

// ─── Événements génériques ────────────────────────────────────────────────────

export function trackEvent(name, props = {}) {
  plausible(name, { props });
}

// ─── Événements e-commerce ───────────────────────────────────────────────────

/** Produit vu (page Product) */
export function trackProductView(productId, productName) {
  plausible('product_view', { props: { product_id: productId, product_name: productName } });
}

/** Article ajouté au panier */
export function trackAddToCart(productId, productName, price) {
  plausible('add_to_cart', { props: { product_id: productId, product_name: productName, price: String(price) } });
}

/** Début du checkout */
export function trackBeginCheckout(itemCount, total) {
  plausible('begin_checkout', { props: { items: String(itemCount), total: String(total) } });
}

/** Achat confirmé (après paiement Stripe) */
export function trackPurchase(orderId, total) {
  plausible('purchase', { props: { order_id: orderId, total: String(total) } });
}

/** Code promo appliqué */
export function trackPromoApplied(code) {
  plausible('promo_applied', { props: { code } });
}

/** Inscription compte */
export function trackSignUp() {
  plausible('sign_up');
}

/** Connexion compte */
export function trackLogin() {
  plausible('login');
}

/** Recherche */
export function trackSearch(query) {
  plausible('search', { props: { query } });
}

/** Téléchargement facture */
export function trackInvoiceDownload(orderId) {
  plausible('invoice_download', { props: { order_id: orderId } });
}
