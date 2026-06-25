import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Gem } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { supabase } from '../lib/supabase';

function generateCode() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

export default function RegisterLoyalty() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useSEO({
    title: buildTitle('برنامج الولاء'),
    description: 'سجّلي بياناتك وابدئي رحلتك مع برنامج ولاء Chello.',
  });

  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+968');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError(t('loyaltyErrorRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);

    const whatsapp = `${countryCode}${phone.replace(/^0+/, '')}`;

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      const { error: insertError } = await supabase
        .from('loyalty_members')
        .insert({ full_name: fullName.trim(), whatsapp, code, visits_count: 1 });

      if (!insertError) {
        setSubmitting(false);
        navigate(`/fidelite/carte/${code}`);
        return;
      }
      if (insertError.code !== '23505') {
        setSubmitting(false);
        setError(insertError.message);
        return;
      }
    }
    setSubmitting(false);
    setError('Erreur, veuillez réessayer.');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-ink">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Gem className="mx-auto text-silver-light mb-4" size={28} strokeWidth={1.5} />
          <h1 className="font-serif italic text-3xl text-cream mb-2">{t('loyaltyRegisterTitle')}</h1>
          <p className="text-cream/50">{t('loyaltyRegisterSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-cream rounded-2xl p-6 sm:p-8">
          <div>
            <label className="block text-sm text-ink-soft mb-2">{t('loyaltyFullNameLabel')}</label>
            <div className="relative">
              <User size={18} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-soft/50" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('loyaltyFullNamePlaceholder')}
                className="w-full bg-cream-deep border border-ink/10 rounded-xl py-3 ps-10 pe-4 text-ink placeholder-ink-soft/40 focus:border-silver outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-soft mb-2">{t('loyaltyWhatsappLabel')}</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-cream-deep border border-ink/10 rounded-xl px-2 text-ink focus:border-silver outline-none"
              >
                <option value="+968">OM +968</option>
                <option value="+971">AE +971</option>
                <option value="+966">SA +966</option>
                <option value="+965">KW +965</option>
                <option value="+974">QA +974</option>
                <option value="+973">BH +973</option>
              </select>
              <div className="relative flex-1">
                <Phone size={18} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-soft/50" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={t('loyaltyWhatsappPlaceholder')}
                  className="w-full bg-cream-deep border border-ink/10 rounded-xl py-3 ps-10 pe-4 text-ink placeholder-ink-soft/40 focus:border-silver outline-none"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink hover:bg-ink/90 text-cream font-semibold uppercase tracking-wide rounded-full py-3.5 transition-colors disabled:opacity-50"
          >
            {t('loyaltySubmit')}
          </button>

          <p className="text-center text-xs text-ink-soft/60">{t('loyaltySecurityNote')}</p>
        </form>

        <p className="text-center text-sm text-cream/50 mt-6">
          {t('loyaltyAlreadyMember')}{' '}
          <Link to="/fidelite/retrouver" className="text-silver-light hover:underline">{t('loyaltyFindCard')}</Link>
        </p>
      </div>
    </div>
  );
}
