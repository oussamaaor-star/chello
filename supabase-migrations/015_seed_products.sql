-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 015 — Seed products from products.json into the database
-- 24 products: dresses, abayas, bags, shoes, perfumes
-- Idempotent: ON CONFLICT (slug) DO NOTHING
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO products (slug, category, name, description, price, images, sizes, featured, is_new, active, in_stock, sort_order)
VALUES
  ('tiour-3-pieces-moutarde', 'dresses',
   'تيور 3 قطع بتصميم راقي — خردلي',
   'لوك واحد بعشرة ألوان متاحة. تيور 3 قطع بتصميم راقي يناسب كل إطلالاتك.',
   28.500, ARRAY['/products/dress-elegant-1.jpg','/products/dress-elegant-2.jpg'],
   ARRAY['S','M','L','XL'], true, true, true, true, 1),

  ('trench-coat-multicolore', 'dresses',
   'معطف ترنش أنيق — بألوان متعددة',
   'معطف ترنش بقصة كلاسيكية وحزام عند الخصر، يضيف لمسة راقية لإطلالتك في كل المواسم. متوفر بأكثر من 10 ألوان — اختاري ما يناسبك.',
   32.000, ARRAY['/products/trench-coat-1.jpg','/products/trench-coat-2.jpg'],
   ARRAY['S','M','L','XL'], true, true, true, true, 2),

  ('set-moutarde-qiladah', 'dresses',
   'طقم خردلي مع قلادة',
   'طقم بلوزة وبنطال واسع بقصة مريحة، يعطي حضوراً أنيقاً وواثقاً مع إضافة إكسسوار قلادة.',
   22.000, ARRAY['/products/outfit-set-1.jpg','/products/outfit-set-2.jpg'],
   ARRAY['S','M','L'], true, false, true, true, 3),

  ('top-cache-coeur-multicolore', 'dresses',
   'توب بدون أكمام بقصة كشكش — بألوان متعددة',
   'توب أنيق بدون أكمام، ياقة عالية وتفصيلة كشكش عند الخصر تعطي حركة جميلة. متوفر بأكثر من 10 ألوان.',
   14.500, ARRAY['/products/top-fashion-1.jpg','/products/top-fashion-2.jpg'],
   ARRAY['S','M','L'], false, true, true, true, 4),

  ('sandale-oran-multicolore', 'shoes',
   'صندل أوران الفاخر — بألوان متعددة',
   'صندل بتصميم كلاسيكي أنيق، خامة جلد فاخرة، يناسب الإطلالات اليومية والمناسبات. متوفر بعدة ألوان.',
   18.000, ARRAY['/products/sandal-elegant-1.jpg','/products/sandal-elegant-2.jpg'],
   ARRAY[]::text[], true, false, true, true, 5),

  ('ballerine-noeud-saten', 'shoes',
   'حذاء ساتان بفيونكة أنيقة — بألوان متعددة',
   'سحر الساتان وفخامة التصميم — حذاء سلينج باك بفيونكة مميزة. متوفر بعدة ألوان.',
   15.500, ARRAY['/products/ballet-flat-1.jpg','/products/ballet-flat-2.jpg'],
   ARRAY[]::text[], true, false, true, true, 6),

  ('sac-matelasse-multicolore', 'bags',
   'شنطة مبطنة فاخرة — بألوان متعددة',
   'شنطة بتصميم مبطن أنيق وحمالة قابلة للتعديل، تكمل أناقتك في كل خروجة. متوفرة بعدة ألوان.',
   24.000, ARRAY['/products/quilted-bag-1.jpg','/products/quilted-bag-2.jpg'],
   ARRAY[]::text[], true, false, true, true, 7),

  ('sac-seau-jildi', 'bags',
   'شنطة دلو جلدية — بألوان متعددة',
   'شنطة دلو بخامة جلد فاخرة وتفاصيل معدنية ذهبية، تناسب الإطلالات اليومية والرسمية.',
   19.500, ARRAY['/products/bucket-bag-1.jpg','/products/bucket-bag-2.jpg'],
   ARRAY[]::text[], false, false, true, true, 8),

  ('sac-seau-haykali-beige', 'bags',
   'شنطة هيكلية بيج',
   'شنطة بتصميم هيكلي عصري وتفاصيل معدنية ذهبية، خامة فاخرة تناسب كل الإطلالات.',
   22.500, ARRAY['/products/structured-bag-1.jpg'],
   ARRAY[]::text[], false, false, true, true, 9),

  ('tailleur-blazer-gris', 'dresses',
   'بدلة بليزر رمادية',
   'بدلة بليزر وبنطال واسع بقصة عملية أنيقة، تمنحك حضوراً واثقاً ومرتباً في العمل والمناسبات.',
   35.000, ARRAY['/products/blazer-suit-1.jpg'],
   ARRAY['S','M','L'], false, false, true, true, 10),

  ('co-ord-beige', 'dresses',
   'طقم بيج بأكمام طويلة',
   'طقم بلوزة وبنطال بنفس اللون، قصة مريحة وأنيقة تناسب الإطلالات اليومية الراقية.',
   25.000, ARRAY['/products/coord-set-1.jpg'],
   ARRAY['S','M','L'], false, false, true, true, 11),

  ('robe-blazer-lavande', 'dresses',
   'فستان بليزر لافندر',
   'فستان بتصميم بليزر أنيق بلون لافندر هادئ، مزين بحزام عند الخصر لإطلالة عصرية ومميزة.',
   29.000, ARRAY['/products/blazer-dress-1.jpg'],
   ARRAY['S','M','L'], false, true, true, true, 12),

  ('ensemble-camouflage', 'dresses',
   'طقم بنطال كامو',
   'طقم بنطال واسع بطباعة كامو عصرية، يناسب الإطلالات الكاجوال الأنيقة.',
   23.000, ARRAY['/products/fashion-outfit-1.jpg'],
   ARRAY['S','M','L'], false, true, true, true, 13),

  ('robe-emeraude', 'dresses',
   'فستان زمردي أنيق',
   'فستان بلون زمردي جذاب وقصة انسيابية، مثالي للمناسبات والخروجات المسائية.',
   27.500, ARRAY['/products/emerald-dress-1.jpg'],
   ARRAY['S','M','L'], false, false, true, true, 14),

  ('pantalon-marine', 'dresses',
   'بنطال كحلي بقصة مستقيمة',
   'بنطال أنيق بتصميم عملي راقٍ، قصة مستقيمة واسعة تمنح الراحة والانسيابية طوال اليوم.',
   16.000, ARRAY['/products/fashion-pants-1.jpg'],
   ARRAY['S','M','L','XL'], false, false, true, true, 15),

  ('sandale-talon-bordeaux', 'shoes',
   'صندل كعب نبيتي',
   'صندل بكعب متوسط وتصميم عصري، يجمع بين الأناقة والراحة.',
   17.000, ARRAY['/products/heel-sandal-1.jpg'],
   ARRAY[]::text[], false, false, true, true, 16),

  ('sandale-talon-beige', 'shoes',
   'صندل بيج بكعب أنيق',
   'صندل بكعب نحيف وتصميم راقٍ، مناسب للمناسبات والخروجات المسائية.',
   19.000, ARRAY['/products/heel-sandal-2.jpg'],
   ARRAY[]::text[], false, false, true, true, 17),

  ('set-asfar-anika', 'dresses',
   'طقم أصفر أنيق',
   'طقم بلوزة وبنطال واسع بلون أصفر مشمس، إطلالة مميزة وجذابة.',
   21.500, ARRAY['/products/yellow-set-1.jpg'],
   ARRAY['S','M','L'], false, false, true, true, 18),

  ('majmouaat-shanat', 'bags',
   'تشكيلة شنط متنوعة',
   'تشكيلة مختارة من الشنط بتصاميم وألوان متنوعة تناسب كل إطلالة.',
   26.000, ARRAY['/products/bags-collection-1.jpg'],
   ARRAY[]::text[], false, false, true, true, 19),

  ('shanat-beige-ahmar', 'bags',
   'شنطتين بيج وأحمر',
   'شنط بتصاميم أنيقة بلونين مميزين، تناسب الإطلالات اليومية والرسمية.',
   20.000, ARRAY['/products/bags-duo-1.jpg'],
   ARRAY[]::text[], false, false, true, true, 20),

  ('tashkilat-aatourat', 'perfumes',
   'تشكيلة عطورات متنوعة',
   'تشكيلة مختارة من أرقى دور العطور العالمية، متوفرة في المتجر.',
   12.000, ARRAY['/products/perfume-collection-1.jpg','/products/perfume-collection-2.jpg'],
   ARRAY[]::text[], false, false, true, true, 21),

  ('abaya-noire-classique', 'abayas',
   'عباية سوداء كلاسيكية',
   'عباية سوداء بقصة انسيابية كلاسيكية مع تطريزات ذهبية رقيقة على الأكمام، تناسب كل المناسبات.',
   38.000, ARRAY['/products/abaya-black-1.jpg'],
   ARRAY['S','M','L','XL'], true, true, true, true, 22),

  ('abaya-ouverte-beige', 'abayas',
   'عباية مفتوحة بيج',
   'عباية مفتوحة بتصميم عصري بلون بيج أنيق مع حزام عند الخصر، مثالية للإطلالات اليومية الراقية.',
   34.000, ARRAY['/products/abaya-beige-1.jpg'],
   ARRAY['S','M','L','XL'], false, true, true, true, 23),

  ('abaya-emeraude-brodee', 'abayas',
   'عباية زمردية مطرزة',
   'عباية بلون زمردي مميز مع تطريزات يدوية فاخرة، تضيف لمسة من الفخامة لإطلالتك في المناسبات.',
   42.000, ARRAY['/products/abaya-green-1.jpg'],
   ARRAY['S','M','L'], false, false, true, true, 24)

ON CONFLICT (slug) DO NOTHING;
