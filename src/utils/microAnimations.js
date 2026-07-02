// Micro-animations impératives (Web Animations API) — zéro dépendance.
// Chaque fonction respecte prefers-reduced-motion et ne fait rien si
// l'utilisateur a demandé de réduire les animations.

const reducedMotion = () =>
  typeof window === 'undefined' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Fait voler une miniature du produit depuis `fromEl` vers l'icône panier du
 * header (#header-cart-icon), en arc, puis la détruit. Le « pop » du compteur
 * est déjà géré par HeaderIcons (animate-cart-bump sur l'augmentation du total).
 *
 * @returns {boolean} true si l'animation est lancée (permet au caller de
 *   différer l'ouverture du drawer pour laisser l'image atterrir).
 */
export function flyToCart(fromEl, imgSrc) {
  if (reducedMotion() || !fromEl || !imgSrc) return false;
  const target = document.getElementById('header-cart-icon');
  if (!target) return false;

  const from = fromEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return false; // élément caché

  const size = 56;
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const dx = to.left + to.width / 2 - size / 2 - startX;
  const dy = to.top + to.height / 2 - size / 2 - startY;

  const ghost = document.createElement('img');
  ghost.src = imgSrc;
  ghost.alt = '';
  // z-index 250 : au-dessus du header (z-40) et du bottom-sheet mobile (z-200)
  ghost.style.cssText = [
    'position:fixed',
    `left:${startX}px`,
    `top:${startY}px`,
    `width:${size}px`,
    `height:${size}px`,
    'object-fit:cover',
    'border-radius:12px',
    'z-index:250',
    'pointer-events:none',
    'box-shadow:0 8px 24px rgba(24,20,15,.25)',
  ].join(';');
  document.body.appendChild(ghost);

  const anim = ghost.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    // sommet de l'arc : à mi-course, 90px au-dessus de la trajectoire directe
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(0.75)`, opacity: 0.95, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.35 },
  ], { duration: 650, easing: 'cubic-bezier(0.3, 0, 0.4, 1)' });
  anim.onfinish = () => ghost.remove();
  anim.oncancel = () => ghost.remove();
  // Filet : onglet passé en arrière-plan = animation en pause, onfinish jamais
  // appelé → suppression forcée (no-op si déjà retiré).
  setTimeout(() => ghost.remove(), 4000);
  return true;
}

/**
 * Célébration : pluie de confettis crème/argent/rose qui jaillit d'un élément
 * (page de confirmation de commande). Jouée une seule fois, ~1,5 s.
 */
export function celebrate(el) {
  if (reducedMotion() || !el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#c0c0c0', '#e8e6e1', '#f43f5e', '#d6c7a1', '#9e9e9e'];

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    const w = 5 + Math.random() * 5;
    const h = w * (0.4 + Math.random() * 0.6);
    p.style.cssText = [
      'position:fixed',
      `left:${cx}px`,
      `top:${cy}px`,
      `width:${w}px`,
      `height:${h}px`,
      `border-radius:${Math.random() > 0.5 ? '9999px' : '2px'}`,
      `background:${colors[i % colors.length]}`,
      'z-index:250',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(p);

    // Jaillit vers le haut dans un cône, puis retombe (pseudo-gravité)
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 90 + Math.random() * 140;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    const rot = (Math.random() - 0.5) * 540;
    const anim = p.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx * 1.4}px, ${dy + 220}px) rotate(${rot}deg)`, opacity: 0 },
    ], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.5, 0.6, 1)' });
    anim.onfinish = () => p.remove();
    setTimeout(() => p.remove(), 4000); // filet anti-onglet-en-arrière-plan
  }
}

/**
 * Éclat de particules argentées/rosées autour d'un élément (ajout wishlist).
 */
export function heartBurst(el) {
  if (reducedMotion() || !el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#c0c0c0', '#e8e6e1', '#f43f5e', '#9e9e9e'];

  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span');
    const s = 4 + Math.random() * 4;
    p.style.cssText = [
      'position:fixed',
      `left:${cx - s / 2}px`,
      `top:${cy - s / 2}px`,
      `width:${s}px`,
      `height:${s}px`,
      'border-radius:9999px',
      `background:${colors[i % colors.length]}`,
      'z-index:250',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(p);

    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.6;
    const dist = 22 + Math.random() * 22;
    const anim = p.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.2)`, opacity: 0 },
    ], { duration: 480 + Math.random() * 180, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)' });
    anim.onfinish = () => p.remove();
    setTimeout(() => p.remove(), 4000); // filet anti-onglet-en-arrière-plan
  }
}
