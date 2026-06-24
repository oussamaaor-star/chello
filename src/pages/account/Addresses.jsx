import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, X, Home, Briefcase, Check, Trash2, Edit2, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

// ─── Villes Oman ─────────────────────────────────────────────────
const ALL_CITIES = ['مسقط', 'السيب', 'صلالة', 'صحار', 'نزوى', 'صور', 'عبري', 'بركاء', 'الرستاق', 'بهلاء', 'الخابورة', 'خصب', 'البريمي', 'الدقم', 'مطرح'];

// ─── CityPicker ───────────────────────────────────────────────────
function CityPicker({ value, onChange, error }) {
  const { t }                         = useLanguage();
  const [open, setOpen]               = useState(false);
  const [input, setInput]             = useState(value ?? '');
  const [highlighted, setHighlighted] = useState(-1);
  const ref                           = useRef(null);
  const listRef                       = useRef(null);

  useEffect(() => { setInput(value ?? ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = input.trim()
    ? ALL_CITIES.filter((c) => c.toLowerCase().includes(input.trim().toLowerCase()))
    : ALL_CITIES;

  const handleSelect = (city) => { setInput(city); setOpen(false); setHighlighted(-1); onChange(city); };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === 'ArrowDown') { setOpen(true); setHighlighted(0); } return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => { const next = Math.min(i + 1, filtered.length - 1); listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' }); return next; });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => { const prev = Math.max(i - 1, 0); listRef.current?.children[prev]?.scrollIntoView({ block: 'nearest' }); return prev; });
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={ref}>
      <label className="block text-sm font-medium text-ink mb-1.5">{t('addressVille')}</label>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); setHighlighted(-1); onChange(e.target.value); }}
          onFocus={() => { setOpen(true); setHighlighted(-1); }}
          onKeyDown={handleKeyDown}
          placeholder="مسقط"
          autoComplete="off"
          className={`w-full pl-10 pr-9 py-3 rounded-xl border text-sm text-ink placeholder-ink-soft/50 focus:outline-none focus:ring-2 transition-all ${
            error ? 'border-red-500 bg-red-50 focus:ring-red-500/30' : 'border-ink/10 bg-cream focus:ring-gold/30 hover:border-ink/20'
          }`}
        />
        <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} />
        {open && filtered.length > 0 && (
          <ul ref={listRef} className="absolute z-50 mt-1 w-full bg-cream border border-ink/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {filtered.map((city, idx) => (
              <li
                key={city}
                onMouseDown={() => handleSelect(city)}
                onMouseEnter={() => setHighlighted(idx)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  city === value
                    ? 'bg-ink text-cream font-semibold'
                    : idx === highlighted
                    ? 'bg-cream-deep text-ink'
                    : 'text-ink hover:bg-cream-deep'
                }`}
              >
                <span>{city}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function dbToForm(addr) {
  const parts     = (addr.full_name || '').trim().split(' ');
  const firstName = parts[0] || '';
  const lastName  = parts.slice(1).join(' ');
  return {
    id:         addr.id,
    type:       addr.type            || 'home',
    label:      addr.label           || '',
    firstName,
    lastName,
    address:    addr.address_line_1  || '',
    city:       addr.city            || '',
    postalCode: addr.postal_code     || '',
    country:    'عُمان',
    phone:      addr.phone           || '',
  };
}

function formToDB(form, userId) {
  return {
    user_id:        userId,
    type:           form.type,
    label:          form.label || null,
    full_name:      `${form.firstName} ${form.lastName}`.trim(),
    address_line_1: form.address,
    city:           form.city,
    postal_code:    form.postalCode,
    country:        'عُمان',
    phone:          form.phone || null,
    is_default:     false,
  };
}

// ─── AddressModal ─────────────────────────────────────────────────
const EMPTY_FORM = {
  type: 'home', label: '', firstName: '', lastName: '',
  address: '', city: '', postalCode: '', country: 'عُمان', phone: '',
};

function FormField({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <input className={`w-full px-4 py-3 rounded-xl border text-sm text-ink placeholder-ink-soft/50 focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 bg-red-50 focus:ring-red-500/30' : 'border-ink/10 bg-cream focus:ring-gold/30 hover:border-ink/20'}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function AddressModal({ initial, onSave, onClose }) {
  const { t }                 = useLanguage();
  const [form,    setForm]    = useState(initial ?? EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: val }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleCityChange = (city) => {
    setForm((prev) => ({
      ...prev,
      city,
    }));
    if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = t('addressRequis');
    if (!form.lastName.trim())  next.lastName  = t('addressRequis');
    if (!form.address.trim())   next.address   = t('addressRequis');
    if (!form.city.trim())      next.city      = t('addressRequis');
    if (!form.postalCode.trim()) next.postalCode = t('addressRequis');
    else if (!/^\d{3,6}$/.test(form.postalCode)) next.postalCode = t('addressCodeFormat');
    if (form.phone && !/^\d{8,10}$/.test(form.phone))
      next.phone = t('addressPhoneFormat');
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setSaving(true);
    setSaveErr('');
    const err = await onSave(form);
    setSaving(false);
    if (err) setSaveErr(err);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-cream rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
          <h3 className="text-lg font-serif italic text-ink">
            {initial ? t('addressModifierTitre') : t('addressAjouterTitre')}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-deep transition-colors" aria-label={t('addressFermer')}>
            <X className="w-4 h-4 text-ink-soft" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Type */}
          <div>
            <p className="text-sm font-medium text-ink mb-2">{t('addressTypeLabel')}</p>
            <div className="flex gap-2">
              {[{ value: 'home', label: t('addressDomicile'), icon: Home }, { value: 'work', label: t('addressBureau'), icon: Briefcase }].map(({ value, label, icon: Icon }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: value }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.type === value
                      ? 'bg-ink border-ink text-cream'
                      : 'border-ink/10 text-ink-soft hover:border-ink/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          <FormField label={t('addressLibelle')} name="label" placeholder={t('addressLibellePh')} value={form.label} onChange={set('label')} />

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('addressPrenom')} name="firstName" placeholder="محمد" value={form.firstName} onChange={set('firstName')} error={errors.firstName} autoComplete="given-name" />
            <FormField label={t('addressNom')} name="lastName" placeholder="البلوشي" value={form.lastName} onChange={set('lastName')} error={errors.lastName} autoComplete="family-name" />
          </div>

          <FormField label={t('addressAdresse')} name="address" placeholder="شارع السلطان قابوس" value={form.address} onChange={set('address')} error={errors.address} autoComplete="street-address" />

          <div className="grid grid-cols-2 gap-3">
            <CityPicker value={form.city} onChange={handleCityChange} error={errors.city} />
            <FormField label={t('addressCodePostal')} name="postalCode" placeholder="100" value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} maxLength={6} autoComplete="postal-code" />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{t('addressTelOpt')}</label>
            <input
              type="tel"
              placeholder="9XXXXXXX"
              value={form.phone}
              onChange={handlePhoneChange}
              maxLength={10}
              autoComplete="tel"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-ink placeholder-ink-soft/50 focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 bg-red-50 focus:ring-red-500/30' : 'border-ink/10 bg-cream focus:ring-gold/30 hover:border-ink/20'}`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {saveErr && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{saveErr}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-3 border border-ink/20 rounded-full text-sm font-medium text-ink hover:bg-cream-deep transition-colors disabled:opacity-50">{t('addressAnnuler')}</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold transition-colors active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />{t('addressEnregistrement')}</>
                : <><Check className="w-4 h-4" />{initial ? t('addressMettreAJour') : t('addressAjouterBtn')}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── AddressCard ──────────────────────────────────────────────────
function AddressCard({ address, onEdit, onDelete }) {
  const { t } = useLanguage();
  const Icon = address.type === 'work' ? Briefcase : Home;
  return (
    <div className="bg-cream-deep rounded-2xl border border-ink/10 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cream border border-ink/10 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-sm font-semibold text-ink">
            {address.label || (address.type === 'work' ? t('addressBureau') : t('addressDomicile'))}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(address)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream text-ink-soft hover:text-ink transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(address.id)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-ink-soft hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="text-sm text-ink-soft space-y-0.5">
        <p className="text-ink font-medium">{address.firstName} {address.lastName}</p>
        <p>{address.address}</p>
        <p>{address.postalCode} {address.city}</p>
        {address.phone && <p className="text-ink-soft">{address.phone}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function Addresses() {
  const { t }                     = useLanguage();
  const { user }                  = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadAddresses();
  }, [user?.id]);

  const loadAddresses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('addresses')
      .select('id, type, label, full_name, address_line_1, address_line_2, city, postal_code, country, phone, is_default, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) setAddresses(data.map(dbToForm));
    setLoading(false);
  };

  const openAdd    = ()        => { setEditing(null);    setModalOpen(true); };
  const openEdit   = (address) => { setEditing(address); setModalOpen(true); };
  const closeModal = ()        => { setModalOpen(false); setEditing(null);   };

  const handleSave = async (form) => {
    const dbData = formToDB(form, user.id);
    if (editing) {
      const { data, error } = await supabase
        .from('addresses').update(dbData).eq('id', editing.id).select().single();
      if (error) return t('adressesErrGeneral');
      setAddresses((prev) => prev.map((a) => a.id === editing.id ? dbToForm(data) : a));
    } else {
      const { data, error } = await supabase
        .from('addresses').insert(dbData).select().single();
      if (error) return t('adressesErrGeneral');
      setAddresses((prev) => [...prev, dbToForm(data)]);
    }
    closeModal();
    return null;
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('addressSupprimerConfirm'))) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (!error) setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-serif italic text-ink">{t('addressesTitle')}</h2>
            <p className="text-sm text-ink-soft mt-1">{t('addressesDesc')}</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold transition-all active:scale-[0.98]">
            <Plus className="w-4 h-4" />{t('addressesAjouter')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-cream-deep rounded-2xl border border-ink/10 p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-cream flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-9 h-9 text-ink-soft" />
            </div>
            <h3 className="text-lg font-serif italic text-ink mb-2">{t('addressesVide')}</h3>
            <p className="text-sm text-ink-soft max-w-xs mx-auto mb-7 leading-relaxed">
              {t('addressesVideDesc')}
            </p>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold transition-all active:scale-[0.98]">
              <Plus className="w-4 h-4" />{t('addressesAjouter')}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} onEdit={openEdit} onDelete={handleDelete} />
            ))}
            <button onClick={openAdd} className="bg-cream-deep rounded-2xl border-2 border-dashed border-ink/15 p-5 flex flex-col items-center justify-center gap-2 text-ink-soft hover:border-gold/50 hover:text-ink transition-colors min-h-[160px]">
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">{t('addressNouvelleAdr')}</span>
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <AddressModal initial={editing} onSave={handleSave} onClose={closeModal} />
      )}
    </>
  );
}
