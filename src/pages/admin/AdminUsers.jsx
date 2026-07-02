import { useState, useEffect, useRef } from 'react';
import {
  Users, Loader2, RefreshCw, CheckCircle, XCircle,
  ShieldCheck, ShieldOff, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const PAGE_SIZE = 20;

// Cycle des rôles : customer → cashier → admin → customer.
// Libellé du PROCHAIN rôle, affiché sur le bouton et son title.
const NEXT_ROLE_LABEL = { customer: 'Cashier', cashier: 'Admin', admin: 'User' };

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState('');
  const [query, setQuery]         = useState('');   // debounced
  const [toast, setToast]         = useState(null);
  const [toggling, setToggling]   = useState(null); // user id being updated
  const toastTimer  = useRef(null);
  const debounceRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const load = async (p = page, q = query) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let builder = supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q) {
      const safe = q.replace(/[.,()]/g, '');
      builder = builder.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
    }

    const { data, error, count } = await builder;
    if (!error && data) {
      setUsers(data);
      setTotal(count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => { load(page, query); }, [page, query]); // eslint-disable-line

  // Debounce search input
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      setQuery(val.trim());
    }, 350);
  };

  // ── Toggle role ──────────────────────────────────────────────────────
  const toggleRole = async (u) => {
    const ROLE_CYCLE = { customer: 'cashier', cashier: 'admin', admin: 'customer' };
    const newRole = ROLE_CYCLE[u.role] ?? 'customer';
    // Empêche un admin de se retirer lui-même les droits (risque de se verrouiller dehors).
    if (u.id === currentUser?.id && newRole === 'customer') {
      return showToast('You cannot remove your own admin privileges.', 'error');
    }
    // Confirmation : changer un rôle (surtout promotion admin / rétrogradation) est sensible.
    const ROLE_LABELS = { admin: 'Admin', cashier: 'Cashier', customer: 'User' };
    const who = u.full_name || u.email;
    if (!window.confirm(`Change ${who}'s role to ${ROLE_LABELS[newRole] ?? newRole}?`)) return;
    setToggling(u.id);
    // .select() renvoie les lignes effectivement modifiées. Si une policy RLS
    // bloque l'UPDATE, Supabase renvoie error=null + data=[] (0 ligne) — c'est
    // un ÉCHEC silencieux, pas un succès. On vérifie donc explicitement data.
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', u.id)
      .select('id, role');
    setToggling(null);
    if (error) return showToast('Error updating role.', 'error');
    if (!data || data.length === 0) {
      return showToast('Update refused — you may not have permission to change this role.', 'error');
    }
    const updated = data[0];
    setUsers((prev) =>
      prev.map((x) => x.id === u.id ? { ...x, role: updated.role } : x)
    );
    showToast(`${who} → ${ROLE_LABELS[updated.role] ?? updated.role}.`);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink">Users</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            {total} registered member{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => load(page, query)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Users className="w-10 h-10 text-ink-soft/30 mb-3" />
            <p className="text-sm text-ink-soft">
              {query ? 'No results for this search.' : 'No users.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-cream-deep">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft hidden md:table-cell">Registered</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-cream-deep/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="font-semibold text-ink">{u.full_name || '—'}</span>
                    <p className="text-xs text-ink-soft sm:hidden truncate max-w-[180px]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft text-xs hidden sm:table-cell">
                    {u.email}
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft text-xs hidden md:table-cell">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-silver/10 text-silver-deep rounded-full text-[10px] font-semibold">
                        <ShieldCheck className="w-3 h-3" />Admin
                      </span>
                    ) : u.role === 'cashier' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold">
                        <CheckCircle className="w-3 h-3" />Cashier
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream-deep text-ink-soft rounded-full text-[10px] font-semibold">
                        <CheckCircle className="w-3 h-3" />User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={toggling === u.id}
                        title={`Change role (next: ${NEXT_ROLE_LABEL[u.role] ?? 'User'})`}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          u.role === 'admin'
                            ? 'text-silver-deep bg-silver/10 hover:bg-silver/20'
                            : 'text-ink-soft bg-cream-deep hover:bg-cream-deep/80'
                        }`}
                      >
                        {toggling === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : u.role === 'admin' ? (
                          <><ShieldOff className="w-3.5 h-3.5" />→ {NEXT_ROLE_LABEL.admin}</>
                        ) : (
                          <><ShieldCheck className="w-3.5 h-3.5" />→ {NEXT_ROLE_LABEL[u.role] ?? 'User'}</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>
            Page {page + 1} of {totalPages} · {total} result{total !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-ink/10 hover:bg-cream-deep disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-ink/10 hover:bg-cream-deep disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-ink text-cream'
        }`}>
          {toast.type === 'error'
            ? <XCircle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
