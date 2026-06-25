import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';
import { LoyaltyStamps } from '../components/loyalty/LoyaltyStamps';
import { Barcode } from '../components/loyalty/Barcode';

export default function LoyaltyCard() {
  const { code } = useParams();
  const { t } = useLanguage();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSEO({ title: 'بطاقة الولاء — Chello', robots: 'noindex,nofollow' });

  useEffect(() => {
    let active = true;
    supabase
      .rpc('get_loyalty_card', { p_code: code })
      .then(({ data, error }) => {
        if (!active) return;
        const row = data?.[0];
        if (error || !row) setNotFound(true);
        else setMember(row);
        setLoading(false);
      });
    return () => { active = false; };
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-ink">
        <div className="w-8 h-8 rounded-full border-2 border-silver/20 border-t-silver animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center bg-ink min-h-[60vh]">
        <p className="text-cream/70">{t('loyaltyNotFound')}</p>
      </div>
    );
  }

  const visits = member.visits_count % 8 === 0 && member.visits_count > 0 ? 8 : member.visits_count % 8;
  const rewardReady = member.visits_count > 0 && member.visits_count % 8 === 0;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-ink">
      <div className="w-full max-w-md bg-gradient-to-br from-[#241f18] to-ink border border-silver/25 rounded-3xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <p className="font-serif italic text-2xl text-silver-light mb-1">Chello</p>
          <p className="text-xs text-cream/40 tracking-widest uppercase">Women's Fashion</p>
        </div>

        <div className="text-center mb-6">
          <p className="text-cream/50 text-sm">{t('loyaltyWelcome')}</p>
          <p className="text-cream text-xl font-semibold">{member.full_name}</p>
        </div>

        <LoyaltyStamps count={visits} />

        <p className="text-center text-silver-light font-medium mt-6 mb-6">
          {t('loyaltyVisitsOf').replace('{count}', visits)}
        </p>

        {rewardReady && (
          <div className="flex items-center gap-2 justify-center bg-silver/10 border border-silver/40 rounded-xl py-3 px-4 mb-6 text-silver-light text-sm">
            <Gift size={16} />
            {t('loyaltyRewardReady')}
          </div>
        )}

        <div className="bg-cream rounded-xl p-3">
          <Barcode value={member.code} />
        </div>

        <p className="text-center text-xs text-cream/40 mt-4">{t('loyaltyScanNote')}</p>
      </div>
    </div>
  );
}
