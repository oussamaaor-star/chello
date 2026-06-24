function normalize(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function includes(haystack, needle) {
  return normalize(haystack).includes(normalize(needle));
}

function scoreProduct(product, query) {
  const q = normalize(query);
  let score = 0;

  if (normalize(product.name).startsWith(q)) score += 10;
  else if (includes(product.name, query)) score += 6;

  if (includes(product.description, query)) score += 2;
  if (includes(product.category, query)) score += 1;

  return score;
}

/**
 * Recherche principale (produits + catégories).
 */
export function searchProducts(
  query,
  products = [],
  categories = [],
  limits = { products: 6, categories: 3 }
) {
  const q = query.trim();

  if (q.length < 2) {
    return { products: [], categories: [], total: 0, totalProducts: 0, totalCategories: 0 };
  }

  const matchedProducts = products
    .map((p) => ({ product: p, score: scoreProduct(p, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);

  const matchedCategories = categories.filter(
    (c) => includes(c.label, q) || c.subcategories?.some((s) => includes(s, q))
  );

  const total = matchedProducts.length + matchedCategories.length;

  return {
    products: matchedProducts.slice(0, limits.products),
    categories: matchedCategories.slice(0, limits.categories),
    totalProducts: matchedProducts.length,
    totalCategories: matchedCategories.length,
    total,
  };
}
