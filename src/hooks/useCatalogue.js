/**
 * useCatalogue — hook central catalogue
 *
 * Charge les produits depuis Supabase. Fallback propre vers products.json
 * si la table est vide ou Supabase non configuré.
 *
 * Stratégies :
 *   - Cache module-level avec TTL 1 min pour éviter les requêtes dupliquées
 *     sur les navigations intra-session (Product + produits similaires = 1 seul fetch)
 *   - État initial = products.json → la page n'est jamais vide pendant le chargement
 *   - Quand Supabase répond, les composants se mettent à jour avec les données DB
 */

import { useState, useEffect, startTransition } from 'react';
import { supabase } from '../lib/supabase';
import productsData from '../data/products.json';

export function normalizeDbProduct(row) {
  return {
    id: row.id,
    slug: row.slug || row.id,
    category: row.category,
    name: row.name,
    description: row.description ?? '',
    price: row.price != null ? Number(row.price) : null,
    images: row.images ?? [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    featured: row.featured ?? false,
    isNew: row.is_new ?? false,
    tags: row.is_bestseller ? ['bestseller'] : [],
    stock: row.stock ?? null,
    inStock: row.in_stock ?? true,
  };
}

const FALLBACK_PRODUCTS = productsData;

const CACHE_TTL = 60 * 1000;
let _cache = null;
let _cacheTTL = 0;
let _inflight = null;

async function fetchCatalogueData() {
  if (_cache && Date.now() < _cacheTTL) return _cache;
  if (_inflight) return _inflight;

  _inflight = (async () => {
    try {
      const productsRes = await supabase.from('products').select('*').eq('active', true).order('sort_order');

      const dbRows = productsRes.data;
      if (productsRes.error || !dbRows?.length) {
        const result = { products: FALLBACK_PRODUCTS, isFallback: true };
        _cache = result;
        _cacheTTL = Date.now() + CACHE_TTL;
        return result;
      }

      const products = dbRows.map((row) => normalizeDbProduct(row));
      const result = { products, isFallback: false };
      _cache = result;
      _cacheTTL = Date.now() + CACHE_TTL;
      return result;
    } finally {
      _inflight = null;
    }
  })();

  return _inflight;
}

export function useCatalogue() {
  const [state, setState] = useState(() => {
    if (_cache && Date.now() < _cacheTTL) return { ..._cache, loading: false, error: null };
    return { products: FALLBACK_PRODUCTS, loading: true, error: null, isFallback: true };
  });

  useEffect(() => {
    if (_cache && Date.now() < _cacheTTL) return;
    fetchCatalogueData()
      .then((data) => startTransition(() => setState({ ...data, loading: false, error: null })))
      .catch(() => startTransition(() => setState({ products: FALLBACK_PRODUCTS, loading: false, error: null, isFallback: true })));
  }, []);

  return state;
}

export function invalidateCatalogueCache() {
  _cache = null;
  _cacheTTL = 0;
}
