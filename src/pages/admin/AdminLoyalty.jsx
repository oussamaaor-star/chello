import { useEffect, useRef, useState } from 'react';
import { Search, Plus, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLoyalty() {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [found, setFound] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  const loadRecent = async () => {
    const { data } = await supabase.from('loyalty_members').select('*').order('created_at', { ascending: false }).limit(20);
    setMembers(data ?? []);
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
      .or(`code.eq.${clean},whatsapp.ilike.%${clean.replace(/[^0-9]/g, '')}%`)
      .limit(1)
      .maybeSingle();

    setSearching(false);
    if (!data) setNotFound(true);
    else setFound(data);
    setQuery('');
  };

  const addVisit = async (member) => {
    const newCount = member.visits_count + 1;
    await supabase.from('loyalty_members').update({ visits_count: newCount }).eq('id', member.id);
    const updated = { ...member, visits_count: newCount };
    setFound((prev) => (prev?.id === member.id ? updated : prev));
    setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
  };

  const currentCycle = (count) => (count > 0 && count % 8 === 0 ? 8 : count % 8);
  const rewardReady = (count) => count > 0 && count % 8 === 0;

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Fidélité</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Scanner le code-barres ou taper le numéro WhatsApp"
            className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-silver/40"
          />
        </div>
        <button type="submit" disabled={searching} className="bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-ink/90 transition-colors">
          Rechercher
        </button>
      </form>

      {notFound && <p className="text-red-500 mb-6">Aucune cliente trouvée avec ce code/numéro.</p>}

      {found && (
        <div className="bg-white rounded-2xl border border-ink/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-ink text-lg">{found.full_name}</p>
              <p className="text-sm text-ink-soft">{found.whatsapp}</p>
            </div>
            {rewardReady(found.visits_count) && (
              <span className="flex items-center gap-1.5 bg-silver/10 text-silver-deep rounded-full px-3 py-1.5 text-sm font-medium">
                <Gift size={14} /> Récompense disponible
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${i < currentCycle(found.visits_count) ? 'bg-silver' : 'bg-cream-deep'}`} />
              ))}
            </div>
            <span className="text-sm text-ink-soft">{currentCycle(found.visits_count)} / 8</span>
            <button onClick={() => addVisit(found)} className="flex items-center gap-1.5 bg-silver text-cream rounded-xl px-4 py-2 text-sm font-medium ml-auto hover:bg-silver-deep transition-colors">
              <Plus size={14} /> Ajouter une visite
            </button>
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">Clientes récentes</h2>
      <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink-soft">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Visites</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-ink/10">
                <td className="px-4 py-3 text-ink">{m.full_name}</td>
                <td className="px-4 py-3 text-ink-soft">{m.whatsapp}</td>
                <td className="px-4 py-3 text-ink">{currentCycle(m.visits_count)} / 8 {rewardReady(m.visits_count) && '🎁'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => addVisit(m)} className="text-silver-deep hover:underline text-sm">+1 visite</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
