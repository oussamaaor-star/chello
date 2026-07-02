import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { getLoyaltyConfig } from '../../utils/loyalty';
import { scaleIn } from '../../lib/motion';

// LOYALTY — Premium dark card
export function LoyaltyCta() {
  const { t, lang } = useLanguage();

  // Bonus d'inscription fidélité chiffré (même source que RegisterLoyalty)
  const [signupBonus, setSignupBonus] = useState(5);

  useEffect(() => {
    getLoyaltyConfig()
      .then((c) => setSignupBonus(c?.signup_bonus ?? 5))
      .catch(() => {});
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <ScrollReveal variants={scaleIn}>
        <div className="max-w-5xl mx-auto rounded-3xl bg-cream-deep border border-ink/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(110,110,110,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(110,110,110,0.04),transparent_50%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver/30 to-transparent" />

          <div className="relative z-10 px-8 sm:px-14 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full border border-silver/40 flex items-center justify-center">
                  <Star className="text-silver-deep" size={20} strokeWidth={1.5} />
                </div>
                <span className="text-silver-deep text-[11px] font-semibold tracking-[0.3em] uppercase">
                  {lang === 'ar' ? 'نظام النقاط' : 'Points System'}
                </span>
              </div>
              <h2 className="font-serif italic text-3xl sm:text-4xl text-ink mb-4 leading-snug">
                {lang === 'ar' ? 'اجمعي نقاطك' : 'Collect Your Points'}
              </h2>
              <p className="text-ink-soft text-base leading-relaxed max-w-md mb-6">
                {lang === 'ar'
                  ? 'سجّلي الآن واجمعي نقاط مع كل عملية شراء — استبدلي نقاطك بخصومات حصرية من Chello.'
                  : 'Sign up and earn points with every purchase — redeem your points for exclusive discounts from Chello.'}
              </p>
              {/* Bonus d'inscription CHIFFRÉ (valeur depuis getLoyaltyConfig, fallback 5) */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 bg-silver/10 border border-silver/30 rounded-full px-4 py-2">
                  <Star size={15} className="text-silver-deep flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-ink">
                    {t('loyaltySignupBonus').replace('{points}', signupBonus)}
                  </span>
                </span>
              </div>
              <Link
                to="/fidelite"
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-ink hover:bg-ink/90 text-cream px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] overflow-hidden transition-all active:scale-[0.97]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-silver/20 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                <span className="relative z-10">
                  {lang === 'ar' ? 'سجّلي الآن' : 'Register Now'}
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-silver/25"
                    style={{
                      width: `${160 + i * 80}px`,
                      height: `${160 + i * 80}px`,
                      top: '50%', left: '50%',
                      x: '-50%', y: '-50%',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25 + i * 10, repeat: Infinity, ease: 'linear' }}
                  />
                ))}
                <div className="relative w-24 h-24 rounded-full bg-silver/15 flex items-center justify-center">
                  <Star className="text-silver-deep" size={32} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
