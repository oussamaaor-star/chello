/**
 * Script de seed — insère des avis clients et met à jour les notes olfactives.
 * Prérequis : exécuter d'abord ce SQL dans Supabase → SQL Editor :
 *
 *   ALTER TABLE reviews ADD COLUMN IF NOT EXISTS display_name TEXT;
 *   ALTER TABLE products ADD COLUMN IF NOT EXISTS notes JSONB;
 *
 * Usage: node scripts/seed-reviews.mjs
 */

// La clé service_role doit être fournie via une variable d'environnement —
// elle ne doit JAMAIS être committée dans le dépôt.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes : définissez VITE_SUPABASE_URL (ou SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY avant d\'exécuter ce script.');
  process.exit(1);
}

const H = {
  'Content-Type':  'application/json',
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer':        'return=minimal',
};

// ─── Notes olfactives par produit ─────────────────────────────────────────────

const NOTES = [
  {
    id: 'e55f5ecd-2b07-44c9-af10-b3a43a7312ed',
    notes: { top: ['Néroli', 'Géranium'], heart: ['Iris'], base: ['Ambre', 'Patchouli'] },
  },
  {
    id: 'e3a5d15e-0b78-409c-b1cb-856d6bb4e99d',
    notes: { top: ['Lavande', 'Iris'], heart: ['Iris ambré', 'Accord fruité'], base: ['Cèdre', 'Bois précieux'] },
  },
  {
    id: '244ac933-deb4-4c14-a252-fb2d75f9a152',
    notes: { top: ['Cédrat', 'Baie de genièvre', 'Poivre Timut'], heart: ['Notes minérales et glacées'], base: ['Vétiver', 'Cèdre'] },
  },
  {
    id: '683484e2-b62b-4185-ad22-42ea4f187c99',
    notes: { top: ['Cardamome', 'Poivre noir', 'Bergamote'], heart: ['Rhum', 'Tabac fumé', 'Épices chaudes'], base: ['Vanille', 'Oud', 'Musc ambré'] },
  },
  {
    id: '52c820e4-a6d5-47dd-a649-d33a0c6a2843',
    notes: { top: ['Bergamote', 'Agrumes', 'Poivre rose'], heart: ['Notes florales', 'Épices douces'], base: ['Ambre', 'Musc', 'Bois chaud'] },
  },
  {
    id: '2e1442d5-ce48-469e-b704-30b5e9ad0b4f',
    notes: { top: ['Bergamote', 'Citron', 'Notes marines'], heart: ['Bois aquatique', 'Menthe', 'Épices légères'], base: ['Ambre', 'Musc blanc', 'Cèdre'] },
  },
  {
    id: 'dcd37af3-77e3-4401-99ca-033996c49af5',
    notes: { top: ['Menthe glacée', 'Eucalyptus', 'Notes vertes'], heart: ['Notes aquatiques', 'Accord minéral'], base: ['Musc blanc', 'Cèdre', 'Bois frais'] },
  },
  {
    id: 'da6faffb-21a8-4647-bebf-ddf8f20405f3',
    notes: { top: ['Poivre noir', 'Épices chaudes'], heart: ['Oud', 'Rose', 'Bois fumé'], base: ['Ambre', 'Musc sombre', 'Encens'] },
  },
  {
    id: '92fbc064-68da-4afe-8bab-9ed2cccf5492',
    notes: { top: ['Fruits tropicaux', 'Agrumes exotiques'], heart: ['Notes florales', 'Accords aquatiques'], base: ['Musc crémeux', 'Vanille', 'Bois doux'] },
  },
  {
    id: '3b5f45be-faa1-4421-9976-dde332ab1faa',
    notes: { top: ['Notes marines', 'Iode', 'Citrus frais'], heart: ['Bois aquatique', 'Accord minéral'], base: ['Musc blanc', 'Ambre marin'] },
  },
  {
    id: '7b9729db-a4b6-45d3-98d4-088383959cc0',
    notes: { top: ['Épices chaudes', 'Safran'], heart: ['Oud', 'Rose persane', 'Bois précieux'], base: ['Ambre', 'Santal', 'Musc oriental'] },
  },
  {
    id: 'ef16a594-c75e-4a50-b9aa-405082be6675',
    notes: { top: ['Bergamote', 'Agrumes frais', 'Lavande'], heart: ['Bois bleu', 'Épices légères'], base: ['Ambre', 'Musc', 'Fond boisé'] },
  },
];

// ─── Avis clients ─────────────────────────────────────────────────────────────
// Inspirés de vrais retours, réécrits et adaptés au contexte décant.

function d(monthsAgo, day = 10) {
  const dt = new Date();
  dt.setMonth(dt.getMonth() - monthsAgo);
  dt.setDate(day);
  return dt.toISOString();
}

const REVIEWS = [
  // ── Prada L'Homme ──────────────────────────────────────────────────────────
  { product_id: 'e55f5ecd-2b07-44c9-af10-b3a43a7312ed', display_name: 'Karim B.',   rating: 5, comment: "Un parfum d'une élégance rare. J'ai commandé le décant 30 ml pour tester avant d'investir dans le grand flacon — verdict : je le rachète en 100 ml sans hésiter. L'iris est envoûtant.", created_at: d(1, 5) },
  { product_id: 'e55f5ecd-2b07-44c9-af10-b3a43a7312ed', display_name: 'Yassine M.', rating: 5, comment: "La note d'iris est délicate, poudrée, jamais lourde. Tient facilement 8 heures sur la peau. Un classique que je recommande à tous ceux qui cherchent un parfum distingué.", created_at: d(2, 18) },
  { product_id: 'e55f5ecd-2b07-44c9-af10-b3a43a7312ed', display_name: 'Omar R.',    rating: 5, comment: "Frais, aérien, raffiné. Mon épouse l'adore sur moi. Le décant de 10 ml était parfait pour découvrir la fragrance sans risque. Concept génial.", created_at: d(3, 22) },
  { product_id: 'e55f5ecd-2b07-44c9-af10-b3a43a7312ed', display_name: 'Adil S.',    rating: 4, comment: "Léger et persistant. Pas une trace d'agressivité. Idéal pour le bureau ou une sortie décontractée. Le rapport qualité/prix via le décant est excellent.", created_at: d(4, 7) },
  { product_id: 'e55f5ecd-2b07-44c9-af10-b3a43a7312ed', display_name: 'Hassan T.',  rating: 5, comment: "Je le porte depuis des années et il ne déçoit jamais. L'idée du décant m'a permis d'en offrir à plusieurs amis qui ne connaissaient pas encore Prada L'Homme.", created_at: d(5, 14) },

  // ── Dior Homme Intense ─────────────────────────────────────────────────────
  { product_id: 'e3a5d15e-0b78-409c-b1cb-856d6bb4e99d', display_name: 'Mehdi A.',   rating: 5, comment: "Parfum d'hiver par excellence. Chaud, sensuel, sophistiqué. Le décant 30 ml m'a convaincu immédiatement — c'est une valeur sûre, puissant sans être ostentatoire.", created_at: d(1, 12) },
  { product_id: 'e3a5d15e-0b78-409c-b1cb-856d6bb4e99d', display_name: 'Rachid K.',  rating: 5, comment: "L'iris poussé à son intensité maximale, c'est saisissant. Une fragrance masculine très affirmée, rare et reconnaissable entre mille. Mon préféré depuis 3 ans.", created_at: d(2, 3) },
  { product_id: 'e3a5d15e-0b78-409c-b1cb-856d6bb4e99d', display_name: 'Bilal O.',   rating: 5, comment: "Sillage remarquable, tient toute la journée sans être envahissant. Aussi bien pour le bureau que pour une soirée. Je ne pourrais plus m'en passer.", created_at: d(3, 9) },
  { product_id: 'e3a5d15e-0b78-409c-b1cb-856d6bb4e99d', display_name: 'Samir D.',   rating: 5, comment: "Sublime. Je l'offre régulièrement en cadeau via les décants — c'est la meilleure façon de faire découvrir ce jus exceptionnel sans que la personne prenne un risque.", created_at: d(4, 20) },
  { product_id: 'e3a5d15e-0b78-409c-b1cb-856d6bb4e99d', display_name: 'Amine B.',   rating: 5, comment: "Je n'avais jamais essayé la version Intense avant de commander le décant. Maintenant c'est mon parfum principal en hiver. Boisé, profond, irrésistible.", created_at: d(5, 1) },

  // ── Terre d'Hermès Eau Givrée ──────────────────────────────────────────────
  { product_id: '244ac933-deb4-4c14-a252-fb2d75f9a152', display_name: 'Tarik H.',   rating: 5, comment: "Une fraîcheur incomparable, idéale pour les journées chaudes. Le cédrat et la baie de genièvre créent une ouverture vraiment unique. Je ne connaissais pas cette version givrée — le décant m'a converti.", created_at: d(1, 8) },
  { product_id: '244ac933-deb4-4c14-a252-fb2d75f9a152', display_name: 'Nabil F.',   rating: 5, comment: "Incontournable pour un homme élégant. Très fin, très subtil. Le contraste entre la fraîcheur glacée et le fond boisé terreux d'Hermès est fascinant.", created_at: d(2, 25) },
  { product_id: '244ac933-deb4-4c14-a252-fb2d75f9a152', display_name: 'Khalid M.',  rating: 5, comment: "Le décant m'a permis de découvrir Hermès sans me ruiner. Résultat : j'ai commandé le flacon 200 ml rechargeable. Un parfum qui marque les esprits sans être agressif.", created_at: d(3, 15) },
  { product_id: '244ac933-deb4-4c14-a252-fb2d75f9a152', display_name: 'Jawad L.',   rating: 4, comment: "Très bon parfum, frais et élégant. Parfait pour l'été. Tenue honorable sur la peau. Un peu discret pour ceux qui cherchent un sillage imposant, mais c'est justement ce qui en fait un parfum de qualité.", created_at: d(4, 11) },

  // ── Afnan 9pm Elixir ───────────────────────────────────────────────────────
  { product_id: '683484e2-b62b-4185-ad22-42ea4f187c99', display_name: 'Soufiane K.', rating: 5, comment: "Un monstre de sillage pour un prix très accessible. Les notes de rhum et de tabac en cœur sont addictives. Je le porte en soirée et les compliments sont constants.", created_at: d(1, 19) },
  { product_id: '683484e2-b62b-4185-ad22-42ea4f187c99', display_name: 'Ismail B.',  rating: 5, comment: "Le décant 10 ml m'a convaincu immédiatement. Chaud, gourmand, oriental — exactement ce que je cherchais pour les nuits d'hiver. Je reviens sur le 30 ml.", created_at: d(2, 6) },
  { product_id: '683484e2-b62b-4185-ad22-42ea4f187c99', display_name: 'Younes A.',  rating: 5, comment: "Un parfum de soirée d'exception à ce prix. Tient facilement 12 heures sur la peau. Le rapport qualité/prix via le décant est imbattable.", created_at: d(3, 28) },
  { product_id: '683484e2-b62b-4185-ad22-42ea4f187c99', display_name: 'Hamza R.',   rating: 5, comment: "Les notes de cardamome en ouverture sont extraordinaires. L'Elixir est plus riche et plus sombre que le 9pm classique. Un must pour les amateurs d'orientaux généreux.", created_at: d(4, 4) },

  // ── Afnan 9pm Night Out ────────────────────────────────────────────────────
  { product_id: '52c820e4-a6d5-47dd-a649-d33a0c6a2843', display_name: 'Anas M.',    rating: 5, comment: "Plus frais que le 9PM classique, parfait pour une soirée d'été. Le sillage est généreux et les compliments sont au rendez-vous. Grande surprise pour ce prix.", created_at: d(1, 23) },
  { product_id: '52c820e4-a6d5-47dd-a649-d33a0c6a2843', display_name: 'Zakaria T.', rating: 5, comment: "J'hésitais entre le 9PM et le Night Out — le décant m'a permis de tester les deux. Le Night Out gagne pour les mois chauds, l'Elixir pour l'hiver. Concept du décant vraiment pratique.", created_at: d(2, 14) },
  { product_id: '52c820e4-a6d5-47dd-a649-d33a0c6a2843', display_name: 'Othmane S.', rating: 4, comment: "Frais, dynamique, séduisant. Idéal pour sortir le soir. Un parfum de niche arabe à un prix honnête — je recommande à tous ceux qui cherchent à se démarquer.", created_at: d(3, 3) },

  // ── Rasasi Hawas ───────────────────────────────────────────────────────────
  { product_id: '2e1442d5-ce48-469e-b704-30b5e9ad0b4f', display_name: 'Ilyas B.',   rating: 5, comment: "La fraîcheur aquatique la plus propre que j'ai jamais portée. Sillage de plusieurs heures, idéal pour le bureau. Très apprécié par mon entourage qui me demande toujours ce que je porte.", created_at: d(1, 16) },
  { product_id: '2e1442d5-ce48-469e-b704-30b5e9ad0b4f', display_name: 'Youssef D.', rating: 5, comment: "Hawas est une révélation. Frais, marin, légèrement épicé en fond. Le décant 30 ml est parfait pour les journées d'été. Je ne reviens plus sur mes anciens parfums frais.", created_at: d(2, 7) },
  { product_id: '2e1442d5-ce48-469e-b704-30b5e9ad0b4f', display_name: 'Aymane K.',  rating: 5, comment: "Je cherchais un parfum frais qui tient vraiment — Hawas fait exactement ça. Projection et sillage impressionnants pour un parfum arabe à ce prix. Mon quotidien désormais.", created_at: d(3, 21) },
  { product_id: '2e1442d5-ce48-469e-b704-30b5e9ad0b4f', display_name: 'Mouad F.',   rating: 5, comment: "Incroyable rapport qualité/prix. On est très loin du bas de gamme. Hawas mérite d'être connu en dehors des cercles de passionnés — c'est un grand parfum, tout simplement.", created_at: d(4, 9) },

  // ── Rasasi Hawas Ice ───────────────────────────────────────────────────────
  { product_id: 'dcd37af3-77e3-4401-99ca-033996c49af5', display_name: 'Nassim R.',  rating: 5, comment: "La fraîcheur est intense dès la première projection — on pense vraiment à de la glace. Idéal pour les journées de canicule. Un parfum de l'été par excellence.", created_at: d(1, 30) },
  { product_id: 'dcd37af3-77e3-4401-99ca-033996c49af5', display_name: 'Mehdi O.',   rating: 5, comment: "Hawas Ice c'est Hawas poussé à l'extrême côté fraîcheur. Le fond boisé lui donne du caractère et évite l'effet trop simple. Belle évolution sur la peau.", created_at: d(2, 12) },
  { product_id: 'dcd37af3-77e3-4401-99ca-033996c49af5', display_name: 'Kamal Y.',   rating: 4, comment: "Parfait pour l'été. Légèreté et fraîcheur garanties. Moins complexe que le Hawas classique mais c'est son charme. Le décant 10 ml est idéal pour tester.", created_at: d(3, 5) },

  // ── Rasasi Hawas Kobra ─────────────────────────────────────────────────────
  { product_id: 'da6faffb-21a8-4647-bebf-ddf8f20405f3', display_name: 'Imad S.',    rating: 5, comment: "Hawas Kobra c'est la version sombre et mystérieuse de la gamme. L'oud en cœur est authentique et bien dosé, pas artificiel. Un parfum qui impose le respect.", created_at: d(1, 11) },
  { product_id: 'da6faffb-21a8-4647-bebf-ddf8f20405f3', display_name: 'Fares B.',   rating: 5, comment: "Un parfum oriental de qualité exceptionnelle. Sillage puissant, parfait pour les soirées d'hiver. L'encens en fond lui donne une profondeur rare à ce prix.", created_at: d(2, 27) },
  { product_id: 'da6faffb-21a8-4647-bebf-ddf8f20405f3', display_name: 'Walid K.',   rating: 5, comment: "Fan de la gamme Hawas depuis longtemps, Kobra est sans conteste le plus intense et le plus sophistiqué. Idéal pour se démarquer en soirée.", created_at: d(3, 17) },

  // ── Hawas Tropical ─────────────────────────────────────────────────────────
  { product_id: '92fbc064-68da-4afe-8bab-9ed2cccf5492', display_name: 'Rayan M.',   rating: 5, comment: "Une bouffée de soleil et d'évasion dès la première projection. Les notes fruitées tropicales sont légères et naturelles, sans artifice. Parfait pour l'été.", created_at: d(1, 24) },
  { product_id: '92fbc064-68da-4afe-8bab-9ed2cccf5492', display_name: 'Achraf D.',  rating: 4, comment: "Frais, fruité, estival. Parfait pour une sortie décontractée ou une soirée sur la côte. Le décant 10 ml m'a convaincu — je reviens pour le 30 ml.", created_at: d(2, 8) },
  { product_id: '92fbc064-68da-4afe-8bab-9ed2cccf5492', display_name: 'Sami L.',    rating: 5, comment: "Doux, enveloppant, original. Une belle alternative aux fragrances estivales classiques. Le fond crémeux et musqué est addictif.", created_at: d(3, 13) },

  // ── Afnan Rare Reef ────────────────────────────────────────────────────────
  { product_id: '3b5f45be-faa1-4421-9976-dde332ab1faa', display_name: 'Haitam K.',  rating: 5, comment: "Une fraîcheur marine très propre et très élégante. Idéal pour les journées chaudes, le bureau ou même le sport. Tenue solide, sillage agréable sans être excessif.", created_at: d(1, 6) },
  { product_id: '3b5f45be-faa1-4421-9976-dde332ab1faa', display_name: 'Wissam B.',  rating: 4, comment: "Notes marines authentiques, pas synthétiques. Un parfum discret mais qui laisse un sillage propre et agréable dans son sillage. Très apprécié au bureau.", created_at: d(2, 19) },
  { product_id: '3b5f45be-faa1-4421-9976-dde332ab1faa', display_name: 'Saad M.',    rating: 5, comment: "Rare Reef est une vraie pépite sous-estimée. Pas très connu mais mérite d'être découvert — c'est exactement l'utilité du concept de décant, bravo à l'équipe.", created_at: d(3, 26) },

  // ── Afnan Supermarcy in Oud ────────────────────────────────────────────────
  { product_id: '7b9729db-a4b6-45d3-98d4-088383959cc0', display_name: 'Fouad A.',   rating: 5, comment: "L'oud est royal — riche, profond, authentique. Un parfum pour ceux qui assument leur personnalité. Sillage extraordinaire qui tient toute une journée sans effort.", created_at: d(1, 2) },
  { product_id: '7b9729db-a4b6-45d3-98d4-088383959cc0', display_name: 'Nasser B.',  rating: 5, comment: "Mon parfum de soirée préféré depuis que j'ai découvert le décant ici. La rose persane et l'oud se marient à la perfection — chaleureux, oriental, irrésistible.", created_at: d(2, 21) },
  { product_id: '7b9729db-a4b6-45d3-98d4-088383959cc0', display_name: 'Abdel R.',   rating: 5, comment: "Un voyage en Orient à chaque projection. La tenue dépasse les 10 heures facilement. Exceptionnel pour le prix, surtout via le décant.", created_at: d(3, 10) },

  // ── Afnan Turathi Blue ─────────────────────────────────────────────────────
  { product_id: 'ef16a594-c75e-4a50-b9aa-405082be6675', display_name: 'Salim K.',   rating: 5, comment: "Turathi Blue est élégant sans être tapageur. Une fraîcheur orientale moderne que l'on peut porter en toutes occasions. Très polyvalent.", created_at: d(1, 29) },
  { product_id: 'ef16a594-c75e-4a50-b9aa-405082be6675', display_name: 'Hicham D.',  rating: 4, comment: "La bergamote en tête est magnifique, le fond d'ambre apporte une chaleur délicate. Parfait pour le bureau ou une sortie en journée. Je recommande.", created_at: d(2, 16) },
  { product_id: 'ef16a594-c75e-4a50-b9aa-405082be6675', display_name: 'Rida T.',    rating: 5, comment: "Un parfum versatile, été comme hiver. Le décant m'a permis de le porter quotidiennement pendant deux semaines — convaincu à 100%. Je reviens pour le grand format.", created_at: d(3, 4) },
];

// ─── Fonctions d'envoi ────────────────────────────────────────────────────────

async function insertReviews() {
  console.log(`\n📝 Insertion de ${REVIEWS.length} avis…`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
    method:  'POST',
    headers: H,
    body:    JSON.stringify(REVIEWS),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`❌ Avis — ${res.status}: ${txt}`);
  } else {
    console.log(`✅ ${REVIEWS.length} avis insérés`);
  }
}

async function updateNotes() {
  console.log(`\n🌸 Mise à jour des notes olfactives…`);
  let ok = 0;
  for (const p of NOTES) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}`, {
      method:  'PATCH',
      headers: H,
      body:    JSON.stringify({ notes: p.notes }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`❌ ${p.id}: ${txt}`);
    } else {
      ok++;
    }
  }
  console.log(`✅ ${ok}/${NOTES.length} notes mises à jour`);
}

await insertReviews();
await updateNotes();
console.log('\n✅ Terminé !');
