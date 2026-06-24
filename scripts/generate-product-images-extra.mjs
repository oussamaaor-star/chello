/**
 * Génère des vues supplémentaires SVG pour les produits sélectionnés.
 * - *-2.svg : vue de côté / angle (flacon penché)
 * - *-3.svg : vue emballage (boîte)
 * Usage : node scripts/generate-product-images-extra.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = join(__dirname, '..', 'public', 'products');
mkdirSync(OUT_DIR, { recursive: true });

// Produits avec 3 images (vue principale + angle + boîte)
const THREE_IMG = [
  { id: 'chanel-n5',              brand: 'Chanel',   name: 'N°5',               bg: '#f0ede8', fg: '#1c1c1c' },
  { id: 'dior-sauvage',           brand: 'Dior',     name: 'Sauvage',           bg: '#1e1a17', fg: '#d4c5b0' },
  { id: 'tf-tobacco-vanille',     brand: 'Tom Ford', name: 'Tobacco Vanille',   bg: '#1c1c1c', fg: '#d4af7a' },
  { id: 'ysl-libre',              brand: 'YSL',      name: 'Libre',             bg: '#1a1a1a', fg: '#d4af7a' },
  { id: 'chanel-bleu',            brand: 'Chanel',   name: 'Bleu de Chanel',    bg: '#e8f0f8', fg: '#1a3a5c' },
  { id: 'dior-jadore',            brand: 'Dior',     name: "J'adore",           bg: '#fff8f0', fg: '#c4860a' },
  { id: 'chanel-coco-mademoiselle', brand: 'Chanel', name: 'Coco Mademoiselle', bg: '#f5f0e8', fg: '#1c1c1c' },
  { id: 'lancome-la-vie-est-belle', brand: 'Lancôme',name: 'La Vie est Belle',  bg: '#fff5f7', fg: '#c75b7a' },
  { id: 'ysl-black-opium',        brand: 'YSL',      name: 'Black Opium',       bg: '#0a0a0a', fg: '#d4af7a' },
  { id: 'armani-acqua-di-gio',    brand: 'Armani',   name: 'Acqua Di Giò',      bg: '#e8f4fd', fg: '#1a5276' },
];

// Produits avec 2 images (vue principale + angle)
const TWO_IMG = [
  { id: 'armani-code',            brand: 'Armani',       name: 'Code',      bg: '#f0ede8', fg: '#3d3330' },
  { id: 'versace-eros',           brand: 'Versace',      name: 'Eros',      bg: '#e8f0f8', fg: '#1a4f8a' },
  { id: 'guerlain-shalimar',      brand: 'Guerlain',     name: 'Shalimar',  bg: '#fdf5e6', fg: '#9b6a2a' },
  { id: 'tf-oud-wood',            brand: 'Tom Ford',     name: 'Oud Wood',  bg: '#2d1b0e', fg: '#d4af7a' },
  { id: 'paco-rabanne-invictus',  brand: 'Paco Rabanne', name: 'Invictus',  bg: '#e8f0f8', fg: '#1a4f8a' },
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function luma(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Vue de côté / angle — flacon légèrement incliné avec reflet
function makeSvgAngle({ brand, name, bg, fg }) {
  const b = escapeXml(brand);
  const n = escapeXml(name);
  const isDark = luma(bg) < 128;
  const accentOpacity = isDark ? '0.22' : '0.10';
  const lineOpacity   = isDark ? '0.35' : '0.20';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.82"/>
    </linearGradient>
    <linearGradient id="refl" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${fg}" stop-opacity="0.18"/>
      <stop offset="50%"  stop-color="${fg}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${fg}" stop-opacity="0.00"/>
    </linearGradient>
  </defs>

  <!-- Fond -->
  <rect width="400" height="500" fill="url(#grad2)"/>

  <!-- Ellipse décorative de fond -->
  <ellipse cx="210" cy="210" rx="105" ry="90" fill="${fg}" fill-opacity="${accentOpacity}"/>
  <ellipse cx="210" cy="210" rx="70"  ry="60" fill="${fg}" fill-opacity="${accentOpacity}"/>

  <!-- Flacon incliné (rotation ~15°) -->
  <g transform="rotate(-12, 200, 200)">
    <!-- Bouchon -->
    <rect x="186" y="88" width="28" height="14" rx="5" fill="${fg}" fill-opacity="0.50"/>
    <!-- Col -->
    <rect x="180" y="102" width="40" height="7"  rx="2" fill="${fg}" fill-opacity="0.38"/>
    <!-- Corps -->
    <rect x="162" y="109" width="76" height="112" rx="16" fill="${fg}" fill-opacity="0.16"/>
    <rect x="162" y="109" width="76" height="112" rx="16" fill="none" stroke="${fg}" stroke-width="1.5" stroke-opacity="0.32"/>
    <!-- Reflet sur le côté gauche du flacon -->
    <rect x="162" y="109" width="22" height="112" rx="16" fill="url(#refl)"/>
  </g>

  <!-- Ligne décorative -->
  <line x1="140" y1="330" x2="260" y2="330" stroke="${fg}" stroke-width="1" stroke-opacity="${lineOpacity}"/>

  <!-- Marque -->
  <text x="200" y="310"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="20" font-weight="bold"
    fill="${fg}" fill-opacity="0.85"
    text-anchor="middle" letter-spacing="3">
    ${b}
  </text>

  <!-- Nom produit -->
  <text font-family="Georgia, 'Times New Roman', serif"
    font-size="13" fill="${fg}" fill-opacity="0.65" text-anchor="middle">
    <tspan x="200" dy="350">${n}</tspan>
  </text>

  <!-- Vue label -->
  <text x="200" y="415"
    font-family="Arial, Helvetica, sans-serif"
    font-size="8" fill="${fg}" fill-opacity="0.30"
    text-anchor="middle" letter-spacing="2">
    VUE DE CÔTÉ
  </text>

  <!-- Badge -->
  <text x="200" y="455"
    font-family="Arial, Helvetica, sans-serif"
    font-size="9" fill="${fg}" fill-opacity="0.35"
    text-anchor="middle" letter-spacing="2">
    NOTINO · PRESTIGE
  </text>
</svg>`;
}

// Vue emballage — boîte rectangulaire avec perspective légère
function makeSvgBox({ brand, name, bg, fg }) {
  const b = escapeXml(brand);
  const n = escapeXml(name);
  const isDark = luma(bg) < 128;
  const accentOpacity = isDark ? '0.20' : '0.09';
  const lineOpacity   = isDark ? '0.30' : '0.18';

  // Couleur de la face latérale (légèrement plus sombre/claire)
  const sideOpacity = isDark ? '0.12' : '0.08';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.80"/>
    </linearGradient>
  </defs>

  <!-- Fond -->
  <rect width="400" height="500" fill="url(#grad3)"/>

  <!-- Halo derrière la boîte -->
  <ellipse cx="200" cy="230" rx="100" ry="80" fill="${fg}" fill-opacity="${accentOpacity}"/>

  <!-- Face avant de la boîte -->
  <rect x="145" y="120" width="110" height="150" rx="4" fill="${fg}" fill-opacity="0.14"/>
  <rect x="145" y="120" width="110" height="150" rx="4" fill="none" stroke="${fg}" stroke-width="1.5" stroke-opacity="0.35"/>

  <!-- Face supérieure (perspective) -->
  <polygon points="145,120 200,100 310,100 255,120" fill="${fg}" fill-opacity="0.20"/>
  <polygon points="145,120 200,100 310,100 255,120" fill="none" stroke="${fg}" stroke-width="1" stroke-opacity="0.30"/>

  <!-- Face latérale droite (perspective) -->
  <polygon points="255,120 310,100 310,250 255,270" fill="${fg}" fill-opacity="${sideOpacity}"/>
  <polygon points="255,120 310,100 310,250 255,270" fill="none" stroke="${fg}" stroke-width="1" stroke-opacity="0.25"/>

  <!-- Texte sur la boîte — marque -->
  <text x="200" y="192"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="16" font-weight="bold"
    fill="${fg}" fill-opacity="0.70"
    text-anchor="middle" letter-spacing="2">
    ${b}
  </text>

  <!-- Texte sur la boîte — nom -->
  <text font-family="Georgia, 'Times New Roman', serif"
    font-size="10" fill="${fg}" fill-opacity="0.50" text-anchor="middle">
    <tspan x="200" dy="212">${n}</tspan>
  </text>

  <!-- Ligne décorative -->
  <line x1="140" y1="330" x2="260" y2="330" stroke="${fg}" stroke-width="1" stroke-opacity="${lineOpacity}"/>

  <!-- Marque sous la boîte -->
  <text x="200" y="310"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="20" font-weight="bold"
    fill="${fg}" fill-opacity="0.85"
    text-anchor="middle" letter-spacing="3">
    ${b}
  </text>

  <!-- Nom produit -->
  <text font-family="Georgia, 'Times New Roman', serif"
    font-size="13" fill="${fg}" fill-opacity="0.65" text-anchor="middle">
    <tspan x="200" dy="350">${n}</tspan>
  </text>

  <!-- Vue label -->
  <text x="200" y="415"
    font-family="Arial, Helvetica, sans-serif"
    font-size="8" fill="${fg}" fill-opacity="0.30"
    text-anchor="middle" letter-spacing="2">
    COFFRET · EMBALLAGE
  </text>

  <!-- Badge -->
  <text x="200" y="455"
    font-family="Arial, Helvetica, sans-serif"
    font-size="9" fill="${fg}" fill-opacity="0.35"
    text-anchor="middle" letter-spacing="2">
    NOTINO · PRESTIGE
  </text>
</svg>`;
}

let count = 0;

// Produits 3 images : générer -2 (angle) et -3 (boîte)
for (const p of THREE_IMG) {
  writeFileSync(join(OUT_DIR, `${p.id}-2.svg`), makeSvgAngle(p), 'utf8');
  writeFileSync(join(OUT_DIR, `${p.id}-3.svg`), makeSvgBox(p),   'utf8');
  count += 2;
}

// Produits 2 images : générer -2 (angle) uniquement
for (const p of TWO_IMG) {
  writeFileSync(join(OUT_DIR, `${p.id}-2.svg`), makeSvgAngle(p), 'utf8');
  count += 1;
}

console.log(`✓ ${count} images SVG extra générées dans public/products/`);
