import { useState, useEffect, useRef } from 'react';
import {
  Tag, Plus, Loader2, RefreshCw, CheckCircle, XCircle,
  Trash2, ToggleLeft, ToggleRight, AlertCircle, Save,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function isExpired(expires_at) {
  if (!expires_at) return false;
  return new Date(expires_at) < new Date();
}

const EMPTY_FORM = { code: '', discount_percent: '', expires_at: '' };

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPromos() {
  const [promos, setPromos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [confirmDel, setConfirmDel] = useState(null); // promo | null
  const toastTimer = useRef(null);

  const showToast = (msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPromos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Créer ────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    const code    = form.code.trim().toUpperCase();
    const pct     = Number(form.discount_percent);

    if (!code)               return setFormError('Le code est requis.');
    if (!/^[A-Z0-9_-]{2,20}$/.test(code)) return setFormError('Code invalide (2–20 caractères alphanumériques).');
    if (!pct || pct < 1 || pct > 100)      return setFormError('Remise entre 1 et 100 %.');

    setSaving(true);
    const { error } = await supabase.from('promo_codes').insert({
      code,
      discount_percent: pct,
      active:     true,
      expires_at: form.expires_at || null,
    });

    setSaving(false);
    if (error) {
      if (error.code === '23505') return setFormError('Ce code existe déjà.');
      return setFormError('Erreur : ' + error.message);
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
    showToast(`Code "${code}" créé.`);
    load();
  };

  // ── Toggle actif ─────────────────────────────────────────────────
  const toggleActive = async (promo) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ active: !promo.active })
      .eq('id', promo.id);
    if (error) return showToast('Erreur lors de la mise à jour.', 'error');
    setPromos((prev) => prev.map((p) => p.id === promo.id ? { ...p, active: !p.active } : p));
    showToast(`Code "${promo.code}" ${!promo.active ? 'activé' : 'désactivé'}.`);
  };

  // ── Supprimer ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDel) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', confirmDel.id);
    if (error) { showToast('Erreur suppression.', 'error'); }
    else {
      setPromos((prev) => prev.filter((p) => p.id !== confirmDel.id));
      showToast(`Code "${confirmDel.code}" supprimé.`);
    }
    setConfirmDel(null);
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink">Codes promo</h1>
          <p className="text-sm text-ink-soft mt-0.5">Gérez les codes de réduction.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-deep disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setShowForm((v) => !v); setFormError(''); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors active:scale-[0.97]">
            <Plus className="w-4 h-4" />Nouveau code
          </button>
        </div>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-soft">Nouveau code promo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="EX: CHELLO10"
                maxLength={20}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Remise (%) *</label>
              <input
                type="number"
                min={1} max={100}
                value={form.discount_percent}
                onChange={(e) => setForm((p) => ({ ...p, discount_percent: e.target.value }))}
                placeholder="10"
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Expiration (optionnel)</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
              />
            </div>
          </div>
          {formError && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{formError}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-ink/10 text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-cream text-sm font-semibold hover:bg-ink/90 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Créer
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
          </div>
        ) : promos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Tag className="w-10 h-10 text-ink-soft/30 mb-3" />
            <p className="text-sm text-ink-soft">Aucun code promo. Créez le premier.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-cream-deep">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Code</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Remise</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft hidden sm:table-cell">Expiration</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {promos.map((p) => {
                const expired = isExpired(p.expires_at);
                return (
                  <tr key={p.id} className="hover:bg-cream-deep/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-bold text-ink text-sm tracking-wider">{p.code}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-emerald-700">−{p.discount_percent} %</span>
                    </td>
                    <td className="px-4 py-3.5 text-ink-soft text-xs hidden sm:table-cell">
                      {p.expires_at ? (
                        <span className={expired ? 'text-red-500 font-semibold' : ''}>
                          {formatDate(p.expires_at)}{expired && ' (expiré)'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.active && !expired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                          <CheckCircle className="w-3 h-3" />Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream-deep text-ink-soft rounded-full text-[10px] font-semibold">
                          <XCircle className="w-3 h-3" />{expired ? 'Expiré' : 'Inactif'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => toggleActive(p)} title={p.active ? 'Désactiver' : 'Activer'}
                          className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors">
                          {p.active
                            ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                            : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setConfirmDel(p)} title="Supprimer"
                          className="p-1.5 rounded-lg text-ink-soft hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal confirmation suppression */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-ink mb-1">Supprimer ce code ?</h3>
            <p className="text-sm text-ink-soft mb-5">
              Le code <span className="font-mono font-bold text-ink">{confirmDel.code}</span> sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 rounded-xl border border-ink/10 text-sm font-semibold text-ink hover:bg-cream-deep transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
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
