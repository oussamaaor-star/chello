import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { invalidateCatalogueCache } from '../../hooks/useCatalogue';
import categoriesData from '../../data/categories.json';

const EMPTY_FORM = { name: '', category: 'dresses', price: '', description: '', images: '', sizes: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateField = async (id, field, value) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    await supabase.from('products').update({ [field]: value }).eq('id', id);
    invalidateCatalogueCache();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    invalidateCatalogueCache();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '');
    await supabase.from('products').insert({
      name: form.name,
      slug: slug || `produit-${Date.now()}`,
      category: form.category,
      price: form.price ? Number(form.price) : null,
      description: form.description,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      active: true,
      in_stock: true,
    });
    setSaving(false);
    setShowForm(false);
    setForm(EMPTY_FORM);
    invalidateCatalogueCache();
    load();
  };

  if (loading) return <p className="text-ink-soft">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Produits ({products.length})</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-ink text-cream rounded-xl px-4 py-2 text-sm font-medium"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-ink/10 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required placeholder="Nom du produit" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="border border-ink/15 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/40" />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="border border-ink/15 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/40">
            {categoriesData.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          <input placeholder="Prix (OMR)" type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="border border-ink/15 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/40" />
          <input placeholder="Tailles (séparées par virgule, ex: S,M,L)" value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} className="border border-ink/15 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/40" />
          <input placeholder="URLs images (séparées par virgule)" value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} className="border border-ink/15 rounded-xl px-3 py-2 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-gold/40" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="border border-ink/15 rounded-xl px-3 py-2 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-gold/40" rows={2} />
          <button type="submit" disabled={saving} className="bg-gold text-cream font-semibold rounded-xl px-4 py-2 sm:col-span-2 disabled:opacity-50 hover:bg-gold-deep transition-colors">
            {saving ? 'Enregistrement...' : 'Créer le produit'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink-soft">
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prix (OMR)</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Mis en avant</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/10">
                <td className="px-4 py-3">
                  <img src={p.images?.[0]} alt="" className="w-12 h-14 object-cover rounded-lg bg-cream-deep" />
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate text-ink">{p.name}</td>
                <td className="px-4 py-3 text-ink-soft">{p.category}</td>
                <td className="px-4 py-3">
                  <input
                    type="number" step="0.01" defaultValue={p.price ?? ''}
                    onBlur={(e) => updateField(p.id, 'price', e.target.value ? Number(e.target.value) : null)}
                    className="w-24 border border-ink/15 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gold/40"
                    placeholder="—"
                  />
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={p.active ?? true} onChange={(e) => updateField(p.id, 'active', e.target.checked)} />
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={p.featured ?? false} onChange={(e) => updateField(p.id, 'featured', e.target.checked)} />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
