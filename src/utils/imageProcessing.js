/**
 * processImageForUpload — traitement client avant envoi à Supabase Storage
 *
 * - Redimensionne si la largeur ou hauteur dépasse maxPx (ratio conservé)
 * - Convertit en WebP via Canvas API (gain typique : 60-80 % vs JPEG/PNG)
 * - Compatible avec tous les navigateurs modernes (Canvas + createImageBitmap)
 *
 * @param {File|Blob} file
 * @param {object}    [options]
 * @param {number}    [options.maxPx=1200]   taille max d'un côté en pixels
 * @param {number}    [options.quality=0.85] qualité WebP (0–1)
 * @returns {Promise<Blob>} blob WebP prêt pour upload
 */
export async function processImageForUpload(file, { maxPx = 1200, quality = 0.85 } = {}) {
  // createImageBitmap : décodage natif, supporte JPEG, PNG, WebP, GIF, AVIF
  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;

  // Réduction proportionnelle si l'image dépasse maxPx d'un côté
  if (width > maxPx || height > maxPx) {
    const ratio = Math.min(maxPx / width, maxPx / height);
    width  = Math.round(width  * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close(); // libère la mémoire

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Conversion WebP échouée'))),
      'image/webp',
      quality,
    );
  });
}
