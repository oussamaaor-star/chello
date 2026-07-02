import { useEffect, useRef, useState } from 'react';
import {
  Search, Plus, Gift, Loader2, AlertTriangle, Star, DollarSign,
  CheckCircle, History,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  getLoyaltyConfig, calculatePoints, addPoints,
  getAvailableRewards, getBestReward,
} from '../../utils/loyalty';

function formatOMR(v) {
  if (v == null) return '—';
  return Number(v).toFixed(3) + ' OMR';
}

export default function CashierLoyalty() {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [found, setFound] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  const [config, setConfig] = useState(null);

  // Add points flow
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmPoints, setConfirmPoints] = useState(0);
  const [stamping, setStamping] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Redeem flow
  const [redeemTarget, setRedeemTarget] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  // History
  const [historyMember, setHistoryMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadRecent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('loyalty_members')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadRecent();
    getLoyaltyConfig().then(setConfig);
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    setFound(null);
    setSuccessMsg(null);

    const clean = query.trim().replace(/[.,()]/g, '');
    const digits = clean.replace(/[^0-9]/g, '');
    // Recherche par nom / code / téléphone. On n'ajoute la clause téléphone que si
    // l'entrée contient ≥ 3 chiffres — sinon `whatsapp.ilike.%%` matcherait TOUS les
    // membres et renverrait un résultat arbitraire (la recherche par nom serait cassée).
    const conds = [`full_name.ilike.%${clean}%`];
    if (clean) conds.push(`code.eq.${clean}`);
    if (digits.length >= 3) conds.push(`whatsapp.ilike.%${digits}%`);
    const { data } = await supabase
      .from('loyalty_members')
      .select('*')
      .or(conds.join(','))
      .limit(1)
      .maybeSingle();

    setSearching(false);
    if (!data) setNotFound(true);
    else setFound(data);
    setQuery('');
  };

  const openAddPoints = (member) => {
    if (!config) return;
    const amount = parseFloat(purchaseAmount);
    if (!amount || amount <= 0) return;
    const pts = calculatePoints(amount, config);
    setConfirmTarget(member);
    setConfirmPoints(pts);
  };

  const confirmAddPoints = async () => {
    if (!confirmTarget || confirmPoints <= 0) { setConfirmTarget(null); return; }
    setStamping(true);
    const amount = parseFloat(purchaseAmount);

    const newTotal = await addPoints(
      confirmTarget.id, confirmPoints, 'earned', 'cashier', amount
    );

    setStamping(false);
    setConfirmTarget(null);
    setPurchaseAmount('');

    if (newTotal != null) {
      const updated = { ...confirmTarget, points: newTotal };
      setFound((prev) => (prev?.id === confirmTarget.id ? updated : prev));
      setMembers((prev) => prev.map((m) => m.id === confirmTarget.id ? updated : m));
      setSuccessMsg(`+${confirmPoints} pts added to ${confirmTarget.full_name} (total: ${newTotal})`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const openRedeem = (member) => {
    if (!config?.reward_tiers?.length) return;
    const available = getAvailableRewards(member.points ?? 0, config.reward_tiers);
    if (available.length === 0) return;
    setRedeemTarget(member);
    setSelectedReward(available[0]);
  };

  const confirmRedeem = async () => {
    if (!redeemTarget || !selectedReward) return;
    setRedeeming(true);

    const pts = -selectedReward.points;
    const newTotal = await addPoints(
      redeemTarget.id, pts, 'redeemed', 'cashier', null,
      `Redeemed ${selectedReward.discount_omr} OMR discount`
    );

    setRedeeming(false);
    setRedeemTarget(null);
    setSelectedReward(null);

    if (newTotal != null) {
      const updated = { ...redeemTarget, points: newTotal };
      setFound((prev) => (prev?.id === redeemTarget.id ? updated : prev));
      setMembers((prev) => prev.map((m) => m.id === redeemTarget.id ? updated : m));
      setSuccessMsg(`${redeemTarget.full_name} redeemed ${selectedReward.discount_omr} OMR — Give them the discount!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const loadHistory = async (member) => {
    setHistoryMember(member);
    setHistoryLoading(true);
    const { data } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setTransactions(data ?? []);
    setHistoryLoading(false);
  };

  const bestReward = (member) => config ? getBestReward(member.points ?? 0, config.reward_tiers) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-ink">Loyalty</h1>
        <p className="text-sm text-ink-soft mt-0.5">Look up customers, add points, redeem rewards</p>
      </div>

      {/* Current rule reminder */}
      {config && (
        <div className="bg-cream-deep rounded-xl border border-ink/10 px-4 py-3 flex items-center gap-3">
          <Star size={16} className="text-silver flex-shrink-0" />
          <p className="text-xs text-ink-soft">
            Current rule: <span className="font-bold text-ink">{config.omr_per_point} OMR = {config.points_per_threshold} point(s)</span>
            {config.reward_tiers?.length > 0 && (
              <span className="ml-2">
                — Rewards: {config.reward_tiers.map((t) => `${t.points}pts = ${t.discount_omr} OMR`).join(', ')}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Customer phone number, name, or barcode..."
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="flex items-center justify-center bg-ink text-cream rounded-xl px-6 py-2.5 text-sm font-bold hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
          <p className="text-sm text-red-600 font-medium">No customer found with this code/number.</p>
        </div>
      )}

      {/* Found member — points card */}
      {found && (
        <div className="bg-white rounded-2xl border border-ink/8 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-serif text-xl text-ink leading-tight">{found.full_name}</p>
              <p className="text-sm text-ink-soft mt-0.5">{found.whatsapp}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadHistory(found)}
                className="text-xs text-ink-soft hover:text-ink transition-colors"
              >
                <History size={14} />
              </button>
              {bestReward(found) && (
                <button
                  onClick={() => openRedeem(found)}
                  className="flex items-center gap-1.5 bg-silver/10 text-silver-deep rounded-full px-3 py-1.5 text-sm font-medium border border-silver/20 hover:bg-silver/20 transition-colors"
                >
                  <Gift size={14} /> Redeem
                </button>
              )}
            </div>
          </div>

          {/* Points display */}
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-silver/10 border border-silver/20 rounded-xl px-5 py-3 text-center">
              <p className="text-3xl font-serif text-ink leading-none">{found.points ?? 0}</p>
              <p className="text-[10px] text-ink-soft font-bold uppercase tracking-widest mt-1.5">points</p>
            </div>
            {config?.reward_tiers?.length > 0 && (
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {config.reward_tiers.map((tier, i) => {
                    const canRedeem = (found.points ?? 0) >= tier.points;
                    return (
                      <span
                        key={i}
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          canRedeem
                            ? 'bg-silver/10 border-silver/30 text-silver-deep font-semibold'
                            : 'bg-cream-deep border-ink/10 text-ink-soft/50'
                        }`}
                      >
                        {tier.points}pts = {tier.discount_omr} OMR
                        {canRedeem && ' ✓'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Add points from purchase */}
          <div className="flex items-end gap-2 mt-3 pt-3 border-t border-ink/5">
            <div className="flex-1">
              <label className="text-xs text-ink-soft mb-1 block">Purchase amount (OMR)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
                <input
                  type="number"
                  step="0.001"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="e.g. 45.000"
                  className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                />
              </div>
            </div>
            <button
              onClick={() => openAddPoints(found)}
              disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0 || !config}
              className="flex items-center gap-1.5 bg-silver text-cream rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-silver-deep transition-colors disabled:opacity-50"
            >
              <Plus size={14} /> Add points
            </button>
          </div>
          {purchaseAmount && config && parseFloat(purchaseAmount) > 0 && (
            <p className="text-xs text-ink-soft mt-2">
              {formatOMR(purchaseAmount)} = <span className="font-bold text-ink">{calculatePoints(parseFloat(purchaseAmount), config)}</span> point(s)
            </p>
          )}
        </div>
      )}

      {/* Recent members list */}
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-3">Recent customers</h2>
        <div className="bg-white rounded-2xl border border-ink/8 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-ink-soft text-center py-8">No customers registered.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-cream-deep/40 text-left">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Name</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Phone</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Points</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-cream-deep/60 transition-colors cursor-pointer"
                    onClick={() => { setFound(m); setNotFound(false); setSuccessMsg(null); }}
                  >
                    <td className="px-5 py-3 text-ink font-medium">{m.full_name}</td>
                    <td className="px-5 py-3 text-ink-soft">{m.whatsapp}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-ink">{m.points ?? 0}</span>
                      <span className="text-ink-soft text-xs ml-1">pts</span>
                      {bestReward(m) && (
                        <Gift size={12} className="inline ml-2 text-silver" />
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs font-semibold text-silver-deep">Select</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Confirm add points modal ─────────────────────────── */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-serif text-ink">Confirm points</h3>
            </div>
            <p className="text-sm text-ink-soft mb-1">
              Purchase: <span className="font-semibold text-ink">{formatOMR(purchaseAmount)}</span>
            </p>
            <p className="text-sm text-ink-soft mb-1">
              Customer: <span className="font-semibold text-ink">{confirmTarget.full_name}</span>
            </p>
            <p className="text-sm text-ink-soft mb-1">
              Current balance: <span className="font-semibold text-ink">{confirmTarget.points ?? 0} pts</span>
            </p>
            <div className="bg-emerald-50 rounded-xl p-4 my-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">+{confirmPoints}</p>
              <p className="text-xs text-emerald-700">points to add</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={stamping}
                className="flex-1 py-2.5 border border-ink/15 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddPoints}
                disabled={stamping}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-silver text-cream rounded-xl text-sm font-bold hover:bg-silver-deep transition-colors disabled:opacity-50"
              >
                {stamping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={14} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Redeem reward modal ──────────────────────────────── */}
      {redeemTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-silver/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-silver" />
              </div>
              <h3 className="text-xl font-serif text-ink">Redeem reward</h3>
            </div>
            <p className="text-sm text-ink-soft mb-3">
              {redeemTarget.full_name} — <span className="font-bold text-ink">{redeemTarget.points ?? 0} pts</span>
            </p>

            <div className="space-y-2 mb-4">
              {getAvailableRewards(redeemTarget.points ?? 0, config?.reward_tiers ?? []).map((tier, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedReward(tier)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${
                    selectedReward?.points === tier.points
                      ? 'border-silver bg-silver/10'
                      : 'border-ink/10 hover:bg-cream-deep'
                  }`}
                >
                  <span className="text-sm font-medium text-ink">{tier.points} pts</span>
                  <span className="text-sm font-bold text-silver-deep">{tier.discount_omr} OMR discount</span>
                </button>
              ))}
            </div>

            {selectedReward && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-amber-700">
                  This will deduct <span className="font-bold">{selectedReward.points} points</span> and the customer gets a <span className="font-bold">{selectedReward.discount_omr} OMR</span> discount on their purchase.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setRedeemTarget(null); setSelectedReward(null); }}
                disabled={redeeming}
                className="flex-1 py-2.5 border border-ink/15 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeem}
                disabled={redeeming || !selectedReward}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-silver text-cream rounded-xl text-sm font-bold hover:bg-silver-deep transition-colors disabled:opacity-50"
              >
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift size={14} />}
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History modal ────────────────────────────────────── */}
      {historyMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={() => setHistoryMember(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-serif text-ink mb-1">Points History</h3>
            <p className="text-sm text-ink-soft mb-4">{historyMember.full_name}</p>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-ink-soft" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-ink-soft text-center py-6">No transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between bg-cream-deep rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink capitalize">{tx.type}</p>
                      <p className="text-xs text-ink-soft">
                        {tx.source}{tx.amount_omr ? ` — ${formatOMR(tx.amount_omr)}` : ''}{tx.note ? ` — ${tx.note}` : ''}
                      </p>
                      <p className="text-[10px] text-ink-soft/50">{new Date(tx.created_at).toLocaleString('en-GB')}</p>
                    </div>
                    <span className={`text-sm font-bold ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setHistoryMember(null)}
              className="w-full mt-4 py-2.5 border border-ink/15 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
