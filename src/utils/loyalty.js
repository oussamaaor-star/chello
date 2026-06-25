import { supabase } from '../lib/supabase';

const STAMPS_PER_CYCLE = 8;

export function currentCycle(count) {
  return count > 0 && count % STAMPS_PER_CYCLE === 0
    ? STAMPS_PER_CYCLE
    : count % STAMPS_PER_CYCLE;
}

export function isRewardReady(count) {
  return count > 0 && count % STAMPS_PER_CYCLE === 0;
}

export function completedCycles(count) {
  return Math.floor(count / STAMPS_PER_CYCLE);
}

function normalizePhone(phone) {
  return phone.replace(/[^0-9]/g, '');
}

export async function findMemberByPhone(phone) {
  const digits = normalizePhone(phone);
  if (digits.length < 4) return null;

  const { data } = await supabase
    .from('loyalty_members')
    .select('*')
    .or(`whatsapp.ilike.%${digits}%`)
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export async function addLoyaltyVisit(memberId) {
  const { data: member } = await supabase
    .from('loyalty_members')
    .select('id, visits_count, full_name')
    .eq('id', memberId)
    .maybeSingle();

  if (!member) return null;

  const newCount = member.visits_count + 1;

  await supabase
    .from('loyalty_members')
    .update({ visits_count: newCount })
    .eq('id', member.id);

  return {
    id: member.id,
    name: member.full_name,
    visits: newCount,
    stamps: currentCycle(newCount),
    rewardReady: isRewardReady(newCount),
    cycles: completedCycles(newCount),
  };
}

export async function addLoyaltyVisitByPhone(phone) {
  const member = await findMemberByPhone(phone);
  if (!member) return null;
  return addLoyaltyVisit(member.id);
}
