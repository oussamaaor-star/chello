import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SHOP_CONFIG } from '../utils/config';

const isUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function OrderConfirmation() {
  const { t, lang } = useLanguage();
  useSEO({
    title: buildTitle(lang === 'ar' ? 'تم استلام طلبك' : 'Order received'),
    robots: 'noindex,nofollow',
  });

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !isUUID(orderId)) { setLoading(false); return; }
    supabase.rpc('get_order_confirmation', { p_order_id: orderId }).then(({ data }) => {
      setOrder(data?.[0] ?? null);
      setLoading(false);
    });
  }, [orderId]);

  const shortRef = (order?.id ?? orderId ?? '').replace(/-/g, '').slice(0, 8).toUpperCase() || '—';
  const displayTotal = order ? Number(order.total).toFixed(3) : '—';
  const dateLocale = lang === 'ar' ? 'ar-OM' : 'en-US';
  const orderDate = order
    ? new Date(order.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <div className="py-12 sm:py-20 bg-cream-deep">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ink mb-6">
            <CheckCircle className="w-9 h-9 text-silver-light" strokeWidth={1.5} />
          </div>
          <p className="text-silver-deep text-xs font-bold uppercase tracking-widest mb-3">
            {lang === 'ar' ? 'تم بنجاح' : 'Success'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-ink mb-4 leading-tight">
            {lang === 'ar' ? 'تم استلام طلبك' : 'Order received'}
          </h1>
          <p className="text-ink-soft text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            {lang === 'ar'
              ? 'شكراً لطلبك من Chello. سيتم التواصل معك عبر واتساب لتأكيد التفاصيل.'
              : 'Thank you for your order from Chello. We will contact you on WhatsApp to confirm the details.'}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-ink-soft/60 animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-cream-deep rounded-2xl p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft/60 mb-2">
                {lang === 'ar' ? 'رقم الطلب' : 'Order number'}
              </p>
              <p className="text-2xl font-semibold text-ink font-mono tracking-widest mb-1">#{shortRef}</p>
              <p className="text-sm text-ink-soft">
                {orderDate} — {lang === 'ar' ? 'الإجمالي' : 'Total'}:{' '}
                <span className="font-semibold text-ink">{displayTotal} {SHOP_CONFIG.currency}</span>
              </p>
            </div>

            {order?.items?.length > 0 && (
              <div className="bg-cream-deep rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-ink-soft/60 mb-4">
                  {lang === 'ar' ? 'تفاصيل الطلب' : 'Order details'}
                </h2>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-ink-soft/60 font-semibold flex-shrink-0">{item.quantity}×</span>
                        <span className="text-ink truncate font-medium">{item.name}</span>
                        {item.size && <span className="text-ink-soft flex-shrink-0">— {item.size}</span>}
                      </div>
                      {item.price != null && (
                        <span className="font-semibold text-ink flex-shrink-0 ms-3">
                          {(item.price * item.quantity).toFixed(3)} {SHOP_CONFIG.currency}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a
              href={`${SHOP_CONFIG.wa_url}?text=${encodeURIComponent(
                lang === 'ar'
                  ? `مرحباً، طلبي رقم #${shortRef} بإجمالي ${displayTotal} ${SHOP_CONFIG.currency}`
                  : `Hi, my order #${shortRef} totals ${displayTotal} ${SHOP_CONFIG.currency}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-[#25D366]/8 border border-[#25D366]/25 rounded-2xl hover:bg-[#25D366]/14 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1a8f4f] mb-0.5">{lang === 'ar' ? 'تواصل واتساب' : 'Contact on WhatsApp'}</p>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {lang === 'ar' ? 'لتأكيد طلبك أو الاستفسار' : 'To confirm your order or ask questions'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-soft/40 group-hover:text-[#25D366] transition-colors flex-shrink-0 rtl:rotate-180" />
            </a>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-ink text-cream rounded-full text-sm font-semibold uppercase tracking-wide hover:bg-ink/90 transition-all active:scale-[0.98]">
            <Package className="w-4 h-4" />{lang === 'ar' ? 'الرجوع للرئيسية' : 'Back to home'}
          </Link>
          <Link to="/catalogue" className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 border border-ink/15 text-ink rounded-full text-sm font-medium uppercase tracking-wide hover:border-ink transition-colors">
            <ShoppingBag className="w-4 h-4" />{t('cartContinuer')}<ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
