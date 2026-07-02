import { useSEO } from '../../hooks/useSEO';
import { buildTitle } from '../../utils/seo';
import { LegalLayout, LegalSection, LegalSub } from './LegalLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export default function CGV() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  useSEO({
    title:       buildTitle(ar ? 'الشروط والأحكام العامة للبيع' : 'General Terms and Conditions of Sale'),
    description: ar
      ? 'الشروط والأحكام العامة للبيع في متجر تشيللو — الطلبات، الدفع، التوصيل في عُمان، الإرجاع والضمانات.'
      : 'General terms and conditions of sale of the Chello store — orders, payment, delivery in Oman, returns and guarantees.',
    canonical:   'https://chello-nine.vercel.app/cgv',
    robots:      'noindex,follow',
  });

  return (
    <LegalLayout
      title={ar ? 'الشروط والأحكام العامة للبيع' : 'General Terms and Conditions of Sale'}
      updatedAt={ar ? 'يونيو 2026' : 'June 2026'}
    >

      <p className="text-sm text-ink-soft mb-8 p-4 bg-cream border border-silver-deep/10 rounded-xl leading-relaxed">
        {ar ? (
          <>
            تحكم هذه الشروط والأحكام العامة للبيع جميع المعاملات التي تتم على موقع{' '}
            <strong>chello-nine.vercel.app</strong> بين متجر Chello وعملائه.
            أي طلب يعني القبول الكامل لهذه الشروط.
          </>
        ) : (
          <>
            These general terms and conditions of sale govern all transactions made on the{' '}
            <strong>chello-nine.vercel.app</strong> website between the Chello store and its customers.
            Placing an order implies full acceptance of these terms.
          </>
        )}
      </p>

      <LegalSection title={ar ? '1. هوية البائع' : '1. Seller Identity'}>
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

      <LegalSection title={ar ? '2. المنتجات' : '2. Products'}>
        {ar ? (
          <p>
            المنتجات المعروضة للبيع على الموقع هي أزياء نسائية تشمل: فساتين جاهزة،
            عبايات، حقائب، أحذية، وعطور. يتم عرضها بأكبر قدر ممكن من الدقة.
            الصور المرفقة بالمنتجات لا تُعد تعاقدية.
          </p>
        ) : (
          <p>
            The products offered for sale on the website are women&apos;s fashion items including:
            ready-to-wear dresses, abayas, bags, shoes and perfumes. They are presented as accurately
            as possible. Product images are not contractually binding.
          </p>
        )}
        {ar ? (
          <p>
            العروض سارية في حدود المخزون المتاح. في حال عدم التوفر بعد تأكيد الطلب،
            يتم إعلام العميل في أسرع وقت ويمكنه طلب الاسترداد أو الاستبدال.
          </p>
        ) : (
          <p>
            Offers are valid while stocks last. If an item is unavailable after the order is
            confirmed, the customer is informed as soon as possible and may request a refund or an
            exchange.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '3. الأسعار' : '3. Prices'}>
        {ar ? (
          <p>
            الأسعار المعروضة على الموقع مُحددة بـ <strong>الريال العُماني (ر.ع.)</strong>،
            بدون تكاليف التوصيل. يحتفظ Chello بحق تعديل أسعاره في أي وقت.
            يتم فوترة الطلبات بالسعر المعمول به وقت التأكيد.
          </p>
        ) : (
          <p>
            The prices displayed on the website are stated in <strong>Omani Rial (OMR)</strong>,
            excluding delivery costs. Chello reserves the right to change its prices at any time.
            Orders are invoiced at the price in effect at the time of confirmation.
          </p>
        )}
        <LegalSub title={ar ? 'تكاليف التوصيل' : 'Delivery Costs'}>
          {ar ? (
            <p>التوصيل في جميع أنحاء عُمان: <strong>1.5 ر.ع.</strong> لكل طلب — <strong>مجاني</strong> للطلبات بقيمة 30 ر.ع. فما فوق.</p>
          ) : (
            <p>Delivery across Oman: a flat <strong>1.5 OMR</strong> per order — <strong>free</strong> for orders of 30 OMR and above.</p>
          )}
        </LegalSub>
      </LegalSection>

      <LegalSection title={ar ? '4. الطلب' : '4. Ordering'}>
        <LegalSub title={ar ? 'خطوات الطلب' : 'Ordering Steps'}>
          <p>{ar ? '1. اختيار المنتجات وإضافتها إلى السلة.' : '1. Select products and add them to the cart.'}</p>
          <p>{ar ? '2. مراجعة السلة وإدخال عنوان التوصيل في عُمان.' : '2. Review the cart and enter your delivery address in Oman.'}</p>
          <p>{ar ? '3. التحقق من طريقة التوصيل.' : '3. Confirm the delivery method.'}</p>
          <p>{ar ? '4. تأكيد الطلب.' : '4. Confirm the order.'}</p>
          <p>{ar ? '5. استلام تأكيد الطلب.' : '5. Receive your order confirmation.'}</p>
        </LegalSub>
        <LegalSub title={ar ? 'التأكيد' : 'Confirmation'}>
          {ar ? (
            <p>
              يتم تأكيد الطلب نهائياً بعد مراجعته من قبل فريقنا.
              يتم إرسال ملخص تأكيد تلقائي يتضمن رقم الطلب وتفاصيل المنتجات والمبلغ الإجمالي.
            </p>
          ) : (
            <p>
              An order is finally confirmed after review by our team. An automatic confirmation
              summary is sent, including the order number, product details and total amount.
            </p>
          )}
        </LegalSub>
        <LegalSub title={ar ? 'الإلغاء' : 'Cancellation'}>
          {ar ? (
            <p>
              يمكن إلغاء الطلب فقط قبل شحنه. تواصل معنا في أسرع وقت عبر واتساب
              على الرقم +968 96777671.
              بمجرد تسليم الطرد لشركة التوصيل، لا يمكن الإلغاء.
            </p>
          ) : (
            <p>
              An order can only be cancelled before it is shipped. Contact us as soon as possible via
              WhatsApp at +968 96777671. Once the parcel is handed over to the courier, it can no
              longer be cancelled.
            </p>
          )}
        </LegalSub>
      </LegalSection>

      <LegalSection title={ar ? '5. الدفع' : '5. Payment'}>
        {ar ? (
          <p>
            يتم الدفع <strong>عند الاستلام (نقداً)</strong> بالريال العُماني.
            لا يُطلب أي دفع مسبق عبر الإنترنت.
          </p>
        ) : (
          <p>
            Payment is made <strong>cash on delivery</strong> in Omani Rial. No online prepayment is
            required.
          </p>
        )}
        {ar ? (
          <p>
            تدفع مباشرة لمندوب التوصيل عند استلام طردك.
          </p>
        ) : (
          <p>
            You pay the courier directly when you receive your parcel.
          </p>
        )}
        {ar ? (
          <p>
            يحتفظ Chello بحق رفض أي طلب في حالة الاشتباه بالاحتيال
            أو عنوان توصيل غير صالح.
          </p>
        ) : (
          <p>
            Chello reserves the right to refuse any order in the event of suspected fraud or an
            invalid delivery address.
          </p>
        )}
      </LegalSection>

      <LegalSection title={ar ? '6. التوصيل' : '6. Delivery'}>
        {ar ? (
          <p>
            يتم شحن الطلبات من مقرنا في عُمان والتوصيل إلى جميع أنحاء السلطنة.
          </p>
        ) : (
          <p>
            Orders are shipped from our premises in Oman and delivered throughout the Sultanate.
          </p>
        )}
        <LegalSub title={ar ? 'المدة' : 'Timeframe'}>
          {ar ? (
            <p>التوصيل في جميع أنحاء عُمان خلال <strong>2-3 أيام عمل</strong> بعد الشحن.</p>
          ) : (
            <p>Delivery across Oman within <strong>2-3 business days</strong> after shipping.</p>
          )}
          {ar ? (
            <p>هذه المدد تقريبية. لا يتحمل Chello مسؤولية التأخيرات الناجمة عن شركة التوصيل أو ظروف القوة القاهرة.</p>
          ) : (
            <p>These timeframes are approximate. Chello is not liable for delays caused by the courier or by events of force majeure.</p>
          )}
        </LegalSub>
        <LegalSub title={ar ? 'منطقة التوصيل' : 'Delivery Area'}>
          {ar ? (
            <p>
              يوصل Chello إلى جميع مدن ومناطق سلطنة عُمان.
              التوصيل الدولي غير متاح حالياً.
            </p>
          ) : (
            <p>
              Chello delivers to all cities and regions of the Sultanate of Oman. International
              delivery is not currently available.
            </p>
          )}
        </LegalSub>
        <LegalSub title={ar ? 'الاستلام' : 'Receipt'}>
          {ar ? (
            <p>
              يجب على العميل التحقق من حالة الطرد عند التوصيل وتسجيل أي ملاحظات
              في حال وجود ضرر ظاهر. يجب إبلاغ Chello خلال 48 ساعة عبر واتساب.
            </p>
          ) : (
            <p>
              The customer must check the condition of the parcel upon delivery and note any
              reservations in the event of visible damage. Chello must be informed within 48 hours
              via WhatsApp.
            </p>
          )}
        </LegalSub>
      </LegalSection>

      <LegalSection title={ar ? '7. سياسة الإرجاع' : '7. Returns Policy'}>
        {ar ? (
          <p>
            يمكن إرجاع المنتجات غير المستخدمة في حالتها الأصلية خلال <strong>7 أيام</strong> من
            الاستلام. المنتجات المستعملة أو التي أُزيلت بطاقاتها لا تُقبل للإرجاع.
          </p>
        ) : (
          <p>
            Unused items in their original condition may be returned within <strong>7 days</strong> of
            receipt. Used items or items whose tags have been removed are not accepted for return.
          </p>
        )}
        <LegalSub title={ar ? 'منتج معيب أو خطأ في التوصيل' : 'Defective Item or Delivery Error'}>
          {ar ? (
            <p>
              إذا استلمت منتجاً تالفاً أو مختلفاً عن طلبك، تواصل معنا خلال{' '}
              <strong>48 ساعة</strong> من الاستلام مع صور عبر واتساب على +968 96777671.
              سنقوم بالاستبدال أو الاسترداد في أسرع وقت.
            </p>
          ) : (
            <p>
              If you receive a damaged item or one that differs from your order, contact us within{' '}
              <strong>48 hours</strong> of receipt with photos via WhatsApp at +968 96777671. We will
              arrange an exchange or refund as quickly as possible.
            </p>
          )}
        </LegalSub>
      </LegalSection>

      <LegalSection title={ar ? '8. خدمة العملاء' : '8. Customer Service'}>
        {ar ? (
          <p>
            لأي استفسار أو شكوى، فريقنا متاح:
          </p>
        ) : (
          <p>
            For any question or complaint, our team is available:
          </p>
        )}
        <p>
          {ar ? 'واتساب: ' : 'WhatsApp: '}+968 96777671
        </p>
      </LegalSection>

      <LegalSection title={ar ? '9. القانون المعمول به' : '9. Governing Law'}>
        {ar ? (
          <p>
            تخضع هذه الشروط لقوانين سلطنة عُمان. في حالة النزاع، وبعد محاولة التسوية
            الودية، تختص المحاكم العُمانية بالنظر فيه.
          </p>
        ) : (
          <p>
            These terms are governed by the laws of the Sultanate of Oman. In the event of a dispute,
            and after attempting an amicable settlement, the Omani courts shall have jurisdiction.
          </p>
        )}
      </LegalSection>

    </LegalLayout>
  );
}
