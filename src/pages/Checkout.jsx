import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useCart } from '../hooks/useCart';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const { t, lang } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  useSEO(SEO_PRESETS.checkout);

  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address) {
      setError(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase.rpc('create_order', {
      p_full_name: form.fullName,
      p_phone: form.phone,
      p_address: form.address,
      p_city: form.city,
      p_notes: form.notes,
      p_items: items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        size: i.selectedSize,
        quantity: i.quantity,
        price: i.product.price,
      })),
      p_total: totalPrice,
    });

    setSubmitting(false);
    const row = data?.[0];

    if (insertError || !row) {
      setError(insertError?.message ?? (lang === 'ar' ? 'حدث خطأ، حاولي مجدداً' : 'Something went wrong, please try again'));
      return;
    }

    clearCart();
    navigate(`/confirmation-commande?order=${row.id}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center bg-cream min-h-screen">
        <p className="text-ink-soft mb-6">{t('cartVide')}</p>
        <Link to="/catalogue" className="text-ink underline">{t('cartDecouvrir')}</Link>
      </div>
    );
  }

  const inputClass = "w-full bg-cream border border-ink/15 rounded-xl px-4 py-3 text-ink placeholder-ink-soft/50 focus:border-ink outline-none transition-colors";

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="font-serif italic text-3xl text-ink mb-10">{lang === 'ar' ? 'إتمام الطلب' : 'Checkout'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">{lang === 'ar' ? 'معلومات التواصل' : 'Contact information'}</h2>

            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'} className={inputClass} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder={lang === 'ar' ? 'رقم الواتساب' : 'WhatsApp number'} className={inputClass} />
            <input name="address" value={form.address} onChange={handleChange} placeholder={lang === 'ar' ? 'العنوان بالتفصيل' : 'Detailed address'} className={inputClass} />
            <input name="city" value={form.city} onChange={handleChange} placeholder={lang === 'ar' ? 'المدينة / الولاية' : 'City / Region'} className={inputClass} />
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder={lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'} rows={3} className={inputClass} />

            <div className="border border-ink/15 rounded-xl px-4 py-3 text-ink">
              {lang === 'ar' ? 'طريقة الدفع' : 'Payment method'}: <span className="text-silver-deep font-medium">{lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on delivery'}</span>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ink hover:bg-ink/90 text-cream font-semibold uppercase tracking-wide rounded-full py-3.5 transition-colors disabled:opacity-50"
            >
              {submitting ? (lang === 'ar' ? 'جارٍ التأكيد...' : 'Placing order...') : (lang === 'ar' ? 'تأكيد الطلب' : 'Place order')}
            </button>
          </form>

          <div className="h-fit">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
