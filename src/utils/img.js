/**
 * Transforme une URL d'image pour optimiser la taille de téléchargement.
 * - Unsplash  : paramètres w, q, fm (transformation CDN native)
 * - Supabase  : proxy wsrv.nl pour redimensionner (gratuit, CDN mondial)
 * - Autres    : retournées telles quelles
 */
export function imgUrl(url, { w, q = 75, webp = true } = {}) {
  if (!url) return url;

  // ── Unsplash ──────────────────────────────────────────────────────────────
  if (url.includes('unsplash.com')) {
    try {
      const u = new URL(url);
      if (w) u.searchParams.set('w', w);
      if (q) u.searchParams.set('q', q);
      if (webp) {
        u.searchParams.set('fm', 'webp');
        u.searchParams.set('auto', 'format');
      }
      return u.toString();
    } catch {
      return url;
    }
  }

  // ── Supabase Storage → wsrv.nl pour redimensionnement CDN gratuit ─────────
  if (url.includes('supabase.co/storage') && (w || q !== 75)) {
    try {
      const bare = url.replace(/^https?:\/\//, '');
      const params = new URLSearchParams();
      params.set('url', bare);
      if (w)    params.set('w', w);
      if (q)    params.set('q', q);
      if (webp) params.set('output', 'webp');
      return `https://wsrv.nl/?${params.toString()}`;
    } catch {
      return url;
    }
  }

  return url;
}
