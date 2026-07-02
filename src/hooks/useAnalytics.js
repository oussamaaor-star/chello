/**
 * useAnalytics — wrapper Plausible Analytics
 *
 * RGPD-friendly : aucun cookie, aucune donnée personnelle, serveurs EU.
 * Pas de bannière de consentement requise.
 *
 * Activation : définir VITE_PLAUSIBLE_DOMAIN dans .env
 *   VITE_PLAUSIBLE_DOMAIN=monsite.fr
 *
 * En dev ou si la variable est absente : toutes les fonctions sont des no-ops.
 * Le script Plausible est injecté une seule fois, de manière asynchrone.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ─── Injection du script ──────────────────────────────────────────────────────

let _scriptInitialized = false;

function initPlausible() {
  if (_scriptInitialized) return;
  _scriptInitialized = true;

  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain) return; // pas configuré → silencieux

  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  // manual mode : on gère les pageviews SPA manuellement
  script.dataset.api   = 'https://plausible.io/api/event';
  script.src           = 'https://plausible.io/js/script.manual.js';
  document.head.appendChild(script);
}

// ─── Envoi d'un event ─────────────────────────────────────────────────────────

function fire(eventName, props = {}) {
  if (typeof window.plausible !== 'function') return;
  window.plausible(eventName, { props });
}

// ─── Tracking SPA : pageview à chaque changement de route ────────────────────

/**
 * À appeler une fois dans le composant racine des routes.
 * Injecte le script et envoie un 'pageview' à chaque navigation.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    initPlausible();
  }, []);

  useEffect(() => {
    fire('pageview');
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location.pathname]);
}

// ─── Hook analytics ───────────────────────────────────────────────────────────

/**
 * Retourne les trackers d'événements métier.
 * Tous les appels sont des no-ops si Plausible n'est pas configuré.
 */
export function useAnalytics() {
  return {
    /**
     * Page produit vue.
     * @param {{ name: string, category?: string }} product
     */
    trackProductView(product) {
      fire('Product View', {
        product:  product.name,
        category: product.category ?? '',
      });
    },

    /**
     * Produit ajouté au panier.
     * @param {{ name: string }} product
     * @param {number} quantity
     */
    trackAddToCart(product, quantity = 1) {
      fire('Add to Cart', {
        product:  product.name,
        quantity: String(quantity),
      });
    },

    /**
     * Checkout lancé (clic sur "Confirmer la commande").
     * @param {number} total en OMR (rial omanais, 3 décimales)
     */
    trackCheckoutStarted(total) {
      fire('Checkout Started', { revenue: Number(total).toFixed(3), currency: 'OMR' });
    },

    /**
     * Commande confirmée (paiement à la livraison — COD).
     * @param {string} orderId
     * @param {number} total en OMR (rial omanais, 3 décimales)
     */
    trackPurchase(orderId, total) {
      fire('Purchase', {
        order_id: orderId,
        revenue:  Number(total).toFixed(3),
        currency: 'OMR',
      });
    },
  };
}
