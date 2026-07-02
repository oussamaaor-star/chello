import { useSEO } from '../../hooks/useSEO';
import { buildTitle } from '../../utils/seo';
import { LegalLayout, LegalSection } from './LegalLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export default function MentionsLegales() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  useSEO({
    title:       buildTitle(ar ? 'الإشعارات القانونية' : 'Legal Notice'),
    description: ar
      ? 'الإشعارات القانونية لمتجر تشيللو — معلومات الناشر والاستضافة وشروط استخدام الموقع.'
      : 'Legal notice for the Chello store — publisher and hosting information and terms of use of the website.',
    canonical:   'https://chello-nine.vercel.app/mentions-legales',
    robots:      'noindex,follow',
  });

  return (
    <LegalLayout title={ar ? 'الإشعارات القانونية' : 'Legal Notice'} updatedAt={ar ? 'يونيو 2026' : 'June 2026'}>

      <LegalSection title={ar ? '1. ناشر الموقع' : '1. Website Publisher'}>
        {ar ? (
          <p>
            الموقع <strong>chello-nine.vercel.app</strong> مملوك ومدار من قبل{' '}
            <strong>Chello (تشيللو)</strong> — متجر أزياء نسائية.
          </p>
        ) : (
          <p>
            The website <strong>chello-nine.vercel.app</strong> is owned and operated by{' '}
            <strong>Chello</strong> — a women&apos;s fashion store.
          </p>
        )}
        {ar ? (
          <p>
            <strong className="text-silver-deep">الموقع:</strong> العريمي بوليفارد، الطابق الأول، شارع المطاعم، السيب، مسقط، عُمان<br />
            <strong className="text-silver-deep">واتساب:</strong> +968 96777671
          </p>
        ) : (
          <p>
            <strong className="text-silver-deep">Address:</strong> Al Araimi Boulevard, First Floor, Restaurants Street, Seeb, Muscat, Oman<br />
            <strong className="text-silver-deep">WhatsApp:</strong> +968 96777671
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '2. الاستضافة' : '2. Hosting'}>
        {ar ? (
          <p>
            الموقع مستضاف لدى <strong>Vercel Inc.</strong>، شركة أمريكية يقع مقرها في
            340 Pine Street, Suite 701, San Francisco, CA 94104, USA.
          </p>
        ) : (
          <p>
            The website is hosted by <strong>Vercel Inc.</strong>, a US company headquartered at
            340 Pine Street, Suite 701, San Francisco, CA 94104, USA.
          </p>
        )}
        {ar ? (
          <p>
            قاعدة البيانات مستضافة لدى <strong>Supabase Inc.</strong>.
          </p>
        ) : (
          <p>
            The database is hosted by <strong>Supabase Inc.</strong>
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '3. الملكية الفكرية' : '3. Intellectual Property'}>
        {ar ? (
          <p>
            جميع محتويات الموقع — النصوص والصور والشعارات والبرمجيات —
            هي ملك حصري لمتجر Chello أو شركائه، ومحمية بموجب القوانين العُمانية والدولية
            المتعلقة بالملكية الفكرية.
          </p>
        ) : (
          <p>
            All content on the website — text, images, logos and software — is the exclusive
            property of the Chello store or its partners and is protected under Omani and
            international intellectual property laws.
          </p>
        )}
        {ar ? (
          <p>
            يُحظر أي نسخ أو تمثيل أو تعديل أو استغلال لكل أو جزء من
            عناصر الموقع دون إذن كتابي مسبق.
          </p>
        ) : (
          <p>
            Any copying, reproduction, modification or exploitation of all or part of the
            website&apos;s elements without prior written authorization is prohibited.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '4. البيانات الشخصية' : '4. Personal Data'}>
        {ar ? (
          <p>
            معالجة البيانات الشخصية للمستخدمين موصوفة في{' '}
            <a href="/politique-confidentialite" className="text-silver-deep underline hover:text-ink transition-colors">
              سياسة الخصوصية
            </a>
            . لديك حق الوصول والتصحيح والحذف لبياناتك.
          </p>
        ) : (
          <p>
            The processing of users&apos; personal data is described in our{' '}
            <a href="/politique-confidentialite" className="text-silver-deep underline hover:text-ink transition-colors">
              Privacy Policy
            </a>
            . You have the right to access, rectify and delete your data.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '5. ملفات تعريف الارتباط (الكوكيز)' : '5. Cookies'}>
        {ar ? (
          <p>
            يستخدم الموقع ملفات تعريف الارتباط التقنية اللازمة لتشغيله (الجلسة، سلة التسوق، التفضيلات).
            قد تُستخدم بعض ملفات تعريف الارتباط التحليلية لقياس الجمهور، بعد موافقتك.
          </p>
        ) : (
          <p>
            The website uses technical cookies necessary for its operation (session, shopping cart,
            preferences). Some analytics cookies may be used to measure audience, subject to your consent.
          </p>
        )}
        {ar ? (
          <p>
            يمكنك تعديل إعدادات متصفحك لرفض ملفات تعريف الارتباط. قد تتأثر بعض
            وظائف الموقع في هذه الحالة.
          </p>
        ) : (
          <p>
            You can adjust your browser settings to refuse cookies. Some website features may be
            affected in that case.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '6. حدود المسؤولية' : '6. Limitation of Liability'}>
        {ar ? (
          <p>
            يسعى متجر Chello لضمان دقة وتحديث المعلومات المنشورة على الموقع.
            ومع ذلك، لا يمكننا ضمان شمولية المعلومات المتاحة. يحتفظ Chello بحق
            تعديل محتوى الموقع في أي وقت ودون إشعار مسبق.
          </p>
        ) : (
          <p>
            The Chello store strives to ensure the accuracy and timeliness of the information
            published on the website. However, we cannot guarantee that the available information
            is exhaustive. Chello reserves the right to modify the website&apos;s content at any
            time and without prior notice.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '7. القانون المعمول به' : '7. Governing Law'}>
        {ar ? (
          <p>
            تخضع هذه الإشعارات القانونية لقوانين سلطنة عُمان. في حالة النزاع،
            وبعد محاولة التسوية الودية، تختص المحاكم العُمانية بالنظر فيه.
          </p>
        ) : (
          <p>
            This legal notice is governed by the laws of the Sultanate of Oman. In the event of a
            dispute, and after attempting an amicable settlement, the Omani courts shall have
            jurisdiction.
          </p>
        )}
      </LegalSection>

    </LegalLayout>
  );
}
