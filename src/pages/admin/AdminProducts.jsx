import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, UploadCloud, X, Loader2, ImageIcon, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { invalidateCatalogueCache } from '../../hooks/useCatalogue';
import categoriesData from '../../data/categories.json';

const PAGE_SIZE = 20;
const EMPTY_FORM = { name: '', category: 'dresses', price: '', description: '', sizes: '' };
const PLACEHOLDER_IMG = '/products/placeholder-dresses.svg';
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, (ext) => ext) // keep extension
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Drag-and-drop image uploader (Supabase Storage: product-images) ──────────

function ImageUploader({ images, setImages }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (files.length === 0) {
      setError('Only JPG, PNG or WEBP images are accepted.');
      return;
    }
    setError('');
    setUploading(true);

    for (const file of files) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${sanitizeName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) {
        setError(`Upload failed for ${file.name}. Please retry.`);
        continue;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      if (data?.publicUrl) {
        setImages((prev) => [...prev, data.publicUrl]);
      }
    }

    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const handleSelect = (e) => {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = ''; // allow re-selecting the same file
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="sm:col-span-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Product photos</p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-ink/40 bg-cream-deep'
            : 'border-ink/15 bg-cream hover:bg-cream-deep/60'
        }`}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-ink/5 text-ink-soft">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
        </span>
        <p className="text-sm text-ink">
          {uploading ? 'Uploading…' : <><span className="font-semibold">Drag &amp; drop</span> photos here</>}
        </p>
        <p className="text-[11px] text-ink-soft">or click to browse · JPG, PNG, WEBP</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleSelect}
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
          {images.map((url) => (
            <div key={url} className="relative group aspect-[4/5] rounded-xl overflow-hidden border border-ink/8 bg-cream-deep">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(url); }}
                className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink/80 text-cream hover:bg-ink transition-colors"
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {uploading && (
            <div className="aspect-[4/5] rounded-xl border border-dashed border-ink/15 bg-cream flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-ink-soft" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]); // uploaded public URLs
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // ── Édition d'un produit existant (nom / description / catégorie / tailles / images) ──
  const [editing, setEditing] = useState(null);   // produit en cours d'édition | null
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editImages, setEditImages] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const openEdit = (p) => {
    setEditError('');
    setEditing(p);
    setEditForm({
      name: p.name ?? '',
      category: p.category ?? 'dresses',
      price: p.price != null ? String(p.price) : '',
      description: p.description ?? '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes ?? ''),
    });
    setEditImages(Array.isArray(p.images) ? p.images : []);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setEditSaving(true);
    setEditError('');
    const patch = {
      name: editForm.name,
      category: editForm.category,
      price: editForm.price ? Number(editForm.price) : null,
      description: editForm.description,
      images: editImages,
      sizes: editForm.sizes.split(',').map((s) => s.trim()).filter(Boolean),
    };
    // .select() : un UPDATE bloqué par RLS renvoie error=null + 0 ligne → faux succès.
    const { data, error } = await supabase
      .from('products')
      .update(patch)
      .eq('id', editing.id)
      .select('*');
    setEditSaving(false);
    if (error || !data || data.length === 0) {
      setEditError('Update failed — the product was not saved.');
      return;
    }
    setProducts((ps) => ps.map((p) => (p.id === editing.id ? data[0] : p)));
    invalidateCatalogueCache();
    closeEdit();
  };

  const load = async (p = page) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    setProducts(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const updateField = async (id, field, value) => {
    const prev = products.find((p) => p.id === id)?.[field];
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    // .select() : un UPDATE bloqué par RLS renvoie error=null + 0 ligne.
    // On rollback aussi dans ce cas (faux succès silencieux).
    const { data, error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', id)
      .select('id');
    if (error || !data || data.length === 0) {
      setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: prev } : p)));
      setActionError("Update failed — the change was not saved.");
      return;
    }
    invalidateCatalogueCache();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This action is permanent.')) return;
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('id');
    if (error || !data || data.length === 0) {
      setActionError('Delete failed — the product was not removed.');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    invalidateCatalogueCache();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '');
    const { error } = await supabase.from('products').insert({
      name: form.name,
      slug: slug || `product-${Date.now()}`,
      category: form.category,
      price: form.price ? Number(form.price) : null,
      description: form.description,
      images,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      active: true,
      in_stock: true,
    });
    setSaving(false);
    if (error) {
      setActionError('Could not create the product. Please try again.');
      return;
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setImages([]);
    invalidateCatalogueCache();
    // Le nouveau produit est le plus récent → on revient en page 0 pour le voir.
    if (page === 0) load(0);
    else setPage(0);
  };

  const inputClass = 'border border-ink/15 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 bg-white focus:outline-none focus:ring-2 focus:ring-silver/40';

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ink-soft text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">
            Products <span className="text-ink-soft font-sans text-lg">({total})</span>
          </h1>
          <p className="text-sm text-ink-soft mt-0.5">Manage your catalog.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-ink text-cream rounded-xl px-4 py-2 text-sm font-medium hover:bg-ink-soft transition-colors shadow-sm"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      {/* ── Action error banner ── */}
      {actionError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-500 hover:text-red-700" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Create form ── */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-ink/8 rounded-2xl shadow-sm p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputClass}>
            {categoriesData.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          <input placeholder="Price (OMR)" type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputClass} />
          <input placeholder="Sizes (comma-separated, e.g. S,M,L)" value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} className={inputClass} />

          <ImageUploader images={images} setImages={setImages} />

          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputClass} sm:col-span-2`} rows={2} />

          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-cream font-semibold rounded-xl px-4 py-2.5 sm:col-span-2 disabled:opacity-50 hover:bg-ink-soft transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Saving…' : 'Create product'}
          </button>
        </form>
      )}

      {/* ── Products table ── */}
      <div className="bg-white border border-ink/8 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-ink-soft bg-cream-deep text-left">
                <th className="px-4 py-3 font-bold">Image</th>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Price (OMR)</th>
                <th className="px-4 py-3 font-bold text-center">Active</th>
                <th className="px-4 py-3 font-bold text-center">In stock</th>
                <th className="px-4 py-3 font-bold text-center">Featured</th>
                <th className="px-4 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-ink-soft/50" />
                      </div>
                      <p className="text-sm font-medium text-ink">No products yet</p>
                      <p className="text-xs text-ink-soft">Add your first product to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-cream-deep/40 transition-colors">
                  <td className="px-4 py-3">
                    <img
                      src={p.images?.[0] ?? PLACEHOLDER_IMG}
                      alt=""
                      className="w-12 h-14 object-cover rounded-lg bg-cream-deep border border-ink/8"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMG; e.target.onerror = null; }}
                    />
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-ink font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-ink-soft uppercase tracking-wide text-xs">{p.category}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number" step="0.01" defaultValue={p.price ?? ''}
                      onBlur={(e) => updateField(p.id, 'price', e.target.value ? Number(e.target.value) : null)}
                      className="w-24 border border-ink/15 rounded-lg px-2 py-1 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-silver/40"
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={p.active ?? true} onChange={(e) => updateField(p.id, 'active', e.target.checked)} className="w-4 h-4 accent-ink cursor-pointer align-middle" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={p.in_stock ?? true} onChange={(e) => updateField(p.id, 'in_stock', e.target.checked)} title="Uncheck = out of stock" className="w-4 h-4 accent-ink cursor-pointer align-middle" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={p.featured ?? false} onChange={(e) => updateField(p.id, 'featured', e.target.checked)} className="w-4 h-4 accent-ink cursor-pointer align-middle" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors" aria-label="Edit product" title="Edit product">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ink-soft hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete product" title="Delete product">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Page {page + 1} of {totalPages} · {total} product{total !== 1 ? 's' : ''}</span>
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

      {/* ── Edit product modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={closeEdit} />
          <form
            onSubmit={handleUpdate}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="sm:col-span-2 flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Edit product</h2>
              <button type="button" onClick={closeEdit} className="text-ink-soft hover:text-ink" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <input required placeholder="Product name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
            <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} className={inputClass}>
              {categoriesData.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
            <input placeholder="Price (OMR)" type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className={inputClass} />
            <input placeholder="Sizes (comma-separated, e.g. S,M,L)" value={editForm.sizes} onChange={(e) => setEditForm((f) => ({ ...f, sizes: e.target.value }))} className={inputClass} />

            <ImageUploader images={editImages} setImages={setEditImages} />

            <textarea placeholder="Description" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className={`${inputClass} sm:col-span-2`} rows={3} />

            {editError && <p className="sm:col-span-2 text-sm text-red-600">{editError}</p>}

            <div className="sm:col-span-2 flex gap-3 justify-end pt-1">
              <button type="button" onClick={closeEdit} className="px-5 py-2.5 rounded-xl border border-ink/10 text-sm font-medium text-ink-soft hover:bg-cream-deep transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={editSaving} className="flex items-center gap-2 bg-ink text-cream font-semibold rounded-xl px-5 py-2.5 disabled:opacity-50 hover:bg-ink-soft transition-colors">
                {editSaving && <Loader2 size={16} className="animate-spin" />}
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
