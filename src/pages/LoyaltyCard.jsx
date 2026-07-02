import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gift, Star, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';
import { Barcode } from '../components/loyalty/Barcode';
import { getLoyaltyConfig, getAvailableRewards, getPointsHistory } from '../utils/loyalty';

function formatOMR(v) {
  return Number(v).toFixed(3) + ' OMR';
}

export default function LoyaltyCard() {
  const { code } = useParams();
  const { t, lang } = useLanguage();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState([]);

  useSEO({ title: `${t('loyaltyCardSeoTitle')} — Chello`, robots: 'noindex,nofollow' });

  useEffect(() => {
    let active = true;

    Promise.all([
      supabase.rpc('get_loyalty_card', { p_code: code }),
      getLoyaltyConfig(),
      getPointsHistory(code),
    ]).then(([cardRes, cfg, hist]) => {
      if (!active) return;
      const row = cardRes.data?.[0];
      if (cardRes.error || !row) setNotFound(true);
      else setMember(row);
      setConfig(cfg);
      setHistory(hist);
      setLoading(false);
    });

    return () => { active = false; };
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-cream">
        <div className="w-8 h-8 rounded-full border-2 border-ink/15 border-t-ink animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center bg-cream min-h-[60vh]">
        <p className="text-ink-soft">{t('loyaltyNotFound')}</p>
      </div>
    );
  }

  const points = member.points ?? 0;
  const rewards = config ? getAvailableRewards(points, config.reward_tiers) : [];
  const nextReward = config?.reward_tiers
    ?.filter((t) => t.points > points)
    .sort((a, b) => a.points - b.points)[0];

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-md bg-cream-deep border border-ink/10 rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_-25px_rgba(24,20,15,0.25)]">
        <div className="text-center mb-6">
          <p className="font-serif italic text-2xl text-ink mb-1">Chello</p>
          <p className="text-xs text-silver-deep tracking-widest uppercase">{t('loyaltyBrandTagline')}</p>
        </div>

        <div className="text-center mb-6">
          <p className="text-ink-soft text-sm">{t('loyaltyWelcome')}</p>
          <p className="text-ink text-xl font-semibold">{member.full_name}</p>
        </div>

        {/* Points balance */}
        <div className="bg-cream border border-silver/40 rounded-2xl p-6 text-center mb-6">
          <Star size={24} className="text-silver-deep mx-auto mb-2" />
          <p className="text-4xl font-bold text-ink">{points}</p>
          <p className="text-sm text-ink-soft mt-1">{t('loyaltyPointsLabel')}</p>
        </div>

        {/* Available rewards */}
        {rewards.length > 0 && (
          <div className="mb-4">
            {rewards.map((r, i) => (
              <div key={i} className="flex items-center gap-2 justify-center bg-cream border border-silver/50 rounded-xl py-3 px-4 mb-2 text-silver-deep text-sm">
                <Gift size={16} />
                {t('loyaltyRewardAvailable').replace('{discount}', r.discount_omr).replace('{points}', r.points)}
              </div>
            ))}
          </div>
        )}

        {/* Next reward progress */}
        {nextReward && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-ink-soft mb-1.5">
              <span>{points} pts</span>
              <span>{nextReward.points} pts — {formatOMR(nextReward.discount_omr)} {t('loyaltyDiscount')}</span>
            </div>
            <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-silver-deep rounded-full transition-all"
                style={{ width: `${Math.min(100, (points / nextReward.points) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-ink-soft mt-1.5 text-center">
              {nextReward.points - points} {t('loyaltyPointsToGo')}
            </p>
          </div>
        )}

        {/* Recent history */}
        {history.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-ink-soft uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <TrendingUp size={12} /> {t('loyaltyHistory')}
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {history.slice(0, 10).map((tx, i) => (
                <div key={i} className="flex items-center justify-between bg-cream border border-ink/5 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-ink capitalize">{t(`loyaltyTx_${tx.type}`)}</p>
                    <p className="text-[10px] text-ink-soft/60">{new Date(tx.created_at).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-GB')}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-cream border border-ink/10 rounded-xl p-3">
          <Barcode value={member.code} />
        </div>

        <p className="text-center text-xs text-ink-soft mt-4">{t('loyaltyScanNote')}</p>
      </div>
    </div>
  );
}
