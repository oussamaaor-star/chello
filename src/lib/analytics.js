// ─── Plausible Analytics helpers ─────────────────────────────────────────────
//
// Plausible injecte window.plausible() via le script dans index.html.
// Ce module expose des fonctions typées pour envoyer des événements custom.
//

function plausible(eventName, options) {
  if (typeof window === 'undefined') return;
  if (typeof window.plausible !== 'function') return;
  window.plausible(eventName, options);
}

/** Téléchargement facture */
export function trackInvoiceDownload(orderId) {
  plausible('invoice_download', { props: { order_id: orderId } });
}
