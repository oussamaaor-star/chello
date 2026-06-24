import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { normalizeDbProduct } from '../hooks/useCatalogue';
import productsData from '../data/products.json';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  // localStorage est la source unique de vérité — pas de race condition possible
  const [items, setItems] = useLocalStorage('pm-wishlist-items', []);
  const [authUser, setAuthUser] = useState(null);

  // ── Sync DB → localStorage quand l'utilisateur se connecte ───────────────────
  const mergeFromDB = async (userId) => {
    const { data: wishRows } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    if (!wishRows?.length) return;

    const ids = wishRows.map((r) => r.product_id);

    // On récupère les produits manquants dans localStorage
    let currentItems = [];
    try {
      currentItems = JSON.parse(window.localStorage.getItem('pm-wishlist-items') || '[]');
      if (!Array.isArray(currentItems)) currentItems = [];
    } catch { currentItems = []; }
    const missingIds = ids.filter((id) => !currentItems.some((p) => p.id === id));
    if (!missingIds.length) return;

    const [productsRes, imagesRes] = await Promise.all([
      supabase.from('products').select('*').in('id', missingIds).eq('active', true),
      supabase.from('product_images')
        .select('product_id, image_url, sort_order')
        .in('product_id', missingIds)
        .order('sort_order'),
    ]);

    const imageMap = {};
    for (const r of (imagesRes.data ?? [])) {
      if (!imageMap[r.product_id]) imageMap[r.product_id] = [];
      imageMap[r.product_id].push(r.image_url);
    }

    const dbMap = {};
    for (const row of (productsRes.data ?? [])) {
      dbMap[row.id] = normalizeDbProduct(row, imageMap[row.id] ?? []);
    }

    const extra = missingIds
      .map((id) => dbMap[id] ?? productsData.find((p) => p.id === id) ?? null)
      .filter(Boolean);

    if (extra.length) {
      setItems((prev) => {
        const merged = [...prev];
        for (const p of extra) {
          if (!merged.some((i) => i.id === p.id)) merged.push(p);
        }
        return merged;
      });
    }
  };

  // ── Écoute auth ───────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setAuthUser(u);
      if (u) mergeFromDB(u.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setAuthUser(u);
      if (u) mergeFromDB(u.id);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────────────

  const isInWishlist = (productId) => items.some((item) => item.id === productId);

  const addToWishlist = (product) => {
    // Mise à jour localStorage immédiate — toujours
    setItems((prev) =>
      prev.some((i) => i.id === product.id) ? prev : [...prev, product]
    );
    // Sync Supabase silencieux si connecté
    if (authUser) {
      supabase
        .from('wishlists')
        .insert({ user_id: authUser.id, product_id: product.id })
        .then(() => {});
    }
  };

  const removeFromWishlist = (productId) => {
    // Mise à jour localStorage immédiate — toujours
    setItems((prev) => prev.filter((i) => i.id !== productId));
    // Sync Supabase silencieux si connecté
    if (authUser) {
      supabase
        .from('wishlists')
        .delete()
        .eq('user_id', authUser.id)
        .eq('product_id', productId)
        .then(() => {});
    }
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const clearWishlist = () => {
    setItems([]);
    if (authUser) {
      supabase.from('wishlists').delete().eq('user_id', authUser.id).then(() => {});
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
