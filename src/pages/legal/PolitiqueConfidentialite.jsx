import { useSEO } from '../../hooks/useSEO';
import { buildTitle } from '../../utils/seo';
import { LegalLayout, LegalSection, LegalSub } from './LegalLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PolitiqueConfidentialite() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  useSEO({
    title:       buildTitle(ar ? 'سياسة الخصوصية' : 'Privacy Policy'),
    description: ar
      ? 'سياسة الخصوصية لمتجر تشيللو — كيف نجمع ونستخدم ونحمي بياناتك الشخصية.'
      : 'Privacy policy of the Chello store — how we collect, use and protect your personal data.',
    canonical:   'https://chello-nine.vercel.app/politique-confidentialite',
    robots:      'noindex,follow',
  });

  return (
    <LegalLayout title={ar ? 'سياسة الخصوصية' : 'Privacy Policy'} updatedAt={ar ? 'يونيو 2026' : 'June 2026'}>

      <p className="text-sm text-ink-soft mb-8 p-4 bg-cream border border-silver-deep/10 rounded-xl leading-relaxed">
        {ar
          ? 'في متجر Chello، حماية بياناتك الشخصية أولوية. توضح هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتك.'
          : 'At the Chello store, protecting your personal data is a priority. This policy explains how we collect, use and protect your information.'}
      </p>

      <LegalSection title={ar ? '1. المسؤول عن المعالجة' : '1. Data Controller'}>
        {ar ? (
          <p>
            <strong>Chello (تشيللو)</strong> — متجر أزياء نسائية<br />
            العريمي بوليفارد، السيب، مسقط، عُمان<br />
            واتساب: +968 96777671
          </p>
        ) : (
          <p>
            <strong>Chello</strong> — a women&apos;s fashion store<br />
            Al Araimi Boulevard, Seeb, Muscat, Oman<br />
            WhatsApp: +968 96777671
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '2. البيانات المجمعة' : '2. Data Collected'}>
        <LegalSub title={ar ? 'البيانات التي تقدمها مباشرة' : 'Data You Provide Directly'}>
          <ul className="list-disc list-inside space-y-1 mt-2 ms-2">
            <li>{ar ? 'بيانات التعريف: الاسم الكامل، البريد الإلكتروني.' : 'Identification data: full name, email address.'}</li>
            <li>{ar ? 'عنوان التوصيل: العنوان في عُمان، رقم الهاتف.' : 'Delivery address: address in Oman, phone number.'}</li>
            <li>{ar ? 'بيانات الحساب: سجل الطلبات.' : 'Account data: order history.'}</li>
            <li>{ar ? 'المراسلات: محتوى التواصل مع خدمة العملاء.' : 'Correspondence: content of your communications with customer service.'}</li>
          </ul>
        </LegalSub>
        <LegalSub title={ar ? 'البيانات المجمعة تلقائياً' : 'Data Collected Automatically'}>
          <ul className="list-disc list-inside space-y-1 mt-2 ms-2">
            <li>{ar ? 'بيانات التصفح: عنوان IP، نوع المتصفح، الصفحات المُتصفحة.' : 'Browsing data: IP address, browser type, pages visited.'}</li>
            <li>{ar ? 'ملفات تعريف الارتباط التقنية: ضرورية لعمل السلة والجلسة.' : 'Technical cookies: necessary for the operation of the cart and session.'}</li>
            <li>{ar ? 'بيانات تحليلية: سلوك التصفح (الصفحات والمنتجات المُتصفحة).' : 'Analytics data: browsing behavior (pages and products viewed).'}</li>
          </ul>
        </LegalSub>
      </LegalSection>

      <LegalSection title={ar ? '3. أغراض المعالجة' : '3. Purposes of Processing'}>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-cream">
                <th className="text-start p-3 border border-silver-deep/10 font-semibold text-ink">{ar ? 'الغرض' : 'Purpose'}</th>
                <th className="text-start p-3 border border-silver-deep/10 font-semibold text-ink">{ar ? 'الأساس القانوني' : 'Legal Basis'}</th>
              </tr>
            </thead>
            <tbody>
              {(ar
                ? [
                    ['إدارة الطلبات والتوصيل', 'تنفيذ العقد'],
                    ['إنشاء وإدارة حساب العميل', 'تنفيذ العقد'],
                    ['إرسال إشعارات المعاملات (تأكيد الطلب)', 'تنفيذ العقد'],
                    ['خدمة العملاء وإدارة الشكاوى', 'تنفيذ العقد / مصلحة مشروعة'],
                    ['تحليل جمهور الموقع', 'مصلحة مشروعة'],
                    ['مكافحة الاحتيال', 'مصلحة مشروعة'],
                  ]
                : [
                    ['Managing orders and delivery', 'Performance of the contract'],
                    ['Creating and managing the customer account', 'Performance of the contract'],
                    ['Sending transactional notifications (order confirmation)', 'Performance of the contract'],
                    ['Customer service and complaint handling', 'Performance of the contract / legitimate interest'],
                    ['Website audience analysis', 'Legitimate interest'],
                    ['Fraud prevention', 'Legitimate interest'],
                  ]
              ).map(([fin, base]) => (
                <tr key={fin} className="even:bg-cream/50">
                  <td className="p-3 border border-silver-deep/10 text-ink-soft">{fin}</td>
                  <td className="p-3 border border-silver-deep/10 text-ink-soft">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title={ar ? '4. مستلمو البيانات' : '4. Data Recipients'}>
        <p>{ar ? 'قد يتم نقل بياناتك إلى الجهات التالية:' : 'Your data may be transferred to the following parties:'}</p>
        <ul className="list-disc list-inside space-y-2 mt-3 ms-2">
          <li><strong>Vercel Inc.</strong> — {ar ? 'استضافة وبنية الموقع التحتية.' : 'website hosting and infrastructure.'}</li>
          <li><strong>Supabase Inc.</strong> — {ar ? 'قاعدة البيانات والمصادقة.' : 'database and authentication.'}</li>
          <li><strong>{ar ? 'شركات التوصيل الشريكة' : 'Partner courier companies'}</strong> — {ar ? 'توصيل الطلبات في عُمان.' : 'delivery of orders in Oman.'}</li>
        </ul>
        <p className="mt-3">
          {ar ? 'لا يتم بيع بياناتك لأطراف ثالثة لأغراض تجارية أبداً.' : 'Your data is never sold to third parties for commercial purposes.'}
        </p>
      </LegalSection>

      <LegalSection title={ar ? '5. مدة الاحتفاظ' : '5. Data Retention'}>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-cream">
                <th className="text-start p-3 border border-silver-deep/10 font-semibold text-ink">{ar ? 'فئة البيانات' : 'Data Category'}</th>
                <th className="text-start p-3 border border-silver-deep/10 font-semibold text-ink">{ar ? 'مدة الاحتفاظ' : 'Retention Period'}</th>
              </tr>
            </thead>
            <tbody>
              {(ar
                ? [
                    ['بيانات حساب العميل', '3 سنوات بعد آخر نشاط'],
                    ['بيانات الطلبات', '5 سنوات (التزامات قانونية)'],
                    ['سجلات التصفح', '13 شهراً'],
                    ['ملفات تعريف الارتباط التحليلية', '13 شهراً كحد أقصى'],
                  ]
                : [
                    ['Customer account data', '3 years after last activity'],
                    ['Order data', '5 years (legal obligations)'],
                    ['Browsing logs', '13 months'],
                    ['Analytics cookies', '13 months maximum'],
                  ]
              ).map(([cat, dur]) => (
                <tr key={cat} className="even:bg-cream/50">
                  <td className="p-3 border border-silver-deep/10 text-ink-soft">{cat}</td>
                  <td className="p-3 border border-silver-deep/10 text-ink-soft">{dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title={ar ? '6. حقوقك' : '6. Your Rights'}>
        <p>{ar ? 'لديك الحقوق التالية على بياناتك الشخصية:' : 'You have the following rights over your personal data:'}</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {(ar
            ? [
                { r: 'حق الوصول', d: 'الحصول على نسخة من بياناتك.' },
                { r: 'حق التصحيح', d: 'تصحيح البيانات غير الدقيقة.' },
                { r: 'حق الحذف', d: 'طلب حذف بياناتك.' },
                { r: 'حق الاعتراض', d: 'الاعتراض على بعض المعالجات.' },
              ]
            : [
                { r: 'Right of access', d: 'Obtain a copy of your data.' },
                { r: 'Right to rectification', d: 'Correct inaccurate data.' },
                { r: 'Right to erasure', d: 'Request deletion of your data.' },
                { r: 'Right to object', d: 'Object to certain processing.' },
              ]
          ).map(({ r, d }) => (
            <div key={r} className="bg-cream rounded-xl p-3.5 border border-silver-deep/10">
              <p className="font-semibold text-ink text-sm">{r}</p>
              <p className="text-ink-soft text-xs mt-0.5">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          {ar ? (
            <>لممارسة هذه الحقوق، تواصل معنا عبر واتساب على <strong>+968 96777671</strong>. نلتزم بالرد خلال شهر واحد.</>
          ) : (
            <>To exercise these rights, contact us via WhatsApp at <strong>+968 96777671</strong>. We undertake to respond within one month.</>
          )}
        </p>
      </LegalSection>

      <LegalSection title={ar ? '7. أمان البيانات' : '7. Data Security'}>
        <p>
          {ar ? 'يتخذ Chello التدابير التقنية والتنظيمية المناسبة لحماية بياناتك:' : 'Chello takes appropriate technical and organizational measures to protect your data:'}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-3 ms-2">
          <li>{ar ? 'تشفير الاتصالات عبر HTTPS (TLS).' : 'Encryption of communications via HTTPS (TLS).'}</li>
          <li>{ar ? 'مصادقة آمنة عبر Supabase Auth.' : 'Secure authentication via Supabase Auth.'}</li>
          <li>{ar ? 'كلمات المرور مُخزنة بشكل مُشفر (لا تُحفظ كنص واضح أبداً).' : 'Passwords stored in encrypted form (never kept in plain text).'}</li>
          <li>{ar ? 'الوصول للبيانات مقصور على الموظفين المخولين.' : 'Data access restricted to authorized staff.'}</li>
        </ul>
      </LegalSection>

      <LegalSection title={ar ? '8. ملفات تعريف الارتباط (الكوكيز)' : '8. Cookies'}>
        <LegalSub title={ar ? 'ملفات ضرورية' : 'Essential Cookies'}>
          <ul className="list-disc list-inside space-y-1 mt-1 ms-2">
            <li>{ar ? 'جلسة المستخدم والمصادقة.' : 'User session and authentication.'}</li>
            <li>{ar ? 'سلة التسوق (localStorage).' : 'Shopping cart (localStorage).'}</li>
          </ul>
        </LegalSub>
        <LegalSub title={ar ? 'ملفات تحليلية' : 'Analytics Cookies'}>
          <ul className="list-disc list-inside space-y-1 mt-1 ms-2">
            <li>{ar ? 'قياس الجمهور وإحصائيات التصفح.' : 'Audience measurement and browsing statistics.'}</li>
            <li>{ar ? 'الاحتفاظ: 13 شهراً كحد أقصى.' : 'Retention: 13 months maximum.'}</li>
          </ul>
        </LegalSub>
      </LegalSection>

      <LegalSection title={ar ? '9. تعديلات السياسة' : '9. Changes to This Policy'}>
        {ar ? (
          <p>
            يحتفظ Chello بحق تعديل هذه السياسة في أي وقت.
            سيتم إشعار العملاء بأي تعديل جوهري. تاريخ آخر تحديث مُشار إليه أعلى هذه الصفحة.
          </p>
        ) : (
          <p>
            Chello reserves the right to modify this policy at any time. Customers will be notified of
            any material change. The date of the last update is indicated at the top of this page.
          </p>
        )}
      </LegalSection>

    </LegalLayout>
  );
}
