import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Gem, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { supabase } from '../lib/supabase';
import { getLoyaltyConfig } from '../utils/loyalty';

// Indicatif figé : Oman uniquement. La validation /^[79]\d{7}$/ ne couvre que +968.
const OMAN_CODE = '+968';

export default function RegisterLoyalty() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const isAr = lang === 'ar';

  useSEO({
    title: buildTitle(t('loyaltyRegisterTitle')),
    description: t('loyaltyRegisterSubtitle'),
    canonical: 'https://chello-nine.vercel.app/fidelite',
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    getLoyaltyConfig().then(setConfig);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError(t('loyaltyErrorRequired'));
      return;
    }

    // Validate Omani phone: strip spaces/dashes, must be exactly 8 digits starting with 7 or 9
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^[79]\d{7}$/.test(cleanPhone)) {
      setError(t('loyaltyPhoneInvalid'));
      return;
    }

    setSubmitting(true);
    setError(null);

    // whatsapp stocké = +968 + 8 chiffres
    const whatsapp = `${OMAN_CODE}${cleanPhone}`;

    // L'insert direct dans loyalty_members est bloqué par les RLS en prod :
    // on passe par la RPC security-definer qui insère, applique le bonus
    // d'inscription et retourne { member_id, card_number, points }.
    const { data, error: rpcError } = await supabase.rpc('register_loyalty_member', {
      p_full_name: fullName.trim(),
      p_phone: cleanPhone,
      p_whatsapp: whatsapp,
    });

    setSubmitting(false);

    const row = Array.isArray(data) ? data[0] : data;
    if (rpcError || !row?.card_number) {
      setError(t('loyaltyErrorRetry') || (isAr ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.'));
      return;
    }

    navigate(`/fidelite/carte/${row.card_number}`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Gem className="mx-auto text-silver-deep mb-4" size={28} strokeWidth={1.5} />
          <h1 className="font-serif italic text-3xl text-ink mb-2">{t('loyaltyRegisterTitle')}</h1>
          <p className="text-ink-soft">{t('loyaltyRegisterSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-cream-deep border border-ink/10 rounded-2xl p-6 sm:p-8">
          <div>
            <label className="block text-sm text-ink-soft mb-2">{t('loyaltyFullNameLabel')}</label>
            <div className="relative">
              <User size={18} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-soft/50" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('loyaltyFullNamePlaceholder')}
                className="w-full bg-cream border border-ink/10 rounded-xl py-3 ps-10 pe-4 text-ink placeholder-ink-soft/40 focus:border-ink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-soft mb-2">{t('loyaltyWhatsappLabel')}</label>
            <div className="flex gap-2">
              <div
                className="flex items-center px-3 bg-cream border border-ink/10 rounded-xl text-ink font-medium select-none"
                dir="ltr"
                aria-label={isAr ? 'سلطنة عُمان' : 'Oman'}
                title={isAr ? 'سلطنة عُمان' : 'Oman'}
              >
                🇴🇲 {OMAN_CODE}
              </div>
              <div className="relative flex-1">
                <Phone size={18} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-soft/50" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                  maxLength={8}
                  dir="ltr"
                  placeholder={t('loyaltyWhatsappPlaceholder')}
                  className="w-full bg-cream border border-ink/10 rounded-xl py-3 ps-10 pe-4 text-ink placeholder-ink-soft/40 focus:border-ink outline-none text-start"
                />
              </div>
            </div>
          </div>

          {config?.signup_bonus > 0 && (
            <div className="flex items-center gap-2 bg-silver/5 border border-silver/20 rounded-xl px-4 py-3">
              <Star size={16} className="text-silver flex-shrink-0" />
              <p className="text-sm text-ink-soft">
                {t('loyaltySignupBonus').replace('{points}', config.signup_bonus)}
              </p>
            </div>
          )}

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

        <p className="text-center text-sm text-ink-soft mt-6">
          {t('loyaltyAlreadyMember')}{' '}
          <Link to="/fidelite/retrouver" className="font-semibold text-ink underline underline-offset-2 hover:text-silver-deep transition-colors">{t('loyaltyFindCard')}</Link>
        </p>
      </div>
    </div>
  );
}
