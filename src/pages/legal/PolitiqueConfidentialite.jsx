import { useSEO } from '../../hooks/useSEO';
import { buildTitle } from '../../utils/seo';
import { LegalLayout, LegalSection, LegalSub } from './LegalLayout';

export default function PolitiqueConfidentialite() {
  useSEO({
    title:       buildTitle('سياسة الخصوصية'),
    description: 'سياسة الخصوصية لمتجر تشيللو — كيف نجمع ونستخدم ونحمي بياناتك الشخصية.',
    canonical:   'https://chello-nine.vercel.app/politique-confidentialite',
    robots:      'noindex,follow',
  });

  return (
    <LegalLayout title="سياسة الخصوصية" updatedAt="يونيو 2026">

      <p className="text-sm text-ink-soft mb-8 p-4 bg-cream border border-gold-deep/10 rounded-xl leading-relaxed">
        في متجر Chello، حماية بياناتك الشخصية أولوية. توضح هذه السياسة كيف نجمع
        ونستخدم ونحمي معلوماتك.
      </p>

      <LegalSection title="1. المسؤول عن المعالجة">
        <p>
          <strong>Chello (تشيللو)</strong> — متجر أزياء نسائية<br />
          العريمي بوليفارد، السيب، مسقط، عُمان<br />
          واتساب: +968 96777671
        </p>
      </LegalSection>

      <LegalSection title="2. البيانات المجمعة">
        <LegalSub title="البيانات التي تقدمها مباشرة">
          <ul className="list-disc list-inside space-y-1 mt-2 mr-2">
            <li>بيانات التعريف: الاسم الكامل، البريد الإلكتروني.</li>
            <li>عنوان التوصيل: العنوان في عُمان، رقم الهاتف.</li>
            <li>بيانات الحساب: سجل الطلبات.</li>
            <li>المراسلات: محتوى التواصل مع خدمة العملاء.</li>
          </ul>
        </LegalSub>
        <LegalSub title="البيانات المجمعة تلقائياً">
          <ul className="list-disc list-inside space-y-1 mt-2 mr-2">
            <li>بيانات التصفح: عنوان IP، نوع المتصفح، الصفحات المُتصفحة.</li>
            <li>ملفات تعريف الارتباط التقنية: ضرورية لعمل السلة والجلسة.</li>
            <li>بيانات تحليلية: سلوك التصفح (الصفحات والمنتجات المُتصفحة).</li>
          </ul>
        </LegalSub>
      </LegalSection>

      <LegalSection title="3. أغراض المعالجة">
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-cream">
                <th className="text-right p-3 border border-gold-deep/10 font-semibold text-ink">الغرض</th>
                <th className="text-right p-3 border border-gold-deep/10 font-semibold text-ink">الأساس القانوني</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['إدارة الطلبات والتوصيل', 'تنفيذ العقد'],
                ['إنشاء وإدارة حساب العميل', 'تنفيذ العقد'],
                ['إرسال إشعارات المعاملات (تأكيد الطلب)', 'تنفيذ العقد'],
                ['خدمة العملاء وإدارة الشكاوى', 'تنفيذ العقد / مصلحة مشروعة'],
                ['تحليل جمهور الموقع', 'مصلحة مشروعة'],
                ['مكافحة الاحتيال', 'مصلحة مشروعة'],
              ].map(([fin, base]) => (
                <tr key={fin} className="even:bg-cream/50">
                  <td className="p-3 border border-gold-deep/10 text-ink-soft">{fin}</td>
                  <td className="p-3 border border-gold-deep/10 text-ink-soft">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="4. مستلمو البيانات">
        <p>قد يتم نقل بياناتك إلى الجهات التالية:</p>
        <ul className="list-disc list-inside space-y-2 mt-3 mr-2">
          <li><strong>Vercel Inc.</strong> — استضافة وبنية الموقع التحتية.</li>
          <li><strong>Supabase Inc.</strong> — قاعدة البيانات والمصادقة.</li>
          <li><strong>شركات التوصيل الشريكة</strong> — توصيل الطلبات في عُمان.</li>
        </ul>
        <p className="mt-3">
          لا يتم بيع بياناتك لأطراف ثالثة لأغراض تجارية أبداً.
        </p>
      </LegalSection>

      <LegalSection title="5. مدة الاحتفاظ">
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-cream">
                <th className="text-right p-3 border border-gold-deep/10 font-semibold text-ink">فئة البيانات</th>
                <th className="text-right p-3 border border-gold-deep/10 font-semibold text-ink">مدة الاحتفاظ</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['بيانات حساب العميل', '3 سنوات بعد آخر نشاط'],
                ['بيانات الطلبات', '5 سنوات (التزامات قانونية)'],
                ['سجلات التصفح', '13 شهراً'],
                ['ملفات تعريف الارتباط التحليلية', '13 شهراً كحد أقصى'],
              ].map(([cat, dur]) => (
                <tr key={cat} className="even:bg-cream/50">
                  <td className="p-3 border border-gold-deep/10 text-ink-soft">{cat}</td>
                  <td className="p-3 border border-gold-deep/10 text-ink-soft">{dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="6. حقوقك">
        <p>لديك الحقوق التالية على بياناتك الشخصية:</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {[
            { r: 'حق الوصول', d: 'الحصول على نسخة من بياناتك.' },
            { r: 'حق التصحيح', d: 'تصحيح البيانات غير الدقيقة.' },
            { r: 'حق الحذف', d: 'طلب حذف بياناتك.' },
            { r: 'حق الاعتراض', d: 'الاعتراض على بعض المعالجات.' },
          ].map(({ r, d }) => (
            <div key={r} className="bg-cream rounded-xl p-3.5 border border-gold-deep/10">
              <p className="font-semibold text-ink text-sm">{r}</p>
              <p className="text-ink-soft text-xs mt-0.5">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          لممارسة هذه الحقوق، تواصل معنا عبر واتساب على <strong>+968 96777671</strong>.
          نلتزم بالرد خلال شهر واحد.
        </p>
      </LegalSection>

      <LegalSection title="7. أمان البيانات">
        <p>
          يتخذ Chello التدابير التقنية والتنظيمية المناسبة لحماية بياناتك:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-3 mr-2">
          <li>تشفير الاتصالات عبر HTTPS (TLS).</li>
          <li>مصادقة آمنة عبر Supabase Auth.</li>
          <li>كلمات المرور مُخزنة بشكل مُشفر (لا تُحفظ كنص واضح أبداً).</li>
          <li>الوصول للبيانات مقصور على الموظفين المخولين.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. ملفات تعريف الارتباط (الكوكيز)">
        <LegalSub title="ملفات ضرورية">
          <ul className="list-disc list-inside space-y-1 mt-1 mr-2">
            <li>جلسة المستخدم والمصادقة.</li>
            <li>سلة التسوق (localStorage).</li>
          </ul>
        </LegalSub>
        <LegalSub title="ملفات تحليلية">
          <ul className="list-disc list-inside space-y-1 mt-1 mr-2">
            <li>قياس الجمهور وإحصائيات التصفح.</li>
            <li>الاحتفاظ: 13 شهراً كحد أقصى.</li>
          </ul>
        </LegalSub>
      </LegalSection>

      <LegalSection title="9. تعديلات السياسة">
        <p>
          يحتفظ Chello بحق تعديل هذه السياسة في أي وقت.
          سيتم إشعار العملاء بأي تعديل جوهري. تاريخ آخر تحديث مُشار إليه أعلى هذه الصفحة.
        </p>
      </LegalSection>

    </LegalLayout>
  );
}
