import { useLanguage } from '../../contexts/LanguageContext';

// NB : ne PAS répéter les messages de <TrustSignals/> (توصيل/دفع/أصلي/الموقع) —
// ce bandeau sert de relais PROMO/éditorial pour éviter la redondance.
const MARQUEE_ITEMS = [
  { ar: 'خصم ١٠٪ على أول طلب', en: '10% off your first order' },
  { ar: 'تشكيلة ٢٠٢٦ الجديدة', en: 'New 2026 collection' },
  { ar: 'توصيل مجاني للطلبات فوق ٣٠ ر.ع', en: 'Free delivery over 30 OMR' },
  { ar: 'عبايات · فساتين · شنط · عطور', en: 'Abayas · Dresses · Bags · Perfumes' },
  { ar: 'وصل حديثاً كل أسبوع', en: 'New arrivals every week' },
  { ar: 'تسوّقي عبر واتساب بسهولة', en: 'Easy ordering on WhatsApp' },
];

// MARQUEE — Bold scrolling strip
export function HomeMarquee() {
  const { lang } = useLanguage();

  return (
    <section className="bg-cream overflow-hidden py-5 border-y border-ink/10">
      <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '35s' }}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
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
