import { MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { LocationMap } from '../ui/LocationMap';
import { SHOP_CONFIG } from '../../utils/config';

// LOCATION — bande compacte (adresse + Maps + WhatsApp)
export function LocationSection() {
  const { lang } = useLanguage();

  return (
    <section className="bg-cream border-t border-ink/10">
      <ScrollReveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-start">
          {/* Adresse + boutons */}
          <div className="flex flex-col items-center lg:items-start gap-7">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-12 h-12 rounded-full border border-ink/15 flex items-center justify-center text-silver-deep">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <div className="text-start">
                <p className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase mb-2">
                  {lang === 'ar' ? 'زورينا في المتجر' : 'Visit Our Store'}
                </p>
                <p className="font-serif italic text-2xl sm:text-3xl text-ink mb-1.5">
                  {lang === 'ar' ? 'العريمي بوليفارد' : 'Al Araimi Boulevard'}
                </p>
                <p className="text-ink-soft text-sm max-w-sm">
                  {lang === 'ar'
                    ? 'الطابق الأول، شارع المطاعم، السيب، مسقط'
                    : '1st Floor, Restaurants Street, Seeb, Muscat'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://www.google.com/maps/place/Al+Araimi+Boulevard/@23.655748,58.182519,16z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-ink hover:bg-ink/90 text-cream font-semibold uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-colors active:scale-[0.97]"
              >
                <MapPin size={16} />
                {lang === 'ar' ? 'الخريطة' : 'Google Maps'}
              </a>
              <a
                href={SHOP_CONFIG.wa_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 border border-ink/20 hover:border-ink text-ink font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-colors hover:bg-ink/5"
              >
                <MessageCircle size={16} />
                {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
              </a>
            </div>
          </div>

          {/* Carte interactive (cliquer pour déplier) */}
          <div className="shrink-0 flex justify-center pb-8 lg:pb-0">
            <LocationMap
              location={lang === 'ar' ? 'العريمي بوليفارد' : 'Al Araimi Boulevard'}
              coordinates="23.656° N · 58.183° E"
            />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
