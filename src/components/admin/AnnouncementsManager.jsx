import { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Loader2, Trash2, ToggleLeft, ToggleRight,
  ArrowUp, ArrowDown, AlertCircle, Save, CheckCircle, XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Gestion du bandeau défilant de la home (table announcements — migration 022).
// Le proprio ajoute / active / ordonne ses messages AR+EN sans toucher au code.
export function AnnouncementsManager() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ text_ar: '', text_en: '' });
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  // Suppression en 2 clics (pas de modale bloquante pour un item de bandeau)
  const [confirmId, setConfirmId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('sort_order');
    if (error) setTableMissing(true);
    else setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.text_ar.trim() || !form.text_en.trim()) {
      return setFormError('Both Arabic and English texts are required.');
    }
    setSaving(true);
    const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;
    const { error } = await supabase.from('announcements').insert({
      text_ar: form.text_ar.trim(),
      text_en: form.text_en.trim(),
      sort_order: nextOrder,
    });
    setSaving(false);
    if (error) return setFormError('Error saving — the message was not added.');
    setForm({ text_ar: '', text_en: '' });
    setShowForm(false);
    load();
  };

  // .select() : un UPDATE bloqué par RLS renvoie error=null + 0 ligne →
  // faux succès. On vérifie qu'une ligne a bien été modifiée (cf. AdminPromos).
  const toggle = async (item) => {
    setConfirmId(null);
    const { data, error } = await supabase
      .from('announcements')
      .update({ active: !item.active })
      .eq('id', item.id)
      .select('id');
    if (error || !data?.length) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i)));
  };

  const remove = async (item) => {
    const { data, error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', item.id)
      .select('id');
    setConfirmId(null);
    if (!error && data?.length) setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Échange le sort_order avec le voisin (haut/bas)
  const move = async (idx, dir) => {
    setConfirmId(null);
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[idx];
    const b = items[j];
    const [ra, rb] = await Promise.all([
      supabase.from('announcements').update({ sort_order: b.sort_order }).eq('id', a.id).select('id'),
      supabase.from('announcements').update({ sort_order: a.sort_order }).eq('id', b.id).select('id'),
    ]);
    if (ra.error || rb.error || !ra.data?.length || !rb.data?.length) return load();
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...b, sort_order: a.sort_order };
      copy[j]   = { ...a, sort_order: b.sort_order };
      return copy;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif text-ink flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-silver-deep" />
            Homepage Banner
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Messages of the scrolling banner on the homepage. Disable all to hide the banner.
          </p>
        </div>
        {!tableMissing && (
          <button
            onClick={() => { setShowForm((v) => !v); setFormError(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />New message
          </button>
        )}
      </div>

      {tableMissing && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            The <span className="font-mono font-bold">announcements</span> table does not exist yet —
            run migration <span className="font-mono font-bold">022_announcements.sql</span> in the Supabase SQL editor.
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Arabic text *</label>
              <input
                dir="rtl"
                value={form.text_ar}
                onChange={(e) => setForm((p) => ({ ...p, text_ar: e.target.value }))}
                placeholder="خصم ٢٠٪ بمناسبة العيد"
                maxLength={80}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">English text *</label>
              <input
                value={form.text_en}
                onChange={(e) => setForm((p) => ({ ...p, text_en: e.target.value }))}
                placeholder="Eid sale — 20% off"
                maxLength={80}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 transition-all"
              />
            </div>
          </div>
          {formError && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{formError}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-ink/10 text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-cream text-sm font-semibold hover:bg-ink/90 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Add
            </button>
          </div>
        </form>
      )}

      {!tableMissing && (
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Megaphone className="w-8 h-8 text-ink-soft/30 mb-3" />
              <p className="text-sm text-ink-soft">No messages — the homepage banner is hidden.</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/5">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 px-4 sm:px-6 py-3">
                  {/* Réordonnancement */}
                  <div className="flex flex-col flex-shrink-0">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="p-0.5 text-ink-soft/50 hover:text-ink disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="p-0.5 text-ink-soft/50 hover:text-ink disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Textes */}
                  <div className={`flex-1 min-w-0 ${!item.active ? 'opacity-40' : ''}`}>
                    <p dir="rtl" className="text-sm text-ink truncate">{item.text_ar}</p>
                    <p className="text-xs text-ink-soft truncate">{item.text_en}</p>
                  </div>

                  {/* Statut */}
                  <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                    item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-cream-deep text-ink-soft'
                  }`}>
                    {item.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {item.active ? 'Live' : 'Off'}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggle(item)}
                      title={item.active ? 'Disable' : 'Enable'}
                      className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
                    >
                      {item.active
                        ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                        : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => (confirmId === item.id ? remove(item) : setConfirmId(item.id))}
                      title={confirmId === item.id ? 'Click again to confirm' : 'Delete'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        confirmId === item.id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'text-ink-soft hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
