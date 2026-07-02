import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tag, X, Wallet, Truck, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useCart } from '../hooks/useCart';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { supabase } from '../lib/supabase';
import { getShippingCost } from '../utils/config';

const OMANI_CITIES = [
  'مسقط', 'السيب', 'بوشر', 'مطرح', 'صلالة', 'صحار', 'نزوى', 'صور', 'عبري', 'بهلاء',
  'الرستاق', 'خصب', 'البريمي', 'بركاء', 'السويق', 'إبراء', 'بدبد', 'الحمراء', 'سمائل', 'شناص',
];

export default function Checkout() {
  const { t, lang } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  useSEO(SEO_PRESETS.checkout);

  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Promo code ──────────────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState(null);          // { code, discount_percent }
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    const { data, error: promoErr } = await supabase
      .from('promo_codes')
      .select('code, discount_percent, active, expires_at')
      .ilike('code', code)
      .maybeSingle();
    setPromoLoading(false);

    if (promoErr || !data) {
      setPromo(null);
      setPromoError(lang === 'ar' ? 'رمز غير صالح' : 'Invalid code');
      return;
    }
    if (!data.active) {
      setPromo(null);
      setPromoError(lang === 'ar' ? 'هذا الرمز غير مفعّل' : 'This code is inactive');
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromo(null);
      setPromoError(lang === 'ar' ? 'انتهت صلاحية هذا الرمز' : 'This code has expired');
      return;
    }
    setPromo({ code: data.code, discount_percent: data.discount_percent });
    setPromoError('');
  };

  const removePromo = () => {
    setPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) setError(null);
  };

  const requiredMsg = lang === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
  const phoneMsg = lang === 'ar' ? 'الرجاء إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = requiredMsg;
    if (!form.phone.trim()) errs.phone = requiredMsg;
    else {
      const phoneDigits = form.phone.replace(/[^0-9]/g, '');
      if (phoneDigits.length !== 8 || !/^[79]/.test(phoneDigits)) errs.phone = phoneMsg;
    }
    if (!form.city) errs.city = requiredMsg;
    if (!form.address.trim()) errs.address = requiredMsg;

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError(null);

    const shippingCost = getShippingCost(totalPrice);
    const discountAmount = promo
      ? parseFloat((totalPrice * promo.discount_percent / 100).toFixed(3))
      : 0;
    const orderTotal = parseFloat((totalPrice + shippingCost - discountAmount).toFixed(3));
    const notesWithPromo = promo
      ? `${form.notes}${form.notes ? '\n' : ''}[Promo ${promo.code} -${promo.discount_percent}%]`
      : form.notes;

    const { data, error: insertError } = await supabase.rpc('create_order', {
      p_full_name: form.fullName,
      p_phone: form.phone,
      p_address: form.address,
      p_city: form.city,
      p_notes: notesWithPromo,
      p_items: items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        size: i.selectedSize,
        color: i.selectedColor ?? null,
        quantity: i.quantity,
        price: i.product.price,
      })),
      p_total: orderTotal,
      p_subtotal: totalPrice,
      p_shipping_cost: shippingCost,
    });

    setSubmitting(false);
    const row = data?.[0];

    if (insertError || !row) {
      setError(lang === 'ar' ? 'حدث خطأ، حاولي مجدداً' : 'Something went wrong, please try again');
      return;
    }

    // Notifie la boutique par email (best-effort : ne bloque pas la commande)
    fetch('/api/send-cod-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          id: row.id,
          created_at: row.created_at ?? new Date().toISOString(),
          total: orderTotal,
          shipping_cost: shippingCost,
          delivery_method: 'standard',
          shipping_address_snapshot: {
            full_name: form.fullName,
            address_line_1: form.address,
            city: form.city,
            postal_code: '',
            phone: form.phone,
          },
        },
        items: items.map((i) => ({
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.product.price,
          line_total: (i.product.price ?? 0) * i.quantity,
          selected_size: i.selectedSize,
        })),
      }),
    }).catch(() => {});

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
        <h1 className="font-serif italic text-3xl sm:text-4xl text-ink mb-10">{lang === 'ar' ? 'إتمام الطلب' : 'Checkout'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-cream-deep rounded-2xl p-5 sm:p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">{lang === 'ar' ? 'معلومات التواصل' : 'Contact information'}</h2>

            <div>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'} className={`${inputClass} ${fieldErrors.fullName ? 'border-red-400' : ''}`} />
              {fieldErrors.fullName && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>}
            </div>
            <div>
              <input name="phone" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={8} autoComplete="tel" value={form.phone} onChange={handleChange} placeholder={lang === 'ar' ? 'رقم الواتساب' : 'WhatsApp number'} className={`${inputClass} ${fieldErrors.phone ? 'border-red-400' : ''}`} />
              {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
            </div>
            <div>
              <select name="city" value={form.city} onChange={handleChange} className={`${inputClass} ${fieldErrors.city ? 'border-red-400' : ''} ${!form.city ? 'text-ink-soft/50' : ''}`}>
                <option value="">{lang === 'ar' ? 'اختاري المدينة' : 'Choose city'}</option>
                {OMANI_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {fieldErrors.city && <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>}
            </div>
            <div>
              <input name="address" value={form.address} onChange={handleChange} placeholder={lang === 'ar' ? 'العنوان بالتفصيل' : 'Detailed address'} className={`${inputClass} ${fieldErrors.address ? 'border-red-400' : ''}`} />
              {fieldErrors.address && <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>}
            </div>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder={lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'} rows={3} className={inputClass} />

            <div className="border border-ink/15 rounded-xl px-4 py-3 text-ink">
              {lang === 'ar' ? 'طريقة الدفع' : 'Payment method'}: <span className="text-silver-deep font-medium">{lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on delivery'}</span>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-full bg-ink hover:bg-ink/90 text-cream py-4 text-[13px] font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? (lang === 'ar' ? 'جارٍ التأكيد...' : 'Placing order...') : (lang === 'ar' ? 'تأكيد الطلب' : 'Place order')}
            </button>

            {/* Réassurance COD — rassure au moment du paiement (pic d'anxiété) */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-[11px] text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-silver-deep shrink-0" strokeWidth={1.75} />
                {t('productPaiementLivraison')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-silver-deep shrink-0" strokeWidth={1.75} />
                {t('productLivraisonDesc')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-silver-deep shrink-0" strokeWidth={1.75} />
                {lang === 'ar' ? 'إرجاع خلال 7 أيام' : '7-day returns'}
              </span>
            </div>
          </form>

          <div className="h-fit space-y-4">
            {/* Promo code */}
            <div className="bg-cream-deep rounded-2xl px-5 py-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
                <Tag className="w-4 h-4 text-ink-soft/60" />
                {lang === 'ar' ? 'رمز الخصم' : 'Promo code'}
              </label>
              {promo ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-emerald-700">
                    <span className="font-mono font-semibold">{promo.code}</span>
                    {' '}(-{promo.discount_percent}%)
                  </span>
                  <button type="button" onClick={removePromo} className="text-emerald-700 hover:text-emerald-900" aria-label="remove">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); if (promoError) setPromoError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }}
                    placeholder={lang === 'ar' ? 'أدخلي الرمز' : 'Enter code'}
                    className="flex-1 bg-cream border border-ink/15 rounded-xl px-3 py-2.5 text-sm text-ink uppercase font-mono placeholder-ink-soft/40 placeholder:normal-case placeholder:font-sans focus:border-ink outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2.5 bg-ink text-cream text-sm font-semibold rounded-xl hover:bg-ink/90 disabled:opacity-50 transition-colors"
                  >
                    {promoLoading ? '…' : (lang === 'ar' ? 'تطبيق' : 'Apply')}
                  </button>
                </div>
              )}
              {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
            </div>

            <OrderSummary promoDiscount={promo} />
          </div>
        </div>
      </div>
    </div>
  );
}
