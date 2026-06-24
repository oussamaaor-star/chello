// Vercel Serverless Function — /api/sitemap
//
// SOURCE DE VÉRITÉ UNIQUE : public/sitemap.xml
// -------------------------------------------------------------------------
// Historiquement ce handler générait un sitemap dynamique depuis Supabase.
// Problème : la base déployée présente un "schema drift" (slugs/seed obsolètes)
// et ce sitemap dynamique divergeait du fichier statique réellement servi en
// prod sur /sitemap.xml → URLs incohérentes / soft 404 pour Google.
//
// Choix retenu (le plus fiable) : ne plus dépendre de Supabase ici. Ce handler
// renvoie EXACTEMENT le même contenu que public/sitemap.xml (la référence,
// cohérente avec src/data/products.json, categories.json et blog.js).
// Ainsi /sitemap.xml (statique, servi par Vercel) et /api/sitemap renvoient
// toujours le même XML — zéro divergence possible.
//
// Le sitemap statique reste la version canonique référencée dans robots.txt.
// Pour le mettre à jour, on régénère public/sitemap.xml à partir du catalogue.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let cachedXml = null;

function loadSitemapXml() {
  if (cachedXml) return cachedXml;
  // public/ est déployé à la racine ; on lit le fichier canonique.
  const path = join(process.cwd(), 'public', 'sitemap.xml');
  cachedXml = readFileSync(path, 'utf8');
  return cachedXml;
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const xml = loadSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('[Sitemap] Unable to read public/sitemap.xml:', err.message);
    return res.status(500).json({ error: 'Failed to read sitemap' });
  }
}
