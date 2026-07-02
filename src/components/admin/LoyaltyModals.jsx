import { useEffect, useState } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function formatOMR(v) {
  if (v == null) return '—';
  return Number(v).toFixed(3) + ' OMR';
}

function typeLabel(type) {
  switch (type) {
    case 'earned': return 'Earned';
    case 'redeemed': return 'Redeemed';
    case 'bonus': return 'Bonus';
    case 'adjustment': return 'Adjustment';
    default: return type;
  }
}

// ── Modale d'ajustement manuel des points ─────────────────────────────────────
// onApplied(memberId, pts) est appelé après un ajustement réussi (refresh parent).

export function AdjustPointsModal({ member, onClose, onApplied }) {
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const handleAdjust = async () => {
    if (!member || !adjustPoints) return;
    setAdjustError('');
    setAdjusting(true);
    const pts = parseInt(adjustPoints);
    if (isNaN(pts) || pts === 0) { setAdjusting(false); return; }

    const { error } = await supabase.rpc('add_loyalty_points', {
      p_member_id: member.id,
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
    onApplied?.(member.id, pts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-ink mb-1">Adjust Points</h3>
        <p className="text-sm text-ink-soft mb-4">
          {member.full_name} — current: <span className="font-bold text-ink">{member.points ?? 0}</span> pts
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
            onClick={onClose}
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
  );
}

// ── Modale historique des transactions ────────────────────────────────────────

export function PointsHistoryModal({ member, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      const { data } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (!cancelled) {
        setTransactions(data ?? []);
        setHistoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [member.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-ink mb-1">Points History</h3>
        <p className="text-sm text-ink-soft mb-4">{member.full_name} — {member.points ?? 0} pts</p>

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
          onClick={onClose}
          className="w-full mt-4 py-2.5 border border-ink/15 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
