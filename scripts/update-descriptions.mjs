/**
 * Script temporaire — met à jour les descriptions des produits dans Supabase.
 * Usage: node scripts/update-descriptions.mjs
 */

// La clé service_role doit être fournie via une variable d'environnement —
// elle ne doit JAMAIS être committée dans le dépôt.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes : définissez VITE_SUPABASE_URL (ou SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY avant d\'exécuter ce script.');
  process.exit(1);
}

const UPDATES = [
  {
    id: 'e55f5ecd-2b07-44c9-af10-b3a43a7312ed', // Prada L'Homme
    description: "La quintessence du raffinement à l'italienne. Prada L'Homme est un parfum viril, stimulant et très aérien — à la fois classique et singulier. Construit autour d'un cœur d'iris d'une délicatesse poudrée, il s'ouvre sur des notes fraîches de néroli et de géranium avant de se fondre dans un sillage chaud d'ambre et de patchouli. Le symbole d'un homme sensuel, sûr de lui et anticonformiste.",
    notes: {
      top:   ['Néroli', 'Géranium'],
      heart: ['Iris'],
      base:  ['Ambre', 'Patchouli'],
    },
  },
  {
    id: 'e3a5d15e-0b78-409c-b1cb-856d6bb4e99d', // Dior Homme Intense
    description: "Dior Homme Intense révèle la noblesse extrême et la sophistication d'une eau de parfum puissante et affirmée. Version amplifiée et sensuelle du Dior Homme classique, il pousse l'iris à son intensité maximale, relevé de facettes ambrées et fruitées, posé sur un fond de bois précieux et corsés. Un sillage affirmé, profond, pour l'homme qui assume sa singularité.",
    notes: {
      top:   ['Lavande', 'Iris'],
      heart: ['Iris, facettes ambrées et fruitées'],
      base:  ['Cèdre', 'Bois précieux'],
    },
  },
  {
    id: '244ac933-deb4-4c14-a252-fb2d75f9a152', // Terre d'Hermès Eau Givrée
    description: "Un voile de givre fertilise la terre et l'exalte d'une force nouvelle, revigorante. La parfumeure Christine Nagel explore le contraste entre fraîcheur glacée et puissance minérale. Le cédrat vif et la baie de genièvre ouvrent sur un cœur glacé et minéral, avant de révéler un fond boisé typique de la ligne Terre d'Hermès. Un parfum rechargeable, dans un flacon de verre dépoli et d'aluminium brossé.",
    notes: {
      top:   ['Cédrat', 'Baie de genièvre', 'Poivre Timut'],
      heart: ['Notes minérales et glacées'],
      base:  ['Vétiver', 'Cèdre'],
    },
  },
  {
    id: '683484e2-b62b-4185-ad22-42ea4f187c99', // Afnan 9pm Elixir
    description: "9PM Elixir d'Afnan est une interprétation orientale intense et opulente. Un jus chaud et gourmand qui s'ouvre sur des épices envoûtantes — cardamome, poivre noir — avant de dévoiler un cœur généreux de rhum et de tabac fumé. La base se fond dans un accord de vanille crémeuse, d'oud et de musc ambré qui marque les esprits et tient toute la nuit.",
    notes: {
      top:   ['Cardamome', 'Poivre noir', 'Bergamote'],
      heart: ['Rhum', 'Tabac fumé', 'Épices chaudes'],
      base:  ['Vanille', 'Oud', 'Musc ambré'],
    },
  },
  {
    id: '52c820e4-a6d5-47dd-a649-d33a0c6a2843', // Afnan 9pm Night Out
    description: "9PM Night Out d'Afnan capture l'essence de la nuit moderne. Frais et dynamique en ouverture avec ses notes d'agrumes et de bergamote, il évolue vers un cœur épicé et floral avant de se poser sur un fond ambré et musqué. Taillé pour les soirées, il allie séduction et énergie dans un sillage qui dure jusqu'à l'aube.",
    notes: {
      top:   ['Bergamote', 'Agrumes', 'Poivre rose'],
      heart: ['Notes florales', 'Épices douces'],
      base:  ['Ambre', 'Musc', 'Bois chaud'],
    },
  },
  {
    id: '2e1442d5-ce48-469e-b704-30b5e9ad0b4f', // Rasasi Hawas
    description: "Hawas de Rasasi est une ode à l'océan et à la liberté. Ce parfum aquatique et frais s'ouvre sur des agrumes lumineux et des notes marines avant de dévoiler un cœur boisé légèrement épicé. La base de musc blanc et d'ambre lui confère une tenue remarquable. Frais, propre et irrésistible — un incontournable des parfums arabes modernes.",
    notes: {
      top:   ['Bergamote', 'Citron', 'Notes marines'],
      heart: ['Bois aquatique', 'Menthe', 'Épices légères'],
      base:  ['Ambre', 'Musc blanc', 'Cèdre'],
    },
  },
  {
    id: 'dcd37af3-77e3-4401-99ca-033996c49af5', // Rasasi Hawas Ice
    description: "Hawas Ice de Rasasi pousse la fraîcheur à son paroxysme. Des notes de menthe glacée et d'eucalyptus explosent en tête, créant une sensation arctique immédiate. Le cœur dévoile des accords aquatiques purs et minéraux avant que le fond de musc blanc et de cèdre n'apporte chaleur et profondeur. L'été distillé en flacon.",
    notes: {
      top:   ['Menthe glacée', 'Eucalyptus', 'Notes vertes'],
      heart: ['Notes aquatiques', 'Accord minéral'],
      base:  ['Musc blanc', 'Cèdre', 'Bois frais'],
    },
  },
  {
    id: 'da6faffb-21a8-4647-bebf-ddf8f20405f3', // Rasasi Hawas Kobra
    description: "Hawas Kobra de Rasasi prend la route de l'Orient profond. Loin de la fraîcheur des autres Hawas, Kobra déploie une personnalité épicée et boisée avec des accords de poivre noir, d'épices chaudes et d'oud fumé. Un parfum intense et sophistiqué, à la fois moderne et ancré dans la grande tradition olfactive arabique.",
    notes: {
      top:   ['Poivre noir', 'Épices chaudes'],
      heart: ['Oud', 'Rose', 'Bois fumé'],
      base:  ['Ambre', 'Musc sombre', 'Encens'],
    },
  },
  {
    id: '92fbc064-68da-4afe-8bab-9ed2cccf5492', // Hawas Tropical (Rasasi)
    description: "Hawas Tropical de Rasasi transporte dans un paradis exotique. Des notes de fruits tropicaux éclatants s'entremêlent à des accords floraux sensuels et à une touche aquatique rafraîchissante. La base crémeuse et musquée laisse un sillage doux et envoûtant, parfait pour les journées ensoleillées et les longues soirées estivales.",
    notes: {
      top:   ['Fruits tropicaux', 'Agrumes exotiques'],
      heart: ['Notes florales', 'Accords aquatiques'],
      base:  ['Musc crémeux', 'Vanille', 'Bois doux'],
    },
  },
  {
    id: '3b5f45be-faa1-4421-9976-dde332ab1faa', // Afnan Rare Reef
    description: "Rare Reef d'Afnan capture la pureté de l'océan à son état le plus sauvage. Ce parfum aquatique et minéral s'ouvre sur des notes marines fraîches et iodées, évolue vers un cœur boisé léger et se pose sur un fond de musc blanc et d'ambre marin. Propre, élégant et d'une fraîcheur que l'on ne se lasse pas de porter.",
    notes: {
      top:   ['Notes marines', 'Iode', 'Citrus frais'],
      heart: ['Bois aquatique', 'Accord minéral'],
      base:  ['Musc blanc', 'Ambre marin'],
    },
  },
  {
    id: '7b9729db-a4b6-45d3-98d4-088383959cc0', // Afnan Supermarcy in Oud
    description: "Supermarcy In Oud d'Afnan est un voyage au cœur de l'Orient luxueux. Le bois d'oud — rare et précieux — forme l'épine dorsale de ce parfum enveloppant, magnifié par des accords de rose persane et d'épices chaudes. La base d'ambre, de santal et de musc crée un sillage persistant, chaud et profond. Un parfum de caractère pour les amateurs d'olfaction arabique.",
    notes: {
      top:   ['Épices chaudes', 'Safran'],
      heart: ['Oud', 'Rose persane', 'Bois précieux'],
      base:  ['Ambre', 'Santal', 'Musc oriental'],
    },
  },
  {
    id: 'ef16a594-c75e-4a50-b9aa-405082be6675', // Afnan Turathi Blue
    description: "Turathi Blue d'Afnan est une fraîcheur orientale qui réconcilie modernité et tradition. Ses notes d'ouverture de bergamote et d'agrumes cèdent la place à un cœur boisé légèrement épicé avant de révéler un fond d'ambre et de musc bleuté. Aérien et envoûtant, c'est la signature idéale d'un homme élégant et discret.",
    notes: {
      top:   ['Bergamote', 'Agrumes frais', 'Lavande'],
      heart: ['Bois bleu', 'Épices légères'],
      base:  ['Ambre', 'Musc', 'Fond boisé'],
    },
  },
];

const headers = {
  'Content-Type': 'application/json',
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer':        'return=minimal',
};

async function update(product) {
  const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`;
  const res  = await fetch(url, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ description: product.description, notes: product.notes }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`❌ ${product.id} — ${res.status}: ${txt}`);
  } else {
    console.log(`✅ Mis à jour`);
  }
}

console.log(`\n🚀 Mise à jour de ${UPDATES.length} produits…\n`);
for (const p of UPDATES) {
  await update(p);
}
console.log('\n✅ Terminé !');
