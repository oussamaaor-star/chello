import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

// NB : ne PAS répéter les messages de <TrustSignals/> (توصيل/دفع/أصلي/الموقع) —
// ce bandeau sert de relais PROMO/éditorial pour éviter la redondance.
// Fallback si la table announcements est absente (migration 022 non exécutée)
// ou si Supabase ne répond pas — le bandeau reste toujours fonctionnel.
const FALLBACK_ITEMS = [
  { ar: 'خصم ١٠٪ على أول طلب', en: '10% off your first order' },
  { ar: 'تشكيلة ٢٠٢٦ الجديدة', en: 'New 2026 collection' },
  { ar: 'توصيل مجاني للطلبات فوق ٣٠ ر.ع', en: 'Free delivery over 30 OMR' },
  { ar: 'عبايات · فساتين · شنط · عطور', en: 'Abayas · Dresses · Bags · Perfumes' },
  { ar: 'وصل حديثاً كل أسبوع', en: 'New arrivals every week' },
  { ar: 'تسوّقي عبر واتساب بسهولة', en: 'Easy ordering on WhatsApp' },
];

// MARQUEE — Bold scrolling strip (messages gérés dans Admin → Promos)
export function HomeMarquee() {
  const { lang } = useLanguage();
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    supabase
      .from('announcements')
      .select('text_ar, text_en')
      .eq('active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (error || !data) return; // table absente → fallback codé en dur
        if (data.length === 0) { setHidden(true); return; } // tout désactivé par l'admin
        setItems(data.map((d) => ({ ar: d.text_ar, en: d.text_en })));
      });
  }, []);

  if (hidden) return null;

  // Répète la liste pour remplir la largeur quel que soit le nombre de messages.
  const reps = Math.max(4, Math.ceil(12 / items.length));
  const loop = Array.from({ length: reps }, () => items).flat();

  return (
    <section className="bg-cream overflow-hidden py-5 border-y border-ink/10">
      <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '35s' }}>
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-8 mx-8">
            <span className="text-sm sm:text-base font-semibold tracking-[0.15em] text-ink/80 uppercase">
              {lang === 'ar' ? item.ar : item.en}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-silver/50 flex-shrink-0" />
          </span>
        ))}
      </div>
    </section>
  );
}
