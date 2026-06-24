import { useState, useCallback } from 'react';

const KEY      = 'chello_recently_viewed';
const MAX_ITEMS = 8;

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState(readStorage);

  const addProduct = useCallback((product) => {
    if (!product?.id) return;
    const entry = {
      id:           product.id,
      slug:         product.slug,
      name:         product.name,
      brand:        product.brand,
      images:       product.images ?? [],
      originalPrice: product.originalPrice ?? null,
      sizes:        product.sizes ?? [],
      isNew:        product.isNew ?? false,
      discount:     product.discount ?? null,
    };
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next     = [entry, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setItems([]);
  }, []);

  return { items, addProduct, clearAll };
}
