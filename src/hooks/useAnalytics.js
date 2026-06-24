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

import { useEffect, useRef } from 'react';
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

  // Injection unique du script au montage
  useEffect(() => {
    initPlausible();
  }, []);

  // Pageview à chaque changement de pathname
  useEffect(() => {
    fire('pageview');
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
     * @param {{ name: string, brand: string, categorySlug?: string }} product
     */
    trackProductView(product) {
      fire('Product View', {
        product:  product.name,
        brand:    product.brand,
        category: product.categorySlug ?? '',
      });
    },

    /**
     * Produit ajouté au panier.
     * @param {{ name: string, brand: string }} product
     * @param {number} quantity
     */
    trackAddToCart(product, quantity = 1) {
      fire('Add to Cart', {
        product:  product.name,
        brand:    product.brand,
        quantity: String(quantity),
      });
    },

    /**
     * Checkout lancé (clic sur "Confirmer et payer").
     * @param {number} total en euros
     */
    trackCheckoutStarted(total) {
      fire('Checkout Started', { revenue: total.toFixed(2) });
    },

    /**
     * Achat confirmé (paiement Stripe reçu).
     * @param {string} orderId
     * @param {number} total en euros
     */
    trackPurchase(orderId, total) {
      fire('Purchase', {
        order_id: orderId,
        revenue:  Number(total).toFixed(2),
      });
    },
  };
}
