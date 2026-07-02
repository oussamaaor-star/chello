import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Reels extraits des vidéos boutique Chello (muets, en boucle).
// Chaque tuile est cliquable vers la catégorie pertinente (sinon /catalogue).
const REELS = [
  { src: '/videos/storefront.mp4',    to: '/catalogue',          en: 'Our Boutique',   ar: 'متجرنا' },
  { src: '/videos/lookbook.mp4',      to: '/categorie/abayas',   en: 'Lookbook',       ar: 'إطلالات' },
  { src: '/videos/jewelry.mp4',       to: '/catalogue',          en: 'Jewelry',        ar: 'مجوهرات' },
  { src: '/videos/abayas.mp4',        to: '/categorie/abayas',   en: 'Abayas',         ar: 'عبايات' },
  { src: '/videos/blouses.mp4',       to: '/categorie/dresses',  en: 'New In',         ar: 'وصل حديثاً' },
  { src: '/videos/tops.mp4',          to: '/categorie/dresses',  en: 'Tops',           ar: 'بلوزات' },
  { src: '/videos/ready-to-wear.mp4', to: '/categorie/dresses',  en: 'Ready-to-wear',  ar: 'ملابس جاهزة' },
  { src: '/videos/details.mp4',       to: '/catalogue',          en: 'The Details',    ar: 'تفاصيل' },
  { src: '/videos/shoes.mp4',         to: '/categorie/shoes',    en: 'Shoes',          ar: 'أحذية' },
];

// Une tuile : ne joue que lorsqu'elle est visible (économie data + perf)
function ReelTile({ reel, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <Link to={reel.to} className="snap-center shrink-0 w-[62vw] max-w-[250px] sm:w-60">
      <div className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-ink-soft/20 ring-1 ring-ink/10">
        <video
          ref={ref}
          src={reel.src}
          poster={reel.src.replace('/videos/', '/videos/posters/').replace('.mp4', '.jpg')}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/85 to-transparent" />
        <span className="absolute bottom-3 start-4 end-4 text-cream text-sm font-semibold tracking-wide">
          {label}
        </span>
      </div>
    </Link>
  );
}

export function ReelGallery() {
  const { lang } = useLanguage();
  const pick = (r) => (lang === 'ar' ? r.ar : r.en);

  return (
    <section className="bg-cream border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="text-silver-deep text-[11px] font-semibold tracking-[0.4em] uppercase mb-4">
            {lang === 'ar' ? 'في الحركة' : 'In Motion'}
          </p>
          <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-ink">
            {lang === 'ar' ? 'المتجر بالفيديو' : 'The Boutique in Motion'}
          </h2>
        </div>

        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {REELS.map((r) => (
            <ReelTile key={r.src} reel={r} label={pick(r)} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/catalogue"
            className="group inline-flex items-center gap-2.5 bg-ink hover:bg-ink/90 text-cream font-semibold uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-all active:scale-[0.97]"
          >
            {lang === 'ar' ? 'تسوّقي الإطلالات' : 'Shop the Looks'}
            <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ReelGallery;
