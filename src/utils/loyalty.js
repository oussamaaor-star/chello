import { supabase } from '../lib/supabase';

function normalizePhone(phone) {
  return phone.replace(/[^0-9]/g, '');
}

export async function getLoyaltyConfig() {
  const { data } = await supabase.rpc('get_loyalty_config');
  if (!data?.[0]) {
    return { omr_per_point: 30, points_per_threshold: 1, signup_bonus: 5, reward_tiers: [] };
  }
  const row = data[0];
  return {
    omr_per_point: Number(row.omr_per_point),
    points_per_threshold: row.points_per_threshold,
    signup_bonus: row.signup_bonus,
    reward_tiers: typeof row.reward_tiers === 'string'
      ? JSON.parse(row.reward_tiers)
      : row.reward_tiers ?? [],
  };
}

export function calculatePoints(amountOmr, config) {
  if (!config || config.omr_per_point <= 0) return 0;
  return Math.floor(amountOmr / config.omr_per_point) * config.points_per_threshold;
}

export function getAvailableRewards(memberPoints, rewardTiers) {
  if (!rewardTiers?.length) return [];
  return rewardTiers
    .filter((t) => memberPoints >= t.points)
    .sort((a, b) => b.points - a.points);
}

export function getBestReward(memberPoints, rewardTiers) {
  const available = getAvailableRewards(memberPoints, rewardTiers);
  return available[0] ?? null;
}

export async function findMemberByPhone(phone) {
  const digits = normalizePhone(phone);
  if (digits.length < 4) return null;

  const { data } = await supabase
    .from('loyalty_members')
    .select('*')
    .ilike('whatsapp', `%${digits}%`)
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export async function addPoints(memberId, points, type, source, amountOmr = null, note = null) {
  const { data, error } = await supabase.rpc('add_loyalty_points', {
    p_member_id: memberId,
    p_points: points,
    p_type: type,
    p_source: source,
    p_amount_omr: amountOmr,
    p_note: note,
  });

  if (error) return null;
  return data;
}

export async function addPointsFromPurchase(memberId, amountOmr, config, source = 'cashier') {
  const pts = calculatePoints(amountOmr, config);
  if (pts <= 0) return { points: 0, newTotal: null };

  const newTotal = await addPoints(memberId, pts, 'earned', source, amountOmr);
  return { points: pts, newTotal };
}

export async function redeemReward(memberId, reward) {
  const pts = -reward.points;
  const note = `Redeemed ${reward.discount_omr} OMR discount`;
  const newTotal = await addPoints(memberId, pts, 'redeemed', 'cashier', null, note);
  return newTotal;
}

export async function getPointsHistory(code) {
  const { data } = await supabase.rpc('get_loyalty_history', { p_code: code });
  return data ?? [];
}
