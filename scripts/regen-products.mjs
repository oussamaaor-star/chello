// One-off: régénère src/data/products.json depuis le catalogue Supabase.
// Réplique la normalisation de src/hooks/useCatalogue.js (normalizeDbProduct).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// --- Charger les vars d'env depuis .env ---
const env = {};
for (const line of readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const URL = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_ANON_KEY;
if (!URL || !KEY) { console.error('Missing Supabase env vars'); process.exit(1); }

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const get = async (path) => {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return res.json();
};

function normalizeDbProduct(row, imageUrls = [], stockRow = null, reviewStats = null) {
  const slug = row.slug || row.id;
  return {
    id: row.id,
    slug,
    name: row.name,
    brand: row.brand,
    categorySlug: row.category_slug,
    description: row.description ?? '',
    active: row.active ?? true,
    images: imageUrls.length > 0 ? imageUrls : [`/products/${row.id}.svg`],
    sizes: Array.isArray(row.sizes) && row.sizes.length > 0
      ? row.sizes.map((s) => ({ label: s.label, price: Number(s.price), ...(s.originalPrice != null ? { originalPrice: Number(s.originalPrice) } : {}) }))
      : row.base_price != null ? [{ label: '100 ml', price: Number(row.base_price) }] : [],
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    isNew: row.is_new ?? false,
    tags: row.is_bestseller ? ['bestseller'] : [],
    stock: stockRow?.stock ?? null,
    inStock: stockRow ? stockRow.stock > 0 : (row.in_stock ?? true),
    rating: reviewStats?.count > 0 ? Math.round((reviewStats.sum / reviewStats.count) * 10) / 10 : null,
    reviewCount: reviewStats?.count ?? null,
    notes: row.notes ?? null,
    gender: row.gender ?? null,
    olfactoryFamily: row.olfactory_family ?? null,
    occasion: row.occasion ?? [],
    concentration: row.concentration ?? null,
    longevity: row.longevity ?? null,
    projection: row.projection ?? null,
    season: row.season ?? [],
    inspiredBy: row.inspired_by ?? null,
    ingredients: row.ingredients ?? null,
    launchYear: row.launch_year ?? null,
    perfumer: row.perfumer ?? null,
    stockMl: row.stock_ml ?? null,
    videoUrl: row.video_url ?? null,
  };
}

const [products, images, stock, reviews] = await Promise.all([
  get('products?select=*&active=eq.true&order=name'),
  get('product_images?select=product_id,image_url,sort_order&order=sort_order'),
  get('product_stock?select=product_id,stock'),
  get('reviews?select=product_id,rating'),
]);

const imageMap = {};
for (const r of images) (imageMap[r.product_id] ??= []).push(r.image_url);
const stockMap = {};
for (const r of stock) stockMap[r.product_id] = r;
const reviewMap = {};
for (const r of reviews) { const m = (reviewMap[r.product_id] ??= { sum: 0, count: 0 }); m.sum += r.rating; m.count++; }

const out = products.map((row) => normalizeDbProduct(row, imageMap[row.id] ?? [], stockMap[row.id], reviewMap[row.id]));
writeFileSync(join(root, 'src/data/products.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`✅ products.json régénéré : ${out.length} produits — marques : ${[...new Set(out.map((p) => p.brand))].join(', ')}`);
