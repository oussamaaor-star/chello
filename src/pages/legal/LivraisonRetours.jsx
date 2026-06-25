import { useSEO } from '../../hooks/useSEO';
import { buildTitle } from '../../utils/seo';
import { LegalLayout, LegalSection, LegalSub } from './LegalLayout';
import { Truck, Clock, MapPin, Shield, Banknote, XCircle } from 'lucide-react';

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
  useSEO({
    title:       buildTitle('التوصيل والإرجاع'),
    description: 'توصيل في جميع أنحاء عُمان خلال 1-4 أيام عمل. الدفع عند الاستلام بالريال العُماني. إمكانية الإرجاع خلال 3 أيام للمنتجات غير المستعملة.',
    canonical:   'https://chello-nine.vercel.app/livraison-retours',
    robots:      'noindex,follow',
  });

  return (
    <LegalLayout title="التوصيل والإرجاع" updatedAt="يونيو 2026">

      {/* Resume visuel */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <InfoCard icon={Truck} title="توصيل داخل مسقط">
          <p>خلال 1-2 أيام عمل</p>
          <p className="font-semibold text-ink">1.000 ر.ع. — مجاني للطلبات بقيمة 10.000 ر.ع. فما فوق</p>
        </InfoCard>
        <InfoCard icon={Truck} title="توصيل لباقي مناطق عُمان">
          <p>خلال 2-4 أيام عمل</p>
          <p className="font-semibold text-ink">2.000 ر.ع.</p>
        </InfoCard>
      </div>

      {/* Notice retours */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-8">
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800 mb-1">سياسة الإرجاع</p>
          <p className="text-sm text-red-700">
            يمكن إرجاع المنتجات غير المستخدمة في حالتها الأصلية مع البطاقات خلال 3 أيام
            من الاستلام. المنتجات المستعملة أو التي أُزيلت بطاقاتها لا تُقبل للإرجاع.
            في حالة منتج معيب أو خطأ في التوصيل، يتم الاستبدال أو الاسترداد مجاناً
            (انظر أدناه).
          </p>
        </div>
      </div>

      {/* Livraison */}
      <LegalSection title="1. طرق التوصيل">
        <LegalSub title="التوصيل القياسي">
          <p>
            توصيل إلى العنوان خلال <strong>1-4 أيام عمل</strong> بعد شحن
            طلبك. سيتم التواصل معك من قبل مندوب التوصيل قبل التسليم.
          </p>
          <p>
            <strong>التكلفة:</strong> 1.000 ر.ع. داخل مسقط (مجاني للطلبات بقيمة 10.000 ر.ع. فما فوق)
            — 2.000 ر.ع. لباقي المناطق.
          </p>
        </LegalSub>
      </LegalSection>

      <LegalSection title="2. منطقة التوصيل">
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {[
            { zone: 'مسقط والسيب', delai: '1-2 أيام عمل', tarif: '1.000 ر.ع. (مجاني من 10.000 ر.ع.)' },
            { zone: 'باقي مناطق عُمان', delai: '2-4 أيام عمل', tarif: '2.000 ر.ع.' },
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

      <LegalSection title="3. الدفع عند الاستلام">
        <p>
          جميع طلباتنا تُدفع <strong>نقداً عند الاستلام</strong>، مباشرة
          لمندوب التوصيل، بالريال العُماني (ر.ع.). لا يُطلب أي دفع مسبق.
        </p>
      </LegalSection>

      <LegalSection title="4. استلام الطرد">
        <p>عند استلام طلبك، ننصحك بـ:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 mr-2">
          <li>فحص حالة الطرد الخارجية قبل الدفع لمندوب التوصيل.</li>
          <li>في حال تلف الطرد، رفض الاستلام أو تسجيل ملاحظات.</li>
          <li>التواصل معنا خلال <strong>48 ساعة</strong> في حال وجود منتج تالف أو ناقص.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. منتج معيب أو خطأ في التوصيل">
        <p>
          إذا استلمت منتجاً تالفاً أو مختلفاً عن طلبك، تواصل معنا خلال{' '}
          <strong>48 ساعة</strong> من الاستلام:
        </p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 mr-2">
          <li>عبر واتساب على +968 96777671 مع إرفاق صور للمنتج.</li>
        </ul>
        <p className="mt-3">
          في هذه الحالة فقط، سيتم الاستبدال أو الاسترداد في أسرع وقت دون تكاليف إضافية.
        </p>
      </LegalSection>

      <LegalSection title="6. الضمانات">
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <div className="flex items-start gap-3 p-3.5 bg-cream border border-silver-deep/10 rounded-xl">
            <Shield className="w-4 h-4 text-silver-deep flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink text-sm">جودة مضمونة</p>
              <p className="text-xs text-ink-soft mt-0.5">جميع منتجاتنا أصلية ومختارة بعناية.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 bg-cream border border-silver-deep/10 rounded-xl">
            <Banknote className="w-4 h-4 text-silver-deep flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink text-sm">دفع آمن</p>
              <p className="text-xs text-ink-soft mt-0.5">تدفع نقداً فقط عند الاستلام — بدون مخاطر.</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="7. خدمة العملاء">
        <p>فريقنا متاح يومياً:</p>
        <div className="mt-3 space-y-2">
          <p><strong>واتساب:</strong> +968 96777671</p>
        </div>
      </LegalSection>

    </LegalLayout>
  );
}
