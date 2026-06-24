/**
 * Génère des images SVG de substitution pour les produits dans public/products/
 * Usage : node scripts/generate-product-images.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = join(__dirname, '..', 'public', 'products');
mkdirSync(OUT_DIR, { recursive: true });

const PRODUCTS = [
  { id: 'chanel-n5',              brand: 'Chanel',              name: 'N°5',                bg: '#f0ede8', fg: '#1c1c1c' },
  { id: 'dior-sauvage',           brand: 'Dior',                name: 'Sauvage',            bg: '#1e1a17', fg: '#d4c5b0' },
  { id: 'tf-tobacco-vanille',     brand: 'Tom Ford',            name: 'Tobacco Vanille',    bg: '#1c1c1c', fg: '#d4af7a' },
  { id: 'ysl-libre',              brand: 'YSL',                 name: 'Libre',              bg: '#1a1a1a', fg: '#d4af7a' },
  { id: 'armani-code',            brand: 'Armani',              name: 'Code',               bg: '#f0ede8', fg: '#3d3330' },
  { id: 'lancome-la-vie-est-belle', brand: 'Lancôme',           name: 'La Vie est Belle',   bg: '#fff5f7', fg: '#c75b7a' },
  { id: 'paco-rabanne-1-million', brand: 'Paco Rabanne',        name: '1 Million',          bg: '#f5f0e0', fg: '#b8860b' },
  { id: 'versace-eros',           brand: 'Versace',             name: 'Eros',               bg: '#e8f0f8', fg: '#1a4f8a' },
  { id: 'givenchy-linterdit',     brand: 'Givenchy',            name: "L'Interdit",         bg: '#f5f5f4', fg: '#1c1c1c' },
  { id: 'guerlain-shalimar',      brand: 'Guerlain',            name: 'Shalimar',           bg: '#fdf5e6', fg: '#9b6a2a' },
  { id: 'dior-jadore',            brand: 'Dior',                name: "J'adore",            bg: '#fff8f0', fg: '#c4860a' },
  { id: 'chanel-bleu',            brand: 'Chanel',              name: 'Bleu de Chanel',     bg: '#e8f0f8', fg: '#1a3a5c' },
  { id: 'ysl-la-nuit',            brand: 'YSL',                 name: 'La Nuit',            bg: '#1a1a2e', fg: '#d4af7a' },
  { id: 'dior-capture-totale',    brand: 'Dior',                name: 'Capture Totale',     bg: '#f0f8ff', fg: '#2c4a7c' },
  { id: 'lancome-adv-genifique',  brand: 'Lancôme',             name: 'Génifique',          bg: '#fff5f7', fg: '#c75b7a' },
  { id: 'tf-oud-wood',            brand: 'Tom Ford',            name: 'Oud Wood',           bg: '#2d1b0e', fg: '#d4af7a' },
  { id: 'armani-si',              brand: 'Armani',              name: 'Sì',                 bg: '#fff0f5', fg: '#c75b7a' },
  { id: 'guerlain-terracotta',    brand: 'Guerlain',            name: 'Terracotta',         bg: '#fdf5e6', fg: '#c07030' },
  { id: 'dior-rouge-dior',        brand: 'Dior',                name: 'Rouge Dior',         bg: '#fff0f0', fg: '#c0392b' },
  { id: 'chanel-le-mascara',      brand: 'Chanel',              name: 'Le Volume',          bg: '#1c1c1c', fg: '#f0ede8' },
  { id: 'paco-rabanne-invictus',  brand: 'Paco Rabanne',        name: 'Invictus',           bg: '#e8f0f8', fg: '#1a4f8a' },
  { id: 'givenchy-gentleman',     brand: 'Givenchy',            name: 'Gentleman',          bg: '#f0ede8', fg: '#2c2c2c' },
  { id: 'tf-lost-cherry',         brand: 'Tom Ford',            name: 'Lost Cherry',        bg: '#2d0a0a', fg: '#d4af7a' },
  { id: 'ysl-black-opium',        brand: 'YSL',                 name: 'Black Opium',        bg: '#0a0a0a', fg: '#d4af7a' },
  { id: 'chanel-coco-mademoiselle', brand: 'Chanel',            name: 'Coco Mademoiselle',  bg: '#f5f0e8', fg: '#1c1c1c' },
  { id: 'versace-bright-crystal', brand: 'Versace',             name: 'Bright Crystal',     bg: '#f0f8ff', fg: '#1a5276' },
  { id: 'armani-acqua-di-gio',    brand: 'Armani',              name: 'Acqua Di Giò',       bg: '#e8f4fd', fg: '#1a5276' },
  { id: 'coffret-dior-sauvage',   brand: 'Dior',                name: 'Coffret Sauvage',    bg: '#f5f3f0', fg: '#2d2520' },
  { id: 'coffret-lancome-lveb',   brand: 'Lancôme',             name: 'Coffret La Vie…',    bg: '#fff5f7', fg: '#c75b7a' },
  { id: 'dior-lip-glow',          brand: 'Dior',                name: 'Lip Glow',           bg: '#fff0f5', fg: '#e11d48' },
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makeSvg({ brand, name, bg, fg }) {
  const b = escapeXml(brand);
  const n = escapeXml(name);

  // Luminosité approximative pour savoir si le fond est sombre
  const hex = bg.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const bl = parseInt(hex.slice(4, 6), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * bl;
  const isDark = luma < 128;

  const accentOpacity = isDark ? '0.25' : '0.12';
  const lineOpacity   = isDark ? '0.35' : '0.20';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>

  <!-- Fond -->
  <rect width="400" height="500" fill="url(#grad)"/>

  <!-- Cercles décoratifs -->
  <circle cx="200" cy="195" r="95" fill="${fg}" fill-opacity="${accentOpacity}"/>
  <circle cx="200" cy="195" r="65" fill="${fg}" fill-opacity="${accentOpacity}"/>
  <circle cx="200" cy="195" r="35" fill="${fg}" fill-opacity="${accentOpacity}"/>

  <!-- Silhouette flacon -->
  <rect x="185" y="95"  width="30" height="12" rx="4"  fill="${fg}" fill-opacity="0.45"/>
  <rect x="178" y="107" width="44" height="6"  rx="2"  fill="${fg}" fill-opacity="0.35"/>
  <rect x="164" y="113" width="72" height="105" rx="14" fill="${fg}" fill-opacity="0.18"/>
  <rect x="164" y="113" width="72" height="105" rx="14" fill="none" stroke="${fg}" stroke-width="1.5" stroke-opacity="0.3"/>

  <!-- Ligne décorative -->
  <line x1="140" y1="330" x2="260" y2="330" stroke="${fg}" stroke-width="1" stroke-opacity="${lineOpacity}"/>

  <!-- Marque -->
  <text x="200" y="310"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="20"
    font-weight="bold"
    fill="${fg}"
    fill-opacity="0.85"
    text-anchor="middle"
    letter-spacing="3">
    ${b}
  </text>

  <!-- Nom produit (truncated to 2 lines via tspan) -->
  <text
    font-family="Georgia, 'Times New Roman', serif"
    font-size="13"
    fill="${fg}"
    fill-opacity="0.65"
    text-anchor="middle">
    <tspan x="200" dy="350">${n}</tspan>
  </text>

  <!-- Badge qualité -->
  <text x="200" y="455"
    font-family="Arial, Helvetica, sans-serif"
    font-size="9"
    fill="${fg}"
    fill-opacity="0.35"
    text-anchor="middle"
    letter-spacing="2">
    NOTINO · PRESTIGE
  </text>
</svg>`;
}

let count = 0;
for (const p of PRODUCTS) {
  const svg  = makeSvg(p);
  const file = join(OUT_DIR, `${p.id}.svg`);
  writeFileSync(file, svg, 'utf8');
  count++;
}

console.log(`✓ ${count} images SVG générées dans public/products/`);
