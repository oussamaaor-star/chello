import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle,
  Loader2, Gift, User, Phone, Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { findMemberByPhone, addLoyaltyVisit, currentCycle, isRewardReady } from '../../utils/loyalty';

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('ar-OM', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(amount) + ' ر.ع.';
}

export default function CashierPOS() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const inputRef = useRef(null);

  // Loyalty state
  const [loyaltyMember, setLoyaltyMember] = useState(null);
  const [loyaltySearching, setLoyaltySearching] = useState(false);
  const [loyaltyNotFound, setLoyaltyNotFound] = useState(false);
  const phoneDebounce = useRef(null);

  // Post-sale feedback
  const [saleResult, setSaleResult] = useState(null);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, slug, price, images, sizes, active')
      .eq('active', true)
      .order('name')
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  // Auto-search loyalty member when phone changes
  const searchLoyalty = useCallback(async (phone) => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 4) {
      setLoyaltyMember(null);
      setLoyaltyNotFound(false);
      return;
    }

    setLoyaltySearching(true);
    setLoyaltyNotFound(false);
    const member = await findMemberByPhone(phone);
    setLoyaltySearching(false);

    if (member) {
      setLoyaltyMember(member);
      setLoyaltyNotFound(false);
      if (!customerName.trim()) setCustomerName(member.full_name);
    } else {
      setLoyaltyMember(null);
      setLoyaltyNotFound(true);
    }
  }, [customerName]);

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setCustomerPhone(val);
    setSaleResult(null);

    clearTimeout(phoneDebounce.current);
    phoneDebounce.current = setTimeout(() => searchLoyalty(val), 500);
  };

  const filtered = search.trim()
    ? products.filter((p) => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      })
    : products;

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price ?? 0,
        image: product.images?.[0] ?? '/products/placeholder-dresses.svg',
        quantity: 1,
        selectedSize: product.sizes?.[0] ?? null,
      }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev
      .map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c)
      .filter((c) => c.quantity > 0));
  };

  const updateSize = (id, size) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, selectedSize: size } : c));
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setSaleResult(null);

    const items = cart.map((c) => ({
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      size: c.selectedSize,
      product_id: c.id,
    }));

    const { error } = await supabase.from('orders').insert({
      full_name: customerName.trim() || 'Vente en caisse',
      phone: customerPhone.trim() || null,
      city: 'Seeb',
      address: 'Al Araimi Boulevard — Vente en boutique',
      items,
      total,
      subtotal: total,
      shipping_cost: 0,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'cash',
      notes: `Vente en caisse par ${user?.name ?? 'Caissier'}`,
    });

    if (error) {
      setSubmitting(false);
      return;
    }

    // Auto-stamp loyalty if member found
    let loyaltyResult = null;
    if (loyaltyMember) {
      loyaltyResult = await addLoyaltyVisit(loyaltyMember.id);
    }

    setSubmitting(false);

    setSaleResult({
      total,
      customerName: customerName.trim() || 'Client',
      loyalty: loyaltyResult,
    });

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setLoyaltyMember(null);
    setLoyaltyNotFound(false);
  };

  const dismissResult = () => setSaleResult(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-ink">Nouvelle vente</h1>

      {/* Sale success overlay */}
      {saleResult && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={dismissResult}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-ink mb-1">Vente enregistrée !</h2>
            <p className="text-ink-soft text-sm mb-2">{saleResult.customerName}</p>
            <p className="text-2xl font-bold text-ink mb-6">{formatCurrency(saleResult.total)}</p>

            {saleResult.loyalty ? (
              <div className={`rounded-2xl p-5 mb-6 ${saleResult.loyalty.rewardReady ? 'bg-gold/10 border-2 border-gold' : 'bg-cream-deep border border-ink/10'}`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {saleResult.loyalty.rewardReady ? (
                    <Sparkles className="w-5 h-5 text-gold" />
                  ) : (
                    <Gift className="w-5 h-5 text-gold" />
                  )}
                  <p className="text-sm font-bold text-ink">
                    {saleResult.loyalty.rewardReady
                      ? '🎉 Récompense débloquée !'
                      : 'Fidélité mise à jour'}
                  </p>
                </div>

                <div className="flex justify-center gap-1.5 mb-3">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full border-2 transition-colors ${
                        i < saleResult.loyalty.stamps
                          ? 'bg-gold border-gold'
                          : 'bg-white border-ink/15'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-ink-soft">
                  <span className="font-bold text-ink">{saleResult.loyalty.stamps}/8</span> tampons
                  {saleResult.loyalty.cycles > 0 && (
                    <span> — {saleResult.loyalty.cycles} cycle{saleResult.loyalty.cycles > 1 ? 's' : ''} complété{saleResult.loyalty.cycles > 1 ? 's' : ''}</span>
                  )}
                </p>

                {saleResult.loyalty.rewardReady && (
                  <p className="text-sm font-semibold text-gold-deep mt-2">
                    Informez la cliente de sa récompense !
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-cream-deep rounded-2xl p-4 mb-6 border border-ink/10">
                <p className="text-xs text-ink-soft">
                  Pas de compte fidélité associé à ce numéro.
                </p>
              </div>
            )}

            <button
              onClick={dismissResult}
              className="w-full bg-ink text-cream py-3 rounded-xl font-bold text-sm hover:bg-ink/90 transition-colors"
            >
              Nouvelle vente
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Catalogue — 3/5 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher un produit..."
              className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-ink-soft text-center py-8">Aucun produit trouvé.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden text-left hover:border-gold/30 hover:shadow-md transition-all group"
                >
                  <div className="aspect-square bg-cream-deep overflow-hidden">
                    <img
                      src={p.images?.[0] ?? '/products/placeholder-dresses.svg'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-ink leading-snug line-clamp-2 mb-1">{p.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gold-deep">
                        {p.price != null ? formatCurrency(p.price) : 'Sur demande'}
                      </p>
                      <Plus className="w-4 h-4 text-ink-soft group-hover:text-gold transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panier — 2/5 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-ink/10 shadow-sm sticky top-20">
            <div className="px-5 py-4 border-b border-ink/5 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-ink-soft">Panier ({cart.length})</h2>
            </div>

            {cart.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-ink-soft">Ajoutez des produits au panier</p>
              </div>
            ) : (
              <div className="divide-y divide-ink/5 max-h-[30vh] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="px-5 py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-14 rounded-xl overflow-hidden bg-cream-deep flex-shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/products/placeholder-dresses.svg'; e.target.onerror = null; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink leading-snug line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gold-deep font-bold mt-0.5">{formatCurrency(item.price)}</p>
                        {item.selectedSize && (
                          <select
                            value={item.selectedSize}
                            onChange={(e) => updateSize(item.id, e.target.value)}
                            className="mt-1 text-[10px] border border-ink/10 rounded-lg px-1.5 py-0.5 bg-cream-deep"
                          >
                            {(products.find((p) => p.id === item.id)?.sizes ?? []).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-ink-soft/40 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg border border-ink/15 flex items-center justify-center hover:bg-cream-deep transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-ink w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg border border-ink/15 flex items-center justify-center hover:bg-cream-deep transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-ink">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Client + Fidélité */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-ink/5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Client & fidélité</p>

                {/* Phone — triggers loyalty lookup */}
                <div className="relative">
                  <Phone size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
                  <input
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="Numéro de téléphone du client"
                    className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                  {loyaltySearching && (
                    <Loader2 size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-ink-soft animate-spin" />
                  )}
                </div>

                {/* Loyalty member found */}
                {loyaltyMember && (
                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-gold" />
                        <span className="text-xs font-bold text-ink">{loyaltyMember.full_name}</span>
                      </div>
                      {isRewardReady(loyaltyMember.visits_count) && (
                        <span className="text-[10px] font-bold text-gold-deep bg-gold/10 px-2 py-0.5 rounded-full">
                          🎁 Récompense !
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded-full border-2 ${
                              i < currentCycle(loyaltyMember.visits_count)
                                ? 'bg-gold border-gold'
                                : 'bg-white border-ink/15'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-ink-soft font-medium">
                        {currentCycle(loyaltyMember.visits_count)}/8
                      </span>
                    </div>
                    <p className="text-[10px] text-ink-soft mt-1.5">
                      +1 tampon sera ajouté automatiquement à l'encaissement
                    </p>
                  </div>
                )}

                {/* Not found */}
                {loyaltyNotFound && customerPhone.replace(/[^0-9]/g, '').length >= 4 && (
                  <p className="text-xs text-ink-soft/70 px-1">
                    Pas de compte fidélité avec ce numéro
                  </p>
                )}

                {/* Name */}
                <div className="relative">
                  <User size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nom du client (optionnel)"
                    className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
              </div>
            )}

            {/* Total + bouton */}
            <div className="px-5 py-4 border-t border-ink/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-ink-soft uppercase tracking-wider">Total</span>
                <span className="text-xl font-bold text-ink">{formatCurrency(total)}</span>
              </div>
              <button
                onClick={submitOrder}
                disabled={cart.length === 0 || submitting}
                className="w-full flex items-center justify-center gap-2 bg-ink text-cream py-3.5 rounded-xl font-bold text-sm hover:bg-ink/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {submitting ? 'Enregistrement...' : 'Encaisser la vente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
