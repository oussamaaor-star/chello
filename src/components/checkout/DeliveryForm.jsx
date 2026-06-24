import { useState, useRef, useEffect, useId } from 'react';
import { ArrowRight, Truck, ChevronDown, MapPin, Package, Home, Briefcase } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Villes Oman ─────────────────────────────────────────────────────────────

const CITY_POSTAL = {
  'مسقط': '100', 'السيب': '121', 'صلالة': '211', 'صحار': '311',
  'نزوى': '611', 'صور': '411', 'عبري': '511', 'بركاء': '320',
  'الرستاق': '329', 'بهلاء': '612', 'الخابورة': '326', 'خصب': '811',
  'البريمي': '512', 'الدقم': '418', 'مطرح': '114', 'سمائل': '621',
  'إزكي': '613', 'بدبد': '622', 'المصنعة': '323', 'شناص': '324',
};

const ALL_CITIES = Object.keys(CITY_POSTAL);

// ─── City picker ─────────────────────────────────────────────────────────────

function CityPicker({ value, onChange, error }) {
  const [open, setOpen]             = useState(false);
  const [input, setInput]           = useState(value ?? '');
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef                = useRef(null);
  const listRef                     = useRef(null);
  const { t } = useLanguage();

  useEffect(() => { setInput(value ?? ''); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = input.trim()
    ? ALL_CITIES.filter((c) => c.toLowerCase().includes(input.trim().toLowerCase()))
    : ALL_CITIES;

  const handleInput = (e) => {
    setInput(e.target.value);
    setOpen(true);
    setHighlighted(-1);
    onChange(e.target.value);
  };

  const handleSelect = (city) => {
    setInput(city);
    setOpen(false);
    setHighlighted(-1);
    onChange(city);
  };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === 'ArrowDown') { setOpen(true); setHighlighted(0); } return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => {
        const next = Math.min(i + 1, filtered.length - 1);
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => {
        const prev = Math.max(i - 1, 0);
        listRef.current?.children[prev]?.scrollIntoView({ block: 'nearest' });
        return prev;
      });
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="col-span-1" ref={containerRef}>
      <label className="block text-xs font-semibold text-ink-soft mb-1.5 uppercase tracking-wider">
        {t('deliveryVille')}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
        <input
          type="text"
          value={input}
          onChange={handleInput}
          onFocus={() => { setOpen(true); setHighlighted(-1); }}
          onKeyDown={handleKeyDown}
          placeholder={t('deliveryVillePlaceholder')}
          autoComplete="off"
          aria-invalid={!!error}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-[16px] text-ink placeholder-ink-soft
            focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all
            ${error
              ? 'border-red-500/50 bg-red-500/10 focus:ring-red-400/40 focus:border-red-400'
              : 'border-ink/10 bg-cream-deep focus:ring-gold/30 focus:border-gold hover:border-ink/20'
            }`}
        />
        <ChevronDown
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        {open && filtered.length > 0 && (
          <ul ref={listRef} className="absolute z-50 mt-1.5 w-full bg-cream border border-ink/10 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
            {filtered.map((city, idx) => (
              <li
                key={city}
                onMouseDown={() => handleSelect(city)}
                onMouseEnter={() => setHighlighted(idx)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                  ${city === value
                    ? 'bg-ink text-cream font-semibold'
                    : idx === highlighted
                    ? 'bg-cream-deep text-ink'
                    : 'text-ink-soft hover:bg-cream-deep'
                  }`}
              >
                <span>{city}</span>
                <span className={`text-xs tabular-nums ${city === value ? 'text-cream/70' : 'text-ink-soft'}`}>
                  {CITY_POSTAL[city]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Shared field component ──────────────────────────────────────────────────

function Field({ label, error, half, id: propId, ...props }) {
  const generatedId = useId();
  const inputId = propId || generatedId;
  return (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label htmlFor={inputId} className="block text-xs font-semibold text-ink-soft mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        className={`w-full px-4 py-3 rounded-xl border text-[16px] text-ink placeholder-ink-soft
          focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all
          ${error
            ? 'border-red-500/50 bg-red-500/10 focus:ring-red-400/40 focus:border-red-400'
            : 'border-ink/10 bg-cream-deep focus:ring-gold/30 focus:border-gold hover:border-ink/20'
          }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Shipping option ──────────────────────────────────────────────────────────

function ShippingOption({ id, icon: Icon, title, subtitle, price, selected, onChange }) {
  return (
    <label
      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected
          ? 'border-gold bg-gold/10'
          : 'border-ink/10 bg-cream-deep hover:border-ink/20'
      }`}
    >
      <input
        type="radio"
        name="shippingMethod"
        value={id}
        checked={selected}
        onChange={() => onChange(id)}
        className="sr-only"
      />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-ink' : 'bg-ink/10'}`}>
        <Icon className={`w-5 h-5 ${selected ? 'text-cream' : 'text-ink-soft'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${selected ? 'text-gold' : 'text-ink'}`}>{title}</p>
        <p className="text-xs text-ink-soft mt-0.5">{subtitle}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${selected ? 'text-gold' : 'text-ink'}`}>
        {price}
      </span>
    </label>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', city: '', postalCode: '', country: 'عُمان',
  shippingMethod: 'standard',
};

export function DeliveryForm({ initial, subtotal, onNext, onShippingChange, savedAddresses }) {
  const [form, setForm]     = useState(initial ?? EMPTY);
  const [errors, setErrors] = useState({});
  const formRef             = useRef(null);
  const { t } = useLanguage();

  const applyAddress = (addr) => {
    const parts     = (addr.full_name || '').trim().split(' ');
    const firstName = parts[0] || '';
    const lastName  = parts.slice(1).join(' ');
    setForm((prev) => ({
      ...prev,
      firstName,
      lastName,
      phone:      addr.phone        || prev.phone,
      address:    addr.address_line_1 || '',
      city:       addr.city         || '',
      postalCode: addr.postal_code  || '',
    }));
    setErrors({});
  };

  const isFreeStandard = subtotal >= 10;

  const SHIPPING_OPTIONS = [
    {
      id: 'standard',
      icon: Truck,
      title: t('deliveryLivraisonStd'),
      subtitle: t('deliveryDelai'),
      price: isFreeStandard ? t('deliveryGratuite') : '1.000 ر.ع.',
    },
  ];

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'city' && CITY_POSTAL[value]) {
        next.postalCode = CITY_POSTAL[value];
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
    setForm((prev) => ({ ...prev, phone: val }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleCityChange = (city) => {
    setForm((prev) => ({
      ...prev,
      city,
      postalCode: CITY_POSTAL[city] ?? prev.postalCode,
    }));
    if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = t('deliveryReqis');
    if (!form.lastName.trim())  next.lastName  = t('deliveryReqis');
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('deliveryEmailFmt');
    if (!form.phone.trim()) next.phone = t('deliveryReqis');
    else if (!/^[79]\d{7}$/.test(form.phone.trim())) {
      next.phone = t('deliveryPhoneFmt');
    }
    if (!form.address.trim())   next.address   = t('deliveryReqis');
    if (!form.city.trim())      next.city      = t('deliveryReqis');
    if (!form.postalCode.trim()) next.postalCode = t('deliveryReqis');
    else if (!/^\d{4,6}$/.test(form.postalCode.trim())) next.postalCode = t('deliveryPostalFmt');
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Amène le premier champ en erreur dans la vue + focus (UX + accessibilité).
      requestAnimationFrame(() => {
        const el = formRef.current?.querySelector('[aria-invalid="true"]');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus({ preventScroll: true });
        }
      });
      return;
    }
    onNext(form);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* Saved addresses suggestion */}
      {savedAddresses?.length > 0 && (
        <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-gold mb-3">
            {t('deliveryAdresseEnreg')}
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-none">
            {savedAddresses.map((addr) => {
              const parts     = (addr.full_name || '').trim().split(' ');
              const firstName = parts[0] || '';
              const lastName  = parts.slice(1).join(' ');
              const Icon      = addr.type === 'work' ? Briefcase : Home;
              const label     = addr.label || (addr.type === 'work' ? t('deliveryBureau') : t('deliveryDomicile'));
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => applyAddress(addr)}
                  className="flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 bg-cream-deep border border-ink/10 rounded-xl hover:border-gold hover:shadow-sm transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-gold/15 group-hover:bg-gold/25 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-ink leading-tight whitespace-nowrap">{firstName} {lastName}</p>
                    <p className="text-xs text-ink-soft leading-tight whitespace-nowrap">{label} · {addr.city}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal info */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          {t('deliveryInfosPerso')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('deliveryPrenom')} value={form.firstName} onChange={set('firstName')} error={errors.firstName} placeholder="فاطمة" half autoComplete="given-name" />
          <Field label={t('deliveryNomFamille')} value={form.lastName} onChange={set('lastName')} error={errors.lastName} placeholder="الحارثي" half autoComplete="family-name" />
          <Field label={t('deliveryEmail')} type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="fatima@example.om" autoComplete="email" />
          <Field label={t('deliveryTel')} type="tel" value={form.phone} onChange={handlePhoneChange} error={errors.phone} placeholder="9XXXXXXX" autoComplete="tel" maxLength={8} />
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          {t('deliveryAdresseLivraison')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('deliveryAdresse')} value={form.address} onChange={set('address')} error={errors.address} placeholder="شارع السلطان قابوس، فيلا 12" autoComplete="street-address" />
          <CityPicker value={form.city} onChange={handleCityChange} error={errors.city} />
          <Field label={t('deliveryCodePostal')} value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} placeholder="100" maxLength={6} half autoComplete="postal-code" />
        </div>
      </div>

      {/* Shipping method */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          {t('deliveryModeLivraison')}
        </h3>
        <div className="space-y-2.5">
          {SHIPPING_OPTIONS.map((opt) => (
            <ShippingOption
              key={opt.id}
              {...opt}
              selected={form.shippingMethod === opt.id}
              onChange={(id) => {
                setForm((prev) => ({ ...prev, shippingMethod: id }));
                onShippingChange?.(id);
              }}
            />
          ))}
        </div>
      </div>

      {/* COD notice */}
      <div className="flex items-start gap-3 p-4 bg-gold/10 border border-gold/25 rounded-xl">
        <Package className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gold">{t('deliveryCODTitle')}</p>
          <p className="text-xs text-gold-light/80 mt-0.5">{t('deliveryCODDesc')}</p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-all active:scale-[0.98]"
      >
        {t('confirmOrder')}
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
