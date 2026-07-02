import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AutoVideo } from '../ui/AutoVideo';
import { EASE } from '../../lib/motion';

/**
 * CINEMATIC LOOKBOOK — moment plein écran "WOW".
 * Vraie vidéo lookbook.mp4 (mannequins en abayas au mall, soirée) en
 * fond muet autoplay (uniquement quand visible), overlay sombre dégradé,
 * titre serif éditorial, ligne luxe courte, CTA fort vers /catalogue.
 */
export function CinematicLookbook() {
  const { lang } = useLanguage();

  return (
    <section className="bg-cream py-16 sm:py-24">
     <div className="relative h-[78vh] min-h-[520px] max-h-[900px] overflow-hidden bg-ink rounded-[1.75rem] mx-4 sm:mx-6 lg:mx-8">
      {/* Vidéo de fond — joue seulement à l'écran */}
      <AutoVideo
        src="/videos/lookbook.mp4"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlays cinéma : assombrissement + dégradés + scrim central pour la
         lisibilité du texte quel que soit le plan de la vidéo (parfois clair) */}
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_center,rgba(24,20,15,0.5),transparent_75%)]" />

      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="flex items-center gap-3 mb-7"
        >
          <span className="w-10 h-px bg-cream/40" />
          <span className="text-cream/80 text-[11px] font-semibold tracking-[0.4em] uppercase [text-shadow:0_1px_10px_rgba(24,20,15,0.7)]">
            {lang === 'ar' ? 'لوك بوك ٢٠٢٦' : 'Lookbook 2026'}
          </span>
          <span className="w-10 h-px bg-cream/40" />
        </motion.div>

        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.1, ease: EASE }}
            className={`font-serif text-cream max-w-4xl [text-shadow:0_2px_28px_rgba(24,20,15,0.5)] ${
              lang === 'ar'
                ? 'not-italic leading-[1.2] pt-[0.2em] text-[2.5rem] sm:text-[3.75rem] lg:text-[5rem]'
                : 'italic leading-[1.02] text-[2.75rem] sm:text-[4.5rem] lg:text-[6rem]'
            }`}
          >
            {lang === 'ar'
              ? 'الأناقة في حركتها'
              : 'Elegance in Motion'}
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          className="text-cream/85 text-base sm:text-lg max-w-xl mt-7 leading-relaxed [text-shadow:0_1px_14px_rgba(24,20,15,0.65)]"
        >
          {lang === 'ar'
            ? 'إطلالات مصمّمة لتُلاحَظ — عبايات وقصّات فاخرة من قلب العريمي بوليفارد، مسقط.'
            : 'Silhouettes designed to be noticed — luxury abayas and pieces, from the heart of Al Araimi Boulevard, Muscat.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="mt-10"
        >
          <Link
            to="/catalogue"
            className="group relative inline-flex items-center gap-3 rounded-full bg-cream text-ink font-semibold uppercase tracking-[0.2em] text-[12px] sm:text-[13px] px-10 py-4.5 overflow-hidden transition-all duration-300 hover:bg-white active:scale-[0.97]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-silver/20 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-3">
              {lang === 'ar'
                ? 'تسوّقي المجموعة'
                : 'Shop the Collection'}
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </div>
     </div>
    </section>
  );
}

export default CinematicLookbook;
