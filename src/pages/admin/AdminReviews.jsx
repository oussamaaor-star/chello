import { useState, useEffect, useRef } from 'react';
import {
  Star, CheckCircle, XCircle, Loader2, RefreshCw,
  Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

const PAGE_SIZE = 15;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminReviews() {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [filter, setFilter]       = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [search, setSearch]       = useState('');
  const [query, setQuery]         = useState('');
  const [toast, setToast]         = useState(null);
  const [acting, setActing]       = useState(null);
  const toastTimer  = useRef(null);
  const debounceRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const load = async (p = page, q = query, f = filter) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let builder = supabase
      .from('reviews')
      .select('id, rating, comment, display_name, created_at, approved, product_id, products(name, brand)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (f === 'pending')  builder = builder.is('approved', null);
    if (f === 'approved') builder = builder.eq('approved', true);
    if (f === 'rejected') builder = builder.eq('approved', false);

    if (q) builder = builder.ilike('comment', `%${q}%`);

    const { data, error, count } = await builder;

    if (error) {
      showToast('Erreur de chargement des avis.', 'error');
    } else {
      setReviews(data ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => { load(page, query, filter); }, [page, query, filter]); // eslint-disable-line

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      setQuery(val.trim());
    }, 350);
  };

  const handleFilter = (f) => {
    setFilter(f);
    setPage(0);
  };

  const approve = async (id) => {
    setActing(id);
    const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id);
    setActing(null);
    if (error) return showToast('Erreur lors de l\'approbation.', 'error');
    showToast('Avis approuvé et publié.');
    load(page, query, filter);
  };

  const reject = async (id) => {
    setActing(id);
    const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', id);
    setActing(null);
    if (error) return showToast('Erreur lors du rejet.', 'error');
    showToast('Avis rejeté.');
    load(page, query, filter);
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement cet avis ?')) return;
    setActing(id);
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    setActing(null);
    if (error) return showToast('Erreur lors de la suppression.', 'error');
    showToast('Avis supprimé.');
    load(page, query, filter);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const FILTERS = [
    { key: 'pending',  label: 'En attente' },
    { key: 'approved', label: 'Approuvés'  },
    { key: 'rejected', label: 'Rejetés'    },
    { key: 'all',      label: 'Tous'       },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif text-ink">Avis clients</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            {total} avis · Modérez avant publication
          </p>
        </div>
        <button
          onClick={() => load(page, query, filter)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilter(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === key
                  ? 'bg-ink text-cream'
                  : 'bg-white border border-ink/10 text-ink-soft hover:bg-cream-deep'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher dans les commentaires…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Star className="w-10 h-10 text-ink-soft/30 mb-3" />
            <p className="text-sm text-ink-soft">
              {query ? 'Aucun avis pour cette recherche.' : 'Aucun avis dans cette catégorie.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {reviews.map((r) => {
              const isActing = acting === r.id;
              const statusBadge = r.approved === true
                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold"><CheckCircle className="w-3 h-3" />Approuvé</span>
                : r.approved === false
                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-semibold"><XCircle className="w-3 h-3" />Rejeté</span>
                : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold"><Loader2 className="w-3 h-3" />En attente</span>;

              return (
                <div key={r.id} className="p-5 hover:bg-cream-deep/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center flex-shrink-0 text-gold-light text-sm font-bold">
                      {(r.display_name ?? '?')[0].toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-ink text-sm">
                          {r.display_name ?? 'Anonyme'}
                        </span>
                        <Stars rating={r.rating} />
                        {statusBadge}
                      </div>
                      {r.products && (
                        <p className="text-xs text-ink-soft mb-1.5">
                          {r.products.brand} — {r.products.name}
                        </p>
                      )}
                      <p className="text-sm text-ink leading-relaxed line-clamp-3">
                        {r.comment}
                      </p>
                      <p className="text-xs text-ink-soft mt-2">{formatDate(r.created_at)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {r.approved !== true && (
                        <button
                          onClick={() => approve(r.id)}
                          disabled={isActing}
                          title="Approuver"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                        >
                          {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {r.approved !== false && (
                        <button
                          onClick={() => reject(r.id)}
                          disabled={isActing}
                          title="Rejeter"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                          {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => remove(r.id)}
                        disabled={isActing}
                        title="Supprimer définitivement"
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-cream-deep text-ink-soft hover:bg-red-50 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Page {page + 1} sur {totalPages} · {total} avis</span>
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
