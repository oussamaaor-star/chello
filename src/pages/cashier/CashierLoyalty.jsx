import { useEffect, useRef, useState } from 'react';
import { Search, Plus, Gift, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { currentCycle, isRewardReady, addLoyaltyVisit } from '../../utils/loyalty';

export default function CashierLoyalty() {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [found, setFound] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

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
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    setFound(null);

    const clean = query.trim();
    const { data } = await supabase
      .from('loyalty_members')
      .select('*')
      .or(`code.eq.${clean},whatsapp.ilike.%${clean.replace(/[^0-9]/g, '')}%,full_name.ilike.%${clean}%`)
      .limit(1)
      .maybeSingle();

    setSearching(false);
    if (!data) setNotFound(true);
    else setFound(data);
    setQuery('');
  };

  const handleAddVisit = async (member) => {
    const result = await addLoyaltyVisit(member.id);
    if (!result) return;
    const updated = { ...member, visits_count: result.visits };
    setFound((prev) => (prev?.id === member.id ? updated : prev));
    setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-ink">Fidélité</h1>

      {/* Recherche */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Scanner le code, nom ou numéro WhatsApp..."
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rechercher'}
        </button>
      </form>

      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
          <p className="text-sm text-red-600 font-medium">Aucune cliente trouvée avec ce code/numéro.</p>
        </div>
      )}

      {/* Résultat trouvé */}
      {found && (
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-ink text-lg">{found.full_name}</p>
              <p className="text-sm text-ink-soft">{found.whatsapp}</p>
              {found.code && (
                <p className="text-xs font-mono text-ink-soft/60 mt-0.5">Code: {found.code}</p>
              )}
            </div>
            {isRewardReady(found.visits_count) && (
              <span className="flex items-center gap-1.5 bg-silver/10 text-silver-deep rounded-full px-3 py-1.5 text-sm font-medium border border-silver/20">
                <Gift size={14} /> Récompense !
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full border-2 transition-colors ${
                    i < currentCycle(found.visits_count)
                      ? 'bg-silver border-silver'
                      : 'bg-cream-deep border-ink/10'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-ink-soft font-medium">{currentCycle(found.visits_count)} / 8</span>
            <button
              onClick={() => handleAddVisit(found)}
              className="flex items-center gap-1.5 bg-silver text-cream rounded-xl px-5 py-2.5 text-sm font-bold ml-auto hover:bg-silver-deep transition-colors"
            >
              <Plus size={14} /> Tamponner
            </button>
          </div>

          <p className="text-xs text-ink-soft/60 mt-3">
            Total visites : {found.visits_count} — Cycles complétés : {Math.floor(found.visits_count / 8)}
          </p>
        </div>
      )}

      {/* Liste récente */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-3">Clientes récentes</h2>
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-ink-soft text-center py-8">Aucune cliente inscrite.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-ink-soft">
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">WhatsApp</th>
                  <th className="px-5 py-3 font-medium">Visites</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-cream-deep/60 transition-colors">
                    <td className="px-5 py-3 text-ink font-medium">{m.full_name}</td>
                    <td className="px-5 py-3 text-ink-soft">{m.whatsapp}</td>
                    <td className="px-5 py-3">
                      <span className="text-ink font-medium">{currentCycle(m.visits_count)}/8</span>
                      {isRewardReady(m.visits_count) && (
                        <span className="ml-2 text-silver text-xs">🎁</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleAddVisit(m)}
                        className="text-xs font-semibold text-silver-deep hover:text-silver transition-colors"
                      >
                        +1 visite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
