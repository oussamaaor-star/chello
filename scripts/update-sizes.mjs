import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('./src/data/products.json', 'utf8'));

function mlFromLabel(label) {
  const m = label.match(/(\d+(?:\.\d+)?)\s*ml/i);
  return m ? parseFloat(m[1]) : null;
}

function roundTo5(n, min) {
  return Math.max(min, Math.round(n / 5) * 5);
}

const updated = data.map((product) => {
  const sizes = product.sizes ?? [];
  if (sizes.length === 0) return product;

  // Trouver le prix de référence (taille la plus grande = prix bottle le plus proche)
  let refPrice = null;
  let refMl = 0;
  for (const s of sizes) {
    const ml = mlFromLabel(s.label);
    if (ml && s.price && ml >= refMl) {
      refMl = ml;
      refPrice = s.price;
    }
  }

  if (!refPrice) return product;

  // Extrapoler vers 100ml si nécessaire
  const price100ml = refMl > 0 ? (refPrice / refMl) * 100 : refPrice;

  // Pourcentages du prix 100ml avec markup décant dégressif
  const newSizes = [
    { label: '5 ml',   price: roundTo5(price100ml * 0.22, 50)  },
    { label: '10 ml',  price: roundTo5(price100ml * 0.37, 80)  },
    { label: '20 ml',  price: roundTo5(price100ml * 0.58, 130) },
    { label: '100 ml', price: roundTo5(price100ml,        200) },
  ];

  return { ...product, sizes: newSizes };
});

writeFileSync('./src/data/products.json', JSON.stringify(updated, null, 2));
console.log(`✓ ${updated.length} produits mis à jour → 5ml / 10ml / 20ml / 100ml`);
