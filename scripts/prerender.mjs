/**
 * scripts/prerender.mjs
 * ---------------------------------------------------------------------------
 * Prerendering POST-BUILD pour la SPA "Chello".
 *
 * Objectif : générer un snapshot HTML statique par route publique (via Chrome
 * headless / puppeteer) afin que les robots & réseaux sociaux voient le vrai
 * contenu + le JSON-LD, SANS réécrire l'application.
 *
 * Fonctionnement :
 *   1. Construit la liste des routes (statiques + données JSON/JS + villes).
 *   2. Démarre un petit serveur HTTP statique local sur `dist/` (fallback SPA).
 *   3. Lance puppeteer, visite chaque route, attend le rendu réel + le <head>
 *      rempli par useSEO, et récupère le HTML EN MÉMOIRE.
 *   4. Écrit les fichiers `dist/<route>/index.html` après la boucle.
 *
 * IMPÉRATIF : NON-BLOQUANT. Toute erreur fatale -> warning + process.exit(0).
 * Le build ne doit JAMAIS échouer à cause du prerender (au pire : SPA normal).
 * ---------------------------------------------------------------------------
 */

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Chemins absolus (le cwd peut varier selon l'environnement de build) ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DATA = path.join(ROOT, 'src', 'data');

const PORT = 4567; // port local éphémère pour le serveur statique
const HOST = '127.0.0.1';

// ---------------------------------------------------------------------------
// 1. CONSTRUCTION DE LA LISTE DES ROUTES
// ---------------------------------------------------------------------------

// Routes statiques publiques (indexables)
const STATIC_ROUTES = [
  '/',
  '/catalogue',
  '/blog',
  '/faq',
  '/a-propos',
  '/contact',
  '/suivi',
  '/fidelite',
  '/mentions-legales',
  '/cgv',
  '/politique-confidentialite',
  '/livraison-retours',
];

// Pages SEO par ville — à repeupler avec les gouvernorats d'Oman (Mascate, Seeb...)
const CITY_ROUTES = [];

// Routes PRIVÉES / noindex à EXCLURE absolument du prerender.
// (préfixes — on filtre toute route qui commence par l'un d'eux)
const EXCLUDE_PREFIXES = [
  '/admin',
  '/compte',
  '/checkout',
  '/connexion',
  '/inscription',
  '/favoris',
  '/recherche',
  '/confirmation-commande',
  '/mot-de-passe-oublie',
  '/reset-password',
  '/fidelite/carte',
  '/fidelite/retrouver',
];

/** Lit + parse un fichier JSON ; renvoie [] (ou défaut) si échec (non bloquant). */
async function readJsonSafe(file, fallback = []) {
  try {
    const raw = await fsp.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[prerender] ⚠ Lecture/parse échouée pour ${file} : ${err.message}`);
    return fallback;
  }
}

/** Construit la liste complète et dédupliquée des routes à prerender. */
async function buildRoutes() {
  const routes = new Set([...STATIC_ROUTES, ...CITY_ROUTES]);

  // --- Catégories : src/data/categories.json -> /categorie/<slug> ---
  const categories = await readJsonSafe(path.join(DATA, 'categories.json'));
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      if (cat && typeof cat.slug === 'string' && cat.slug) {
        routes.add(`/categorie/${cat.slug}`);
      }
    }
  }

  // --- Produits : src/data/products.json -> /produit/<slug> ---
  const products = await readJsonSafe(path.join(DATA, 'products.json'));
  if (Array.isArray(products)) {
    for (const p of products) {
      if (p && typeof p.slug === 'string' && p.slug) {
        routes.add(`/produit/${p.slug}`);
      }
    }
  }

  // --- Articles blog : src/data/blog.js lu en TEXTE, slugs extraits par regex ---
  // (blog.js est un module ES qu'on ne peut pas importer simplement ici ;
  //  on extrait les `slug: '...'` au regex. En cas d'échec : on ignore.)
  try {
    const blogSrc = await fsp.readFile(path.join(DATA, 'blog.js'), 'utf8');
    const re = /slug:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(blogSrc)) !== null) {
      if (m[1]) routes.add(`/blog/${m[1]}`);
    }
  } catch (err) {
    console.warn(`[prerender] ⚠ Extraction des slugs blog ignorée : ${err.message}`);
  }

  // --- Filtrage des routes privées / noindex ---
  const filtered = [...routes].filter(
    (r) => !EXCLUDE_PREFIXES.some((pref) => r === pref || r.startsWith(pref + '/') || r.startsWith(pref))
  );

  return filtered;
}

// ---------------------------------------------------------------------------
// 2. SERVEUR STATIQUE LOCAL (avec fallback SPA)
// ---------------------------------------------------------------------------

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/** Crée et démarre le serveur statique sur DIST avec fallback SPA. */
function startStaticServer() {
  const server = http.createServer((req, res) => {
    try {
      // On ignore la query string et on décode l'URL
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

      // Empêche tout path traversal (../) en normalisant dans DIST
      let filePath = path.normalize(path.join(DIST, urlPath));
      if (!filePath.startsWith(DIST)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      // Si le chemin pointe sur un dossier existant -> index.html du dossier
      let stat = null;
      try {
        stat = fs.statSync(filePath);
      } catch {
        stat = null;
      }
      if (stat && stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();

      // Fallback SPA : si le fichier n'existe pas ET que ce n'est pas un asset
      // (pas d'extension OU une "route" sans fichier réel), on sert index.html.
      if (!fs.existsSync(filePath)) {
        if (!ext) {
          filePath = path.join(DIST, 'index.html');
        } else {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
      }

      const finalExt = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[finalExt] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500);
      res.end('Server error');
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(PORT, HOST, () => resolve(server));
  });
}

// ---------------------------------------------------------------------------
// 3. PRERENDER VIA PUPPETEER
// ---------------------------------------------------------------------------

async function run() {
  // Vérifie que dist/ existe (sinon rien à prerender)
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.warn('[prerender] ⚠ dist/index.html introuvable — prerender ignoré.');
    process.exit(0);
  }

  const routes = await buildRoutes();
  console.log(`[prerender] ${routes.length} route(s) à prerender.`);

  // Démarrage du serveur statique
  let server;
  try {
    server = await startStaticServer();
    console.log(`[prerender] Serveur statique démarré sur http://${HOST}:${PORT}`);
  } catch (err) {
    console.warn(`[prerender] ⚠ Impossible de démarrer le serveur statique : ${err.message}`);
    process.exit(0);
  }

  // Lancement du navigateur headless — adaptatif selon l'environnement :
  //   • Vercel / CI (Linux minimal sans libs Chrome) → @sparticuz/chromium + puppeteer-core
  //   • Local (Windows/macOS/Linux dev)             → puppeteer (Chrome bundlé)
  // Tout échec reste NON-BLOQUANT (on garde le SPA).
  const onVercel = !!(process.env.VERCEL || process.env.CI);
  let browser;
  try {
    if (onVercel) {
      const chromium    = (await import('@sparticuz/chromium')).default;
      const puppeteerCore = (await import('puppeteer-core')).default;
      browser = await puppeteerCore.launch({
        args:            [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        executablePath:  await chromium.executablePath(),
        headless:        true,
      });
    } else {
      const puppeteer = (await import('puppeteer')).default;
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  } catch (err) {
    console.warn(`[prerender] ⚠ Lancement de Chrome headless échoué (${onVercel ? 'vercel' : 'local'}) : ${err.message}`);
    server.close();
    process.exit(0);
  }

  // Collecte EN MÉMOIRE : { route, html }. On n'écrit RIEN avant la fin de la
  // boucle pour que le serveur continue de servir le shell SPA pendant les snapshots.
  const results = [];
  let okCount = 0;
  let failCount = 0;

  for (const route of routes) {
    const url = `http://${HOST}:${PORT}${route}`;
    let page;
    try {
      page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Attendre le rendu réel : loader retiré + #root peuplé
      await page.waitForFunction(
        () =>
          !document.getElementById('app-loader') &&
          document.querySelector('#root') &&
          document.querySelector('#root').children.length > 0,
        { timeout: 15000 }
      );

      // Petit délai pour laisser useSEO remplir le <head> (useEffect async)
      await new Promise((r) => setTimeout(r, 400));

      const html = await page.content();
      results.push({ route, html });
      okCount++;
      console.log(`[prerender] ✓ ${route}`);
    } catch (err) {
      failCount++;
      console.warn(`[prerender] ✗ ${route} — ${err.message}`);
      // Un échec sur une route ne stoppe PAS les autres.
    } finally {
      if (page) {
        try {
          await page.close();
        } catch {
          /* ignore */
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. FERMETURE puis ÉCRITURE DES FICHIERS
  // ---------------------------------------------------------------------------
  try {
    await browser.close();
  } catch {
    /* ignore */
  }
  try {
    server.close();
  } catch {
    /* ignore */
  }

  let writtenCount = 0;
  for (const { route, html } of results) {
    try {
      // '/' -> dist/index.html ; sinon -> dist/<route>/index.html
      const outFile =
        route === '/'
          ? path.join(DIST, 'index.html')
          : path.join(DIST, route, 'index.html');

      await fsp.mkdir(path.dirname(outFile), { recursive: true });
      await fsp.writeFile(outFile, html, 'utf8');
      writtenCount++;
    } catch (err) {
      console.warn(`[prerender] ⚠ Écriture échouée pour ${route} : ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. RÉSUMÉ FINAL
  // ---------------------------------------------------------------------------
  console.log(
    `[prerender] Terminé : ${okCount} route(s) prerendered, ${writtenCount} fichier(s) écrit(s), ${failCount} échec(s).`
  );
}

// ---------------------------------------------------------------------------
// 5. NON-BLOQUANT : enveloppe globale. Toute erreur -> warning + exit(0).
// ---------------------------------------------------------------------------
try {
  await run();
  process.exit(0);
} catch (err) {
  console.warn(`[prerender] ⚠ Erreur fatale ignorée (build préservé) : ${err && err.message ? err.message : err}`);
  process.exit(0);
}
