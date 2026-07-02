import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';

export default function FindLoyaltyCard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);

  useSEO({ title: 'استرجاع بطاقة الولاء — Chello', robots: 'noindex,nofollow' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError(null);

    const { data, error: queryError } = await supabase.rpc('find_loyalty_card', {
      p_whatsapp: phone.replace(/[^0-9]/g, ''),
    });

    setSearching(false);
    const row = data?.[0];

    if (queryError || !row) {
      setError(t('loyaltyNotFound'));
      return;
    }
    navigate(`/fidelite/carte/${row.code}`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-md">
        <h1 className="font-serif italic text-2xl text-ink text-center mb-8">{t('loyaltyLookupTitle')}</h1>
        <form onSubmit={handleSubmit} className="space-y-5 bg-cream-deep border border-ink/10 rounded-2xl p-6 sm:p-8">
          <div className="relative">
            <Search size={18} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-soft/50" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('loyaltyWhatsappPlaceholder')}
              className="w-full bg-cream border border-ink/10 rounded-xl py-3 ps-10 pe-4 text-ink placeholder-ink-soft/40 focus:border-ink outline-none"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={searching}
            className="w-full bg-ink hover:bg-ink/90 text-cream font-semibold uppercase tracking-wide rounded-full py-3.5 transition-colors disabled:opacity-50"
          >
            {t('loyaltyLookupCta')}
          </button>
        </form>
      </div>
    </div>
  );
}
