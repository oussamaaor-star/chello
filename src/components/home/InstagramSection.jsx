import { Instagram } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { InstagramSlider } from '../ui/InstagramSlider';
import { SHOP_CONFIG } from '../../utils/config';

// INSTAGRAM — Follow us
export function InstagramSection() {
  const { lang } = useLanguage();

  return (
    <section className="border-t border-ink/10 bg-cream py-16 sm:py-24 overflow-hidden">
      <ScrollReveal className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <Instagram className="mx-auto text-silver-deep mb-5" size={28} strokeWidth={1.5} />
        <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-3">
          {lang === 'ar' ? 'تابعينا على إنستغرام' : 'Follow Us on Instagram'}
        </h2>
        <a
          href={SHOP_CONFIG.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="inline-block text-ink-soft hover:text-ink text-sm tracking-wide transition-colors"
        >
          @chello.stor
        </a>
      </ScrollReveal>

      {/* Galerie défilante pleine largeur (vraies images boutique) */}
      <InstagramSlider />

      <div className="text-center mt-12 px-4">
        <a
          href={SHOP_CONFIG.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-ink hover:bg-ink/90 text-cream font-medium uppercase tracking-[0.15em] text-[13px] rounded-full px-8 py-4 transition-all active:scale-[0.97]"
        >
          <Instagram size={16} />
          {lang === 'ar' ? 'تابعينا' : 'Follow Us'}
        </a>
      </div>
    </section>
  );
}
