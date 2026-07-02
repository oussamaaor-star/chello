import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const BASE = 'https://chello-nine.vercel.app';
const TODAY = new Date().toISOString().slice(0, 10);

const products = JSON.parse(readFileSync(resolve(ROOT, 'src/data/products.json'), 'utf-8'));

const blogModule = readFileSync(resolve(ROOT, 'src/data/blog.js'), 'utf-8');
const slugs = [...blogModule.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

const staticPages = [
  { loc: '/',                          changefreq: 'daily',   priority: '1.0' },
  { loc: '/catalogue',                 changefreq: 'daily',   priority: '0.9' },
  { loc: '/blog',                      changefreq: 'weekly',  priority: '0.7' },
  { loc: '/fidelite',                  changefreq: 'monthly', priority: '0.7' },
  { loc: '/suivi',                     changefreq: 'monthly', priority: '0.4' },
  { loc: '/a-propos',                  changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact',                   changefreq: 'monthly', priority: '0.6' },
  { loc: '/faq',                       changefreq: 'monthly', priority: '0.7' },
  { loc: '/categorie/dresses',         changefreq: 'weekly',  priority: '0.9' },
  { loc: '/categorie/abayas',          changefreq: 'weekly',  priority: '0.9' },
  { loc: '/categorie/bags',            changefreq: 'weekly',  priority: '0.8' },
  { loc: '/categorie/shoes',           changefreq: 'weekly',  priority: '0.8' },
  { loc: '/categorie/perfumes',        changefreq: 'weekly',  priority: '0.8' },
  { loc: '/mentions-legales',          changefreq: 'yearly',  priority: '0.3' },
  { loc: '/cgv',                       changefreq: 'yearly',  priority: '0.3' },
  { loc: '/politique-confidentialite', changefreq: 'yearly',  priority: '0.3' },
  { loc: '/livraison-retours',         changefreq: 'yearly',  priority: '0.5' },
];

function urlEntry({ loc, changefreq, priority, lastmod }) {
  return `  <url>
    <loc>${BASE}${loc}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = [
  '<!-- Pages principales -->',
  ...staticPages.map(urlEntry),
  '',
  '<!-- Produits -->',
  ...products.map(p => urlEntry({
    loc: `/produit/${p.slug}`,
    changefreq: 'weekly',
    priority: '0.7',
  })),
  '',
  '<!-- Blog -->',
  ...slugs.map(s => urlEntry({
    loc: `/blog/${s}`,
    changefreq: 'monthly',
    priority: '0.6',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${entries.join('\n')}

</urlset>
`;

writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml, 'utf-8');
console.log(`Sitemap generated: ${staticPages.length} pages + ${products.length} products + ${slugs.length} blog articles`);
