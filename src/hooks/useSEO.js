import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME } from '../utils/seo';

/**
 * Imperatively sets document meta tags for SEO.
 * Works in any client-side React app without react-helmet.
 *
 * @param {object} options
 * @param {string} options.title       - Full <title> string
 * @param {string} [options.description]
 * @param {string} [options.ogType]    - 'website' | 'product' | 'article'
 * @param {string} [options.ogImage]   - Absolute URL
 * @param {string} [options.canonical] - Canonical URL (also sets og:url automatically)
 * @param {string} [options.keywords]  - Comma-separated keywords
 * @param {string} [options.robots]    - e.g. 'noindex,nofollow' for search result pages
 * @param {object|object[]} [options.jsonLd] - Structured data. A single schema.org object,
 *        or an array of objects to emit several <script type="application/ld+json"> blocks
 *        (e.g. LocalBusiness + FAQPage on the same page).
 */
export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  canonical,
  keywords,
  robots,
  jsonLd,
} = {}) {
  useEffect(() => {
    // ── Title ────────────────────────────────────────────────────────────────
    if (title) document.title = title;

    // ── Helper : upsert a <meta> tag ──────────────────────────────────────────
    function setMeta(selector, attr, value) {
      if (!value) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [key, val] = attr.split('=');
        el.setAttribute(key, val.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    }

    // ── Standard meta ─────────────────────────────────────────────────────────
    setMeta('meta[name="description"]', 'name=description', description);
    setMeta('meta[name="keywords"]',    'name=keywords',    keywords);
    // Toujours définir robots (défaut index,follow) pour éviter qu'un noindex
    // posé par une page précédente (checkout, login…) ne fuite sur les pages suivantes.
    setMeta('meta[name="robots"]',      'name=robots',      robots || 'index,follow');

    // ── Open Graph ────────────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]',       'property=og:title',       title || SITE_NAME);
    setMeta('meta[property="og:description"]', 'property=og:description', description);
    setMeta('meta[property="og:type"]',        'property=og:type',        ogType);
    setMeta('meta[property="og:image"]',       'property=og:image',       ogImage);
    setMeta('meta[property="og:site_name"]',   'property=og:site_name',   SITE_NAME);
    setMeta('meta[property="og:url"]',         'property=og:url',         canonical);

    // ── Twitter Card ──────────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]',        'name=twitter:card',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'name=twitter:title',       title || SITE_NAME);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', description);
    setMeta('meta[name="twitter:image"]',       'name=twitter:image',       ogImage);

    // ── Canonical ─────────────────────────────────────────────────────────────
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // ── Remove any stale hreflang tags ─────────────────────────────────────────
    // The site has no per-language URLs (language is a localStorage state), so
    // hreflang alternates would all point to the same canonical URL — invalid and
    // misleading for Search Console. We strip any previously injected ones.
    document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());

    // ── JSON-LD structured data ───────────────────────────────────────────────
    // Accepts a single object or an array of objects. Each entry becomes its own
    // <script type="application/ld+json"> block. Stale blocks from a previous
    // render are removed first so navigating between pages never leaves orphans.
    const LD_ATTR = 'data-jsonld-seo';
    document
      .querySelectorAll(`script[${LD_ATTR}]`)
      .forEach((el) => el.remove());

    if (jsonLd) {
      const blocks = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);
      blocks.forEach((block, i) => {
        const ldScript = document.createElement('script');
        ldScript.type = 'application/ld+json';
        ldScript.setAttribute(LD_ATTR, String(i));
        ldScript.textContent = JSON.stringify(block);
        document.head.appendChild(ldScript);
      });
    }
  }, [title, description, ogType, ogImage, canonical, keywords, robots, jsonLd]);
}
