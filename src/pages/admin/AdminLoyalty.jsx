import { useEffect, useRef, useState } from 'react';
import {
  Search, Gift, ChevronLeft, ChevronRight, Settings,
  Loader2, TrendingUp, History,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoyaltyConfigPanel } from '../../components/admin/LoyaltyConfigPanel';
import { AdjustPointsModal, PointsHistoryModal } from '../../components/admin/LoyaltyModals';

const PAGE_SIZE = 20;

export default function AdminLoyalty() {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [found, setFound] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  // Config en lecture seule (chargée/sauvée par LoyaltyConfigPanel)
  const [config, setConfig] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  // Modales
  const [adjustMember, setAdjustMember] = useState(null);
  const [historyMember, setHistoryMember] = useState(null);

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

  // Après un ajustement réussi : refresh liste + membre trouvé s'il est concerné.
  const handleAdjusted = (memberId, pts) => {
    loadRecent(page);
    if (found?.id === memberId) {
      setFound((prev) => prev ? { ...prev, points: prev.points + pts } : prev);
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

      {/* ── Config Panel (toujours monté : charge la config même replié) ── */}
      <LoyaltyConfigPanel visible={showConfig} onConfigChange={setConfig} />

      {/* ── Quick stats ──────────────────────────────────────── */}
      {config && (
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
                onClick={() => setHistoryMember(found)}
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
                    <button onClick={() => setHistoryMember(m)} className="text-xs text-ink-soft hover:text-ink transition-colors">
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

      {/* ── Modales ──────────────────────────────────────────── */}
      {adjustMember && (
        <AdjustPointsModal
          member={adjustMember}
          onClose={() => setAdjustMember(null)}
          onApplied={handleAdjusted}
        />
      )}
      {historyMember && (
        <PointsHistoryModal
          member={historyMember}
          onClose={() => setHistoryMember(null)}
        />
      )}
    </div>
  );
}
