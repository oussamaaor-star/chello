import { useState } from 'react';
import { Search, Truck, CheckCircle, Clock, AlertCircle, Phone, Hash, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../contexts/LanguageContext';
import { SHOP_CONFIG } from '../utils/config';

function shortRef(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export default function OrderTracking() {
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const { lang } = useLanguage();

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-US', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  // Les 5 étapes de progression d'une commande (cancelled est géré à part).
  // Doit rester aligné sur orders.status : pending → confirmed → processing → shipped → delivered.
  const STATUS_STEPS = [
    { key: 'pending',    label: lang === 'ar' ? 'قيد الانتظار' : 'Pending',     icon: Clock,       color: 'bg-ink-soft/40' },
    { key: 'confirmed',  label: lang === 'ar' ? 'مؤكد' : 'Confirmed',           icon: CheckCircle, color: 'bg-silver' },
    { key: 'processing', label: lang === 'ar' ? 'قيد التجهيز' : 'Processing',   icon: Package,     color: 'bg-silver' },
    { key: 'shipped',    label: lang === 'ar' ? 'تم الشحن' : 'Shipped',         icon: Truck,       color: 'bg-indigo-500' },
    { key: 'delivered',  label: lang === 'ar' ? 'تم التوصيل' : 'Delivered',     icon: CheckCircle, color: 'bg-emerald-600' },
  ];

  useSEO({
    title: lang === 'ar' ? 'تتبع طلبي | Chello' : 'Track my order | Chello',
    robots: 'noindex,nofollow',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !reference.trim()) {
      setError('fields');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    const { data, error: sbError } = await supabase.rpc('find_order_by_phone_ref', {
      p_phone: phone.trim().replace(/[^0-9]/g, ''),
      p_ref: reference.trim().toUpperCase(),
    });

    setLoading(false);
    const found = data?.[0];

    if (sbError || !found) {
      setError('notFound');
      return;
    }
    setOrder(found);
  };

  const renderTimeline = (currentStatus) => {
    // Statut « annulé » : affiché distinctement, hors timeline de progression.
    if (currentStatus === 'cancelled') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-red-600 mb-1">{lang === 'ar' ? 'تم إلغاء الطلب' : 'Order cancelled'}</h3>
          <p className="text-sm text-red-600/80">
            {lang === 'ar' ? 'لمزيد من المعلومات تواصل معنا عبر واتساب' : 'Contact us on WhatsApp for more information'}
          </p>
        </div>
      );
    }

    // Pour un statut valide, findIndex retourne toujours un index ≥ 0 (les 5 clés sont couvertes).
    // Le fallback à 0 ne sert que pour un statut inattendu/legacy.
    const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
    const activeStepIdx = currentIndex >= 0 ? currentIndex : 0;

    return (
      <div className="flex flex-col">
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx < activeStepIdx;
          const isCurrent = idx === activeStepIdx;
          const isFuture = idx > activeStepIdx;
          const isLast = idx === STATUS_STEPS.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`relative w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-500 ${
                  isCurrent ? `${step.color} ring-4 ring-silver/25` : isDone ? step.color : 'bg-cream-deep'
                }`}>
                  {isCurrent && <span className={`absolute inset-0 rounded-full animate-ping opacity-25 ${step.color}`} />}
                  <Icon className={`w-4 h-4 relative z-10 ${isFuture ? 'text-ink-soft/40' : 'text-cream'}`} />
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[2.5rem] mt-1 mb-1 rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500/40' : 'bg-cream-deep'}`} />
                )}
              </div>
              <div className={`pb-7 ${isLast ? 'pb-0' : ''} flex-1 min-w-0`}>
                <p className={`font-semibold text-sm leading-snug ${isFuture ? 'text-ink-soft/50' : isCurrent ? 'text-ink' : 'text-ink-soft'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream pt-8 sm:pt-12 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-serif italic text-ink mb-4">{lang === 'ar' ? 'تتبع طلبي' : 'Track my order'}</h1>
        </div>

        {!order ? (
          <div className="bg-cream-deep rounded-3xl p-6 sm:p-10">
            <form onSubmit={handleSearch} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">
                    {error === 'fields'
                      ? (lang === 'ar' ? 'الرجاء تعبئة جميع الحقول' : 'Please fill all fields')
                      : (lang === 'ar' ? 'لم يتم العثور على طلب بهذه المعطيات' : 'No order found with these details')}
                  </p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink-soft/70 mb-2">
                    {lang === 'ar' ? 'رقم الطلب' : 'Order number'}
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/40" />
                    <input
                      type="text"
                      required
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="ex: A1B2C3D4"
                      className="w-full ps-12 pe-4 py-4 bg-cream border border-ink/10 rounded-2xl text-ink placeholder-ink-soft/40 focus:outline-none focus:border-silver transition-all uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink-soft/70 mb-2">
                    {lang === 'ar' ? 'رقم الواتساب' : 'WhatsApp number'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/40" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="96877671234"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="tel"
                      className="w-full ps-12 pe-4 py-4 bg-cream border border-ink/10 rounded-2xl text-ink placeholder-ink-soft/40 focus:outline-none focus:border-silver transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-ink hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed text-cream font-semibold uppercase tracking-wide rounded-2xl transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                ) : (
                  <><Search className="w-5 h-5" />{lang === 'ar' ? 'بحث' : 'Search'}</>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div className="bg-cream-deep rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-silver-deep mb-1">{lang === 'ar' ? 'الطلب' : 'Order'}</p>
                  <h2 className="text-2xl font-serif italic text-ink tracking-wide">#{shortRef(order.id)}</h2>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-ink-soft">{lang === 'ar' ? 'التاريخ' : 'Date'}</p>
                  <p className="text-ink font-medium">{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className="py-6 border-y border-ink/10 mb-8">
                {renderTimeline(order.status)}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-cream rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/60 mb-3">{lang === 'ar' ? 'التوصيل' : 'Delivery'}</p>
                  <p className="text-ink font-medium mb-1">{order.full_name}</p>
                  <p className="text-ink-soft text-sm">{order.city}</p>
                </div>

                <div className="bg-cream rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/60 mb-3">{lang === 'ar' ? 'التفاصيل' : 'Details'}</p>
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-ink-soft"><span className="text-ink-soft/60 me-2">{item.quantity}x</span> {item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-ink/10 flex justify-between items-center">
                    <span className="text-ink-soft">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-lg font-semibold text-ink">{Number(order.total).toFixed(3)} {SHOP_CONFIG.currency}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOrder(null)}
                className="mt-8 text-sm font-semibold text-ink-soft hover:text-ink transition-colors flex items-center gap-2 mx-auto"
              >
                {lang === 'ar' ? 'بحث جديد' : 'New search'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
