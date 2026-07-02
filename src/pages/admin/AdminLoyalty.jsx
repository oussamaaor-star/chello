import { useEffect, useRef, useState } from 'react';
import {
  Search, Plus, Gift, ChevronLeft, ChevronRight, Settings, Save,
  Loader2, Star, TrendingUp, Minus, History,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { calculatePoints } from '../../utils/loyalty';

const PAGE_SIZE = 20;

function formatOMR(v) {
  if (v == null) return '—';
  return Number(v).toFixed(3) + ' OMR';
}

export default function AdminLoyalty() {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [found, setFound] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  // Config state
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [configError, setConfigError] = useState('');
  const [editConfig, setEditConfig] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  // Points adjustment
  const [adjustMember, setAdjustMember] = useState(null);
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // Transaction history
  const [historyMember, setHistoryMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadConfig = async () => {
    setConfigLoading(true);
    const { data } = await supabase.from('loyalty_config').select('*').limit(1).maybeSingle();
    if (data) {
      const parsed = {
        ...data,
        reward_tiers: typeof data.reward_tiers === 'string' ? JSON.parse(data.reward_tiers) : data.reward_tiers ?? [],
      };
      setConfig(parsed);
      setEditConfig({
        omr_per_point: String(parsed.omr_per_point),
        points_per_threshold: String(parsed.points_per_threshold),
        signup_bonus: String(parsed.signup_bonus),
        reward_tiers: parsed.reward_tiers,
      });
    }
    setConfigLoading(false);
  };

  const saveConfig = async () => {
    if (!config || !editConfig) return;
    setConfigSaving(true);
    setConfigSaved(false);
    setConfigError('');
    const tiers = editConfig.reward_tiers.filter((t) => t.points > 0 && t.discount_omr > 0);
    // .select() : un UPDATE bloqué par RLS renvoie error=null + 0 ligne →
    // faux succès. On vérifie qu'une ligne a bien été modifiée.
    const { data, error } = await supabase.from('loyalty_config').update({
      omr_per_point: parseFloat(editConfig.omr_per_point) || 30,
      points_per_threshold: parseInt(editConfig.points_per_threshold) || 1,
      signup_bonus: parseInt(editConfig.signup_bonus) || 0,
      reward_tiers: tiers,
      updated_at: new Date().toISOString(),
    }).eq('id', config.id).select('id');
    setConfigSaving(false);
    if (error || !data || data.length === 0) {
      setConfigError('Save failed — the configuration was not updated.');
      return;
    }
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
    loadConfig();
  };

  const addTier = () => {
    setEditConfig((prev) => ({
      ...prev,
      reward_tiers: [...prev.reward_tiers, { points: 0, discount_omr: 0 }],
    }));
  };

  const updateTier = (idx, field, value) => {
    setEditConfig((prev) => ({
      ...prev,
      reward_tiers: prev.reward_tiers.map((t, i) =>
        i === idx ? { ...t, [field]: parseFloat(value) || 0 } : t
      ),
    }));
  };

  const removeTier = (idx) => {
    setEditConfig((prev) => ({
      ...prev,
      reward_tiers: prev.reward_tiers.filter((_, i) => i !== idx),
    }));
  };

  const loadRecent = async (p = page) => {
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from('loyalty_members')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    setMembers(data ?? []);
    setTotal(count ?? 0);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    loadRecent(page);
    inputRef.current?.focus();
  }, [page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    setFound(null);

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

  const handleAdjust = async () => {
    if (!adjustMember || !adjustPoints) return;
    setAdjustError('');
    setAdjusting(true);
    const pts = parseInt(adjustPoints);
    if (isNaN(pts) || pts === 0) { setAdjusting(false); return; }

    const memberId = adjustMember.id;
    const { error } = await supabase.rpc('add_loyalty_points', {
      p_member_id: memberId,
      p_points: pts,
      p_type: 'adjustment',
      p_source: 'admin',
      p_note: adjustNote || `Manual adjustment by admin`,
    });

    setAdjusting(false);
    if (error) {
      setAdjustError('Adjustment failed — points were not changed.');
      return;
    }
    setAdjustMember(null);
    setAdjustPoints('');
    setAdjustNote('');
    loadRecent(page);
    if (found?.id === memberId) {
      setFound((prev) => prev ? { ...prev, points: prev.points + pts } : prev);
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
      .limit(30);
    setTransactions(data ?? []);
    setHistoryLoading(false);
  };

  const typeLabel = (type) => {
    switch (type) {
      case 'earned': return 'Earned';
      case 'redeemed': return 'Redeemed';
      case 'bonus': return 'Bonus';
      case 'adjustment': return 'Adjustment';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Loyalty — Points System</h1>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
        >
          <Settings size={16} />
          {showConfig ? 'Hide config' : 'Configure rules'}
        </button>
      </div>

      {/* ── Config Panel ─────────────────────────────────────── */}
      {showConfig && (
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-soft flex items-center gap-2">
            <Settings size={14} /> Points Configuration
          </h2>

          {configLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-ink-soft" />
            </div>
          ) : editConfig && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-ink-soft mb-1.5">OMR per point</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editConfig.omr_per_point}
                    onChange={(e) => setEditConfig({ ...editConfig, omr_per_point: e.target.value })}
                    className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                  />
                  <p className="text-[10px] text-ink-soft/60 mt-1">
                    Customer spends {editConfig.omr_per_point} OMR = earns {editConfig.points_per_threshold} point(s)
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-ink-soft mb-1.5">Points per threshold</label>
                  <input
                    type="number"
                    value={editConfig.points_per_threshold}
                    onChange={(e) => setEditConfig({ ...editConfig, points_per_threshold: e.target.value })}
                    className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-soft mb-1.5">Signup bonus</label>
                  <input
                    type="number"
                    value={editConfig.signup_bonus}
                    onChange={(e) => setEditConfig({ ...editConfig, signup_bonus: e.target.value })}
                    className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                  />
                  <p className="text-[10px] text-ink-soft/60 mt-1">Points given when a new customer registers</p>
                </div>
              </div>

              {/* Reward Tiers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-ink-soft font-semibold">Reward Tiers</label>
                  <button
                    onClick={addTier}
                    className="flex items-center gap-1 text-xs text-silver-deep hover:text-silver transition-colors"
                  >
                    <Plus size={12} /> Add tier
                  </button>
                </div>
                {editConfig.reward_tiers.length === 0 ? (
                  <p className="text-xs text-ink-soft/50">No reward tiers configured. Add one above.</p>
                ) : (
                  <div className="space-y-2">
                    {editConfig.reward_tiers.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-cream-deep rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1.5 flex-1">
                          <Star size={12} className="text-silver" />
                          <input
                            type="number"
                            value={tier.points}
                            onChange={(e) => updateTier(idx, 'points', e.target.value)}
                            className="w-20 border border-ink/10 rounded-lg px-2 py-1.5 text-sm bg-white"
                          />
                          <span className="text-xs text-ink-soft">pts =</span>
                          <input
                            type="number"
                            step="0.001"
                            value={tier.discount_omr}
                            onChange={(e) => updateTier(idx, 'discount_omr', e.target.value)}
                            className="w-24 border border-ink/10 rounded-lg px-2 py-1.5 text-sm bg-white"
                          />
                          <span className="text-xs text-ink-soft">OMR discount</span>
                        </div>
                        <button onClick={() => removeTier(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Minus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={saveConfig}
                  disabled={configSaving}
                  className="flex items-center gap-2 bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {configSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save configuration
                </button>
                {configSaved && (
                  <span className="text-sm text-emerald-600 font-medium">Saved!</span>
                )}
                {configError && (
                  <span className="text-sm text-red-600 font-medium">{configError}</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Quick stats ──────────────────────────────────────── */}
      {config && !configLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-ink/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">Rule</p>
            <p className="text-sm font-bold text-ink">{Number(config.omr_per_point).toFixed(3)} OMR = {config.points_per_threshold} pt</p>
          </div>
          <div className="bg-white rounded-xl border border-ink/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">Signup bonus</p>
            <p className="text-sm font-bold text-ink">{config.signup_bonus} pts</p>
          </div>
          <div className="bg-white rounded-xl border border-ink/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">Members</p>
            <p className="text-sm font-bold text-ink">{total}</p>
          </div>
          <div className="bg-white rounded-xl border border-ink/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">Reward tiers</p>
            <p className="text-sm font-bold text-ink">{config.reward_tiers?.length ?? 0}</p>
          </div>
        </div>
      )}

      {/* ── Search ───────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone or barcode..."
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 bg-white"
          />
        </div>
        <button type="submit" disabled={searching} className="bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {notFound && <p className="text-red-500 text-sm">No customer found with this code/number.</p>}

      {/* ── Found member ─────────────────────────────────────── */}
      {found && (
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-ink text-lg">{found.full_name}</p>
              <p className="text-sm text-ink-soft">{found.whatsapp}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadHistory(found)}
                className="flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink transition-colors"
              >
                <History size={14} /> History
              </button>
              <button
                onClick={() => setAdjustMember(found)}
                className="flex items-center gap-1.5 text-xs font-medium text-silver-deep hover:text-silver transition-colors"
              >
                <TrendingUp size={14} /> Adjust
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-silver/10 border border-silver/20 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-ink">{found.points ?? 0}</p>
              <p className="text-xs text-ink-soft">points</p>
            </div>
            {config?.reward_tiers?.length > 0 && (
              <div className="flex-1">
                <p className="text-xs text-ink-soft mb-1">Available rewards:</p>
                <div className="flex flex-wrap gap-1.5">
                  {config.reward_tiers.map((tier, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        (found.points ?? 0) >= tier.points
                          ? 'bg-silver/10 border-silver/30 text-silver-deep font-semibold'
                          : 'bg-cream-deep border-ink/10 text-ink-soft/50'
                      }`}
                    >
                      <Gift size={10} className="inline mr-1" />
                      {tier.points} pts = {tier.discount_omr} OMR
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Member list ──────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-3">All members</h2>
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-cream-deep text-left">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Phone</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Points</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Registered</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-cream-deep/60 transition-colors">
                  <td className="px-4 py-3 text-ink font-medium">{m.full_name}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.whatsapp}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-ink">{m.points ?? 0}</span>
                    <span className="text-ink-soft text-xs ml-1">pts</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft text-xs">
                    {new Date(m.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => loadHistory(m)} className="text-xs text-ink-soft hover:text-ink transition-colors">
                      History
                    </button>
                    <button onClick={() => setAdjustMember(m)} className="text-xs text-silver-deep hover:text-silver transition-colors">
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Page {page + 1} of {Math.ceil(total / PAGE_SIZE)} — {total} member{total !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-ink/10 hover:bg-cream-deep disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(total / PAGE_SIZE) - 1, p + 1))}
              disabled={page >= Math.ceil(total / PAGE_SIZE) - 1}
              className="p-1.5 rounded-lg border border-ink/10 hover:bg-cream-deep disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Adjust points modal ──────────────────────────────── */}
      {adjustMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={() => { setAdjustMember(null); setAdjustError(''); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-ink mb-1">Adjust Points</h3>
            <p className="text-sm text-ink-soft mb-4">
              {adjustMember.full_name} — current: <span className="font-bold text-ink">{adjustMember.points ?? 0}</span> pts
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-ink-soft mb-1 block">Points (+ or -)</label>
                <input
                  type="number"
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(e.target.value)}
                  placeholder="+5 or -3"
                  className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-ink-soft mb-1 block">Note (optional)</label>
                <input
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Reason for adjustment"
                  className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                />
              </div>
            </div>
            {adjustError && (
              <p className="text-sm text-red-600 font-medium mb-3">{adjustError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setAdjustMember(null); setAdjustError(''); }}
                className="flex-1 py-2.5 border border-ink/15 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjusting || !adjustPoints}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-ink text-cream rounded-xl text-sm font-bold hover:bg-ink/90 disabled:opacity-50 transition-colors"
              >
                {adjusting ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History modal ────────────────────────────────────── */}
      {historyMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={() => setHistoryMember(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-ink mb-1">Points History</h3>
            <p className="text-sm text-ink-soft mb-4">{historyMember.full_name} — {historyMember.points ?? 0} pts</p>

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
                      <p className="text-sm font-medium text-ink">{typeLabel(tx.type)}</p>
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
