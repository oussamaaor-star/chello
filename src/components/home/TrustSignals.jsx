import { motion } from 'motion/react';
import { Truck, BadgeCheck, Wallet, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { fadeUp, stagger } from '../../lib/motion';

/**
 * TRUST SIGNALS — fine bande de réassurance sur fond sombre (ink).
 * Cash on delivery · Livraison partout en Oman · Authentique · Al Araimi.
 * Bande mince à une rangée, texte cream, pour le rythme visuel.
 */
const SIGNALS = [
  {
    Icon: Truck,
    ar: { t: 'توصيل لكل عُمان', s: 'إلى باب منزلك أينما كنتِ' },
    en: { t: 'Delivery across Oman', s: 'To your door, anywhere' },
  },
  {
    Icon: Wallet,
    ar: { t: 'الدفع عند الاستلام', s: 'ادفعي نقداً عند وصول طلبك' },
    en: { t: 'Cash on delivery', s: 'Pay in cash when it arrives' },
  },
  {
    Icon: BadgeCheck,
    ar: { t: 'قطع أصلية ومنتقاة', s: 'تصاميم فاخرة بعناية' },
    en: { t: 'Authentic & curated', s: 'A carefully chosen luxury edit' },
  },
  {
    Icon: MapPin,
    ar: { t: 'العريمي بوليفارد', s: 'زورينا في متجرنا بمسقط' },
    en: { t: 'Al Araimi Boulevard', s: 'Visit our boutique in Muscat' },
  },
];

export function TrustSignals() {
  const { lang } = useLanguage();
  const pick = (s) => (lang === 'ar' ? s.ar : s.en);

  return (
    <section className="bg-cream border-y border-ink/10">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger(0.08)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6"
      >
        {SIGNALS.map(({ Icon, ...labels }, i) => {
          const l = pick(labels);
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <span className="shrink-0 text-silver-deep">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <p className="text-ink font-semibold text-xs sm:text-sm tracking-wide leading-snug">
                {l.t}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export default TrustSignals;
