import { useSEO } from '../../hooks/useSEO';
import { buildTitle } from '../../utils/seo';
import { LegalLayout, LegalSection, LegalSub } from './LegalLayout';
import { Truck, MapPin, Shield, Banknote, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-cream border border-silver-deep/10 rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-silver-deep" />
        </div>
        <p className="font-semibold text-ink text-sm">{title}</p>
      </div>
      <div className="text-sm text-ink-soft leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function LivraisonRetours() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  useSEO({
    title:       buildTitle(ar ? 'التوصيل والإرجاع' : 'Delivery & Returns'),
    description: ar
      ? 'توصيل في جميع أنحاء عُمان خلال 2-3 أيام عمل. الدفع عند الاستلام بالريال العُماني. إمكانية الإرجاع خلال 7 أيام للمنتجات غير المستعملة.'
      : 'Delivery across Oman within 2-3 business days. Cash on delivery in Omani Rial. Returns accepted within 7 days for unused items.',
    canonical:   'https://chello-nine.vercel.app/livraison-retours',
    robots:      'noindex,follow',
  });

  return (
    <LegalLayout title={ar ? 'التوصيل والإرجاع' : 'Delivery & Returns'} updatedAt={ar ? 'يونيو 2026' : 'June 2026'}>

      {/* Resume visuel */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <InfoCard icon={Truck} title={ar ? 'التوصيل في جميع أنحاء عُمان' : 'Delivery Across Oman'}>
          <p>{ar ? 'خلال 2-3 أيام عمل' : 'Within 2-3 business days'}</p>
          <p className="font-semibold text-ink">
            {ar
              ? '1.5 ر.ع. — مجاني للطلبات بقيمة 30 ر.ع. فما فوق'
              : '1.5 OMR — free for orders of 30 OMR and above'}
          </p>
        </InfoCard>
        <InfoCard icon={Banknote} title={ar ? 'الدفع عند الاستلام' : 'Cash on Delivery'}>
          <p>{ar ? 'تدفع نقداً للمندوب عند استلام طردك' : 'Pay the courier in cash on delivery'}</p>
          <p className="font-semibold text-ink">{ar ? 'بالريال العُماني — بدون دفع مسبق' : 'In Omani Rial — no prepayment'}</p>
        </InfoCard>
      </div>

      {/* Notice retours */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-8">
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800 mb-1">{ar ? 'سياسة الإرجاع' : 'Returns Policy'}</p>
          <p className="text-sm text-red-700">
            {ar
              ? 'يمكن إرجاع المنتجات غير المستخدمة في حالتها الأصلية مع البطاقات خلال 7 أيام من الاستلام. المنتجات المستعملة أو التي أُزيلت بطاقاتها لا تُقبل للإرجاع. في حالة منتج معيب أو خطأ في التوصيل، يتم الاستبدال أو الاسترداد مجاناً (انظر أدناه).'
              : 'Unused items in their original condition with tags may be returned within 7 days of receipt. Used items or items whose tags have been removed are not accepted for return. In the case of a defective item or a delivery error, an exchange or refund is provided free of charge (see below).'}
          </p>
        </div>
      </div>

      {/* Livraison */}
      <LegalSection title={ar ? '1. طرق التوصيل' : '1. Delivery Methods'}>
        <LegalSub title={ar ? 'التوصيل القياسي' : 'Standard Delivery'}>
          {ar ? (
            <p>
              توصيل إلى عنوانك في جميع أنحاء عُمان خلال <strong>2-3 أيام عمل</strong> بعد شحن
              طلبك. سيتم التواصل معك من قبل مندوب التوصيل قبل التسليم.
            </p>
          ) : (
            <p>
              Delivery to your address anywhere in Oman within <strong>2-3 business days</strong> after
              your order is shipped. The courier will contact you before delivery.
            </p>
          )}
          {ar ? (
            <p>
              <strong>التكلفة:</strong> 1.5 ر.ع. لكل طلب — <strong>مجاناً</strong> للطلبات بقيمة 30 ر.ع. فما فوق.
            </p>
          ) : (
            <p>
              <strong>Cost:</strong> a flat 1.5 OMR per order — <strong>free</strong> for orders of 30 OMR and above.
            </p>
          )}
        </LegalSub>
      </LegalSection>

      <LegalSection title={ar ? '2. منطقة التوصيل' : '2. Delivery Area'}>
        {ar ? (
          <p>
            يوصل Chello إلى جميع مدن ومناطق سلطنة عُمان بنفس التعرفة والمدة.
            التوصيل الدولي غير متاح حالياً.
          </p>
        ) : (
          <p>
            Chello delivers to all cities and regions of the Sultanate of Oman at the same rate and
            timeframe. International delivery is not currently available.
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {[
            ar
              ? { zone: 'مسقط والسيب', delai: '2-3 أيام عمل', tarif: '1.5 ر.ع. (مجاني من 30 ر.ع.)' }
              : { zone: 'Muscat & Seeb', delai: '2-3 business days', tarif: '1.5 OMR (free from 30 OMR)' },
            ar
              ? { zone: 'باقي مناطق عُمان', delai: '2-3 أيام عمل', tarif: '1.5 ر.ع. (مجاني من 30 ر.ع.)' }
              : { zone: 'Rest of Oman', delai: '2-3 business days', tarif: '1.5 OMR (free from 30 OMR)' },
          ].map(({ zone, delai, tarif }) => (
            <div key={zone} className="flex items-start gap-3 p-3.5 bg-cream border border-silver-deep/10 rounded-xl">
              <MapPin className="w-4 h-4 text-silver-deep flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink text-sm">{zone}</p>
                <p className="text-xs text-ink-soft mt-0.5">{delai} — {tarif}</p>
              </div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title={ar ? '3. الدفع عند الاستلام' : '3. Cash on Delivery'}>
        {ar ? (
          <p>
            جميع طلباتنا تُدفع <strong>نقداً عند الاستلام</strong>، مباشرة
            لمندوب التوصيل، بالريال العُماني (ر.ع.). لا يُطلب أي دفع مسبق.
          </p>
        ) : (
          <p>
            All our orders are paid <strong>cash on delivery</strong>, directly to the courier, in
            Omani Rial (OMR). No prepayment is required.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '4. استلام الطرد' : '4. Receiving Your Parcel'}>
        <p>{ar ? 'عند استلام طلبك، ننصحك بـ:' : 'When you receive your order, we recommend that you:'}</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 ms-2">
          <li>{ar ? 'فحص حالة الطرد الخارجية قبل الدفع لمندوب التوصيل.' : 'Inspect the external condition of the parcel before paying the courier.'}</li>
          <li>{ar ? 'في حال تلف الطرد، رفض الاستلام أو تسجيل ملاحظات.' : 'If the parcel is damaged, refuse it or note any reservations.'}</li>
          <li>
            {ar ? (
              <>التواصل معنا خلال <strong>48 ساعة</strong> في حال وجود منتج تالف أو ناقص.</>
            ) : (
              <>Contact us within <strong>48 hours</strong> if an item is damaged or missing.</>
            )}
          </li>
        </ul>
      </LegalSection>

      <LegalSection title={ar ? '5. منتج معيب أو خطأ في التوصيل' : '5. Defective Item or Delivery Error'}>
        {ar ? (
          <p>
            إذا استلمت منتجاً تالفاً أو مختلفاً عن طلبك، تواصل معنا خلال{' '}
            <strong>48 ساعة</strong> من الاستلام:
          </p>
        ) : (
          <p>
            If you receive a damaged item or one that differs from your order, contact us within{' '}
            <strong>48 hours</strong> of receipt:
          </p>
        )}
        <ul className="list-disc list-inside space-y-1.5 mt-2 ms-2">
          <li>{ar ? 'عبر واتساب على +968 96777671 مع إرفاق صور للمنتج.' : 'Via WhatsApp at +968 96777671, attaching photos of the item.'}</li>
        </ul>
        {ar ? (
          <p className="mt-3">
            في هذه الحالة فقط، سيتم الاستبدال أو الاسترداد في أسرع وقت دون تكاليف إضافية.
          </p>
        ) : (
          <p className="mt-3">
            In this case only, an exchange or refund will be arranged as quickly as possible at no
            additional cost.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '6. الضمانات' : '6. Guarantees'}>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <div className="flex items-start gap-3 p-3.5 bg-cream border border-silver-deep/10 rounded-xl">
            <Shield className="w-4 h-4 text-silver-deep flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink text-sm">{ar ? 'جودة مضمونة' : 'Guaranteed Quality'}</p>
              <p className="text-xs text-ink-soft mt-0.5">{ar ? 'جميع منتجاتنا أصلية ومختارة بعناية.' : 'All our products are authentic and carefully selected.'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 bg-cream border border-silver-deep/10 rounded-xl">
            <Banknote className="w-4 h-4 text-silver-deep flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink text-sm">{ar ? 'دفع آمن' : 'Secure Payment'}</p>
              <p className="text-xs text-ink-soft mt-0.5">{ar ? 'تدفع نقداً فقط عند الاستلام — بدون مخاطر.' : 'Pay in cash only on delivery — risk free.'}</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection title={ar ? '7. خدمة العملاء' : '7. Customer Service'}>
        <p>{ar ? 'فريقنا متاح يومياً:' : 'Our team is available daily:'}</p>
        <div className="mt-3 space-y-2">
          <p><strong>{ar ? 'واتساب:' : 'WhatsApp:'}</strong> +968 96777671</p>
        </div>
      </LegalSection>

    </LegalLayout>
  );
}
