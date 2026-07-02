import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';

// NEWSLETTER — ancre #newsletter (levier -10% depuis le Footer)
export function NewsletterSection() {
  const { t, lang } = useLanguage();

  // Newsletter (state local — pas de backend requis)
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone, setNlDone] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlDone(true);
  };

  return (
    <section id="newsletter" className="bg-cream border-t border-ink/10 scroll-mt-24">
      <ScrollReveal className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <Mail className="mx-auto text-silver-deep mb-5" size={28} strokeWidth={1.5} />
        <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-3">
          {t('nlTitle')}
        </h2>
        <p className="text-ink-soft text-sm sm:text-base mb-8 max-w-md mx-auto">
          {lang === 'ar'
            ? 'اشتركي لتصلك آخر الإطلالات والعروض الحصرية من Chello.'
            : 'Subscribe for the latest looks and exclusive Chello offers.'}
        </p>

        {nlDone ? (
          <p className="text-ink font-medium text-base bg-silver/10 border border-silver/30 rounded-full inline-block px-6 py-3">
            {lang === 'ar'
              ? '🎉 تم الاشتراك! ستصلك جديد إطلالاتنا وعروضنا.'
              : '🎉 You\'re subscribed! Our latest looks and offers are on the way.'}
          </p>
        ) : (
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col w-full max-w-md mx-auto sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={nlEmail}
              onChange={(e) => setNlEmail(e.target.value)}
              placeholder={t('nlPlaceholder')}
              className="flex-1 bg-cream border border-ink/15 rounded-full py-3.5 px-5 text-ink placeholder-ink-soft/40 focus:border-ink outline-none text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-ink hover:bg-ink/90 text-cream px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.97]"
            >
              {t('nlBtn')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        )}
      </ScrollReveal>
    </section>
  );
}
