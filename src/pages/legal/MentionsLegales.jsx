import { useSEO } from '../../hooks/useSEO';
import { buildTitle } from '../../utils/seo';
import { LegalLayout, LegalSection } from './LegalLayout';

export default function MentionsLegales() {
  useSEO({
    title:       buildTitle('الإشعارات القانونية'),
    description: 'الإشعارات القانونية لمتجر تشيللو — معلومات الناشر والاستضافة وشروط استخدام الموقع.',
    canonical:   'https://chello-nine.vercel.app/mentions-legales',
    robots:      'noindex,follow',
  });

  return (
    <LegalLayout title="الإشعارات القانونية" updatedAt="يونيو 2026">

      <LegalSection title="1. ناشر الموقع">
        <p>
          الموقع <strong>chello-nine.vercel.app</strong> مملوك ومدار من قبل{' '}
          <strong>Chello (تشيللو)</strong> — متجر أزياء نسائية.
        </p>
        <p>
          <strong className="text-silver-deep">الموقع:</strong> العريمي بوليفارد، الطابق الأول، شارع المطاعم، السيب، مسقط، عُمان<br />
          <strong className="text-silver-deep">واتساب:</strong> +968 96777671
        </p>
      </LegalSection>

      <LegalSection title="2. الاستضافة">
        <p>
          الموقع مستضاف لدى <strong>Vercel Inc.</strong>، شركة أمريكية يقع مقرها في
          340 Pine Street, Suite 701, San Francisco, CA 94104, USA.
        </p>
        <p>
          قاعدة البيانات مستضافة لدى <strong>Supabase Inc.</strong>.
        </p>
      </LegalSection>

      <LegalSection title="3. الملكية الفكرية">
        <p>
          جميع محتويات الموقع — النصوص والصور والشعارات والبرمجيات —
          هي ملك حصري لمتجر Chello أو شركائه، ومحمية بموجب القوانين العُمانية والدولية
          المتعلقة بالملكية الفكرية.
        </p>
        <p>
          يُحظر أي نسخ أو تمثيل أو تعديل أو استغلال لكل أو جزء من
          عناصر الموقع دون إذن كتابي مسبق.
        </p>
      </LegalSection>

      <LegalSection title="4. البيانات الشخصية">
        <p>
          معالجة البيانات الشخصية للمستخدمين موصوفة في{' '}
          <a href="/politique-confidentialite" className="text-silver-deep underline hover:text-ink transition-colors">
            سياسة الخصوصية
          </a>
          . لديك حق الوصول والتصحيح والحذف لبياناتك.
        </p>
      </LegalSection>

      <LegalSection title="5. ملفات تعريف الارتباط (الكوكيز)">
        <p>
          يستخدم الموقع ملفات تعريف الارتباط التقنية اللازمة لتشغيله (الجلسة، سلة التسوق، التفضيلات).
          قد تُستخدم بعض ملفات تعريف الارتباط التحليلية لقياس الجمهور، بعد موافقتك.
        </p>
        <p>
          يمكنك تعديل إعدادات متصفحك لرفض ملفات تعريف الارتباط. قد تتأثر بعض
          وظائف الموقع في هذه الحالة.
        </p>
      </LegalSection>

      <LegalSection title="6. حدود المسؤولية">
        <p>
          يسعى متجر Chello لضمان دقة وتحديث المعلومات المنشورة على الموقع.
          ومع ذلك، لا يمكننا ضمان شمولية المعلومات المتاحة. يحتفظ Chello بحق
          تعديل محتوى الموقع في أي وقت ودون إشعار مسبق.
        </p>
      </LegalSection>

      <LegalSection title="7. القانون المعمول به">
        <p>
          تخضع هذه الإشعارات القانونية لقوانين سلطنة عُمان. في حالة النزاع،
          وبعد محاولة التسوية الودية، تختص المحاكم العُمانية بالنظر فيه.
        </p>
      </LegalSection>

    </LegalLayout>
  );
}
