import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ShoppingCart, CheckCircle,
  Loader2, Gift, User, Phone, PackageX,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { findMemberByPhone, getLoyaltyConfig, calculatePoints, addPoints, getBestReward } from '../../utils/loyalty';
import { formatCurrency } from '../../utils/cashierFormat';
import { SaleSuccessOverlay } from '../../components/cashier/SaleSuccessOverlay';
import { PosProductGrid } from '../../components/cashier/PosProductGrid';
import { PosCartItem } from '../../components/cashier/PosCartItem';

export default function CashierPOS() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockError, setStockError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const inputRef = useRef(null);

  // Loyalty state
  const [loyaltyMember, setLoyaltyMember] = useState(null);
  const [loyaltySearching, setLoyaltySearching] = useState(false);
  const [loyaltyNotFound, setLoyaltyNotFound] = useState(false);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const phoneDebounce = useRef(null);

  // Post-sale feedback
  const [saleResult, setSaleResult] = useState(null);
  const [phoneError, setPhoneError] = useState(false);
  const [orderError, setOrderError] = useState(false);

  useEffect(() => {
    getLoyaltyConfig().then(setLoyaltyConfig);
  }, []);

  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    const [productsRes, stockRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, price, images, sizes, active')
        .eq('active', true)
        .order('name'),
      supabase.from('product_stock').select('product_id, stock'),
    ]);

    setProducts(productsRes.data ?? []);

    // product_stock.stock === 0 => out of stock ; null => not tracked (unlimited).
    // A positive number (if the view ever becomes a counted table) is the cap.
    const map = {};
    (stockRes.data ?? []).forEach((s) => { map[s.product_id] = s.stock; });
    setStockMap(map);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  // Available stock for a product. null => untracked / unlimited.
  const getStock = useCallback((id) => {
    const s = stockMap[id];
    return s === undefined ? null : s;
  }, [stockMap]);

  // How many more units can still be added, given what's already in the cart.
  // Returns Infinity when the product is not tracked.
  const remainingStock = useCallback((id) => {
    const stock = getStock(id);
    if (stock == null) return Infinity;
    const inCart = cart.find((c) => c.id === id)?.quantity ?? 0;
    return stock - inCart;
  }, [getStock, cart]);

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
    setPhoneError(false);
    setOrderError(false);
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
    const stock = getStock(product.id);

    // Hard out-of-stock: never allow it into the cart.
    if (stock === 0) {
      setStockError(`${product.name} is out of stock.`);
      return;
    }

    // Tracked quantity: block adding one more than what's available.
    if (stock != null && remainingStock(product.id) <= 0) {
      setStockError(`Only ${stock} of "${product.name}" in stock.`);
      return;
    }

    setStockError(null);
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
    if (delta > 0) {
      const stock = getStock(id);
      if (stock != null && remainingStock(id) <= 0) {
        setStockError(`Only ${stock} in stock for this item.`);
        return;
      }
    }
    setStockError(null);
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

    // Anti-oversell guard at checkout (stock may have changed since items
    // were added). Block the whole sale if any line exceeds available stock.
    const offender = cart.find((c) => {
      const stock = getStock(c.id);
      return stock != null && c.quantity > stock;
    });
    if (offender) {
      const stock = getStock(offender.id);
      setStockError(
        stock === 0
          ? `${offender.name} is out of stock — remove it to continue.`
          : `Only ${stock} of "${offender.name}" in stock — reduce the quantity.`,
      );
      return;
    }

    // Oman phone: 8 digits starting with 7 or 9 (when a number is provided).
    const digits = customerPhone.replace(/[^0-9]/g, '');
    if (customerPhone.trim() && !/^[79]\d{7}$/.test(digits)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    setOrderError(false);
    setStockError(null);
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
      full_name: customerName.trim() || 'In-store sale',
      phone: customerPhone.trim() || null,
      city: 'Seeb',
      address: 'Al Araimi Boulevard — In-store sale',
      items,
      total,
      subtotal: total,
      shipping_cost: 0,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'cash',
      user_id: user?.id ?? null,
      notes: `In-store sale by ${user?.name ?? 'Cashier'}`,
    });

    if (error) {
      setSubmitting(false);
      setOrderError(true);
      return;
    }

    // Credit loyalty points ONCE here, at the cashed sale. The toast shows the
    // authoritative balance (newTotal) returned by the RPC, never a local calc.
    let loyaltyResult = null;
    if (loyaltyMember && loyaltyConfig) {
      const pts = calculatePoints(total, loyaltyConfig);
      if (pts > 0) {
        const newTotal = await addPoints(loyaltyMember.id, pts, 'earned', 'cashier', total);
        if (newTotal != null) {
          loyaltyResult = {
            pointsEarned: pts,
            newBalance: newTotal,
            memberName: loyaltyMember.full_name,
            bestReward: getBestReward(newTotal, loyaltyConfig.reward_tiers),
          };
        }
      }
    }

    setSubmitting(false);

    setSaleResult({
      total,
      customerName: customerName.trim() || 'Customer',
      loyalty: loyaltyResult,
    });

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setLoyaltyMember(null);
    setLoyaltyNotFound(false);
    setStockError(null);
    // Refresh stock so the next sale reflects what was just sold.
    loadCatalogue();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-ink">New Sale</h1>
        <p className="text-sm text-ink-soft mt-0.5">Ring up an in-store purchase</p>
      </div>

      {/* Sale success overlay */}
      {saleResult && (
        <SaleSuccessOverlay result={saleResult} onDismiss={() => setSaleResult(null)} />
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
              placeholder="Search for a product..."
              className="w-full border border-ink/15 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40 bg-white"
            />
          </div>

          <PosProductGrid
            products={filtered}
            loading={loading}
            getStock={getStock}
            remainingStock={remainingStock}
            onAdd={addToCart}
          />
        </div>

        {/* Panier — 2/5 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-ink/8 shadow-sm sticky top-20">
            <div className="px-5 py-4 border-b border-ink/5 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-silver" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Cart ({cart.length})</h2>
            </div>

            {cart.length === 0 ? (
              <div className="px-5 py-12 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-3">
                  <ShoppingCart className="w-6 h-6 text-silver" />
                </div>
                <p className="text-sm font-semibold text-ink">Cart is empty</p>
                <p className="text-xs text-ink-soft mt-0.5">Tap a product to add it.</p>
              </div>
            ) : (
              <div className="divide-y divide-ink/5 max-h-[30vh] overflow-y-auto">
                {cart.map((item) => (
                  <PosCartItem
                    key={item.id}
                    item={item}
                    sizes={products.find((p) => p.id === item.id)?.sizes ?? []}
                    remaining={remainingStock(item.id)}
                    onQty={updateQty}
                    onSize={updateSize}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}

            {/* Client + Fidélité */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-ink/5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Customer & Loyalty</p>

                {/* Phone — triggers loyalty lookup */}
                <div className="relative">
                  <Phone size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
                  <input
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="Customer phone number"
                    className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                  />
                  {loyaltySearching && (
                    <Loader2 size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-ink-soft animate-spin" />
                  )}
                </div>

                {/* Loyalty member found */}
                {loyaltyMember && (
                  <div className="bg-silver/5 border border-silver/20 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-silver" />
                        <span className="text-xs font-bold text-ink">{loyaltyMember.full_name}</span>
                      </div>
                      <span className="text-xs font-bold text-ink bg-silver/10 px-2 py-0.5 rounded-full">
                        {loyaltyMember.points ?? 0} pts
                      </span>
                    </div>
                    {loyaltyConfig && total > 0 && (
                      <p className="text-[10px] text-ink-soft">
                        +{calculatePoints(total, loyaltyConfig)} points will be added at checkout
                      </p>
                    )}
                    {loyaltyConfig && getBestReward(loyaltyMember.points ?? 0, loyaltyConfig.reward_tiers) && (
                      <p className="text-[10px] text-silver-deep font-medium mt-1">
                        🎁 Has a reward available!
                      </p>
                    )}
                  </div>
                )}

                {/* Phone error */}
                {phoneError && (
                  <p className="text-xs text-red-500 px-1">Invalid Oman number — 8 digits starting with 7 or 9.</p>
                )}

                {/* Not found */}
                {loyaltyNotFound && customerPhone.replace(/[^0-9]/g, '').length >= 4 && (
                  <p className="text-xs text-ink-soft/70 px-1">
                    No loyalty account with this number
                  </p>
                )}

                {/* Name */}
                <div className="relative">
                  <User size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-soft" />
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name (optional)"
                    className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
                  />
                </div>
              </div>
            )}

            {/* Total + bouton */}
            <div className="px-5 py-4 border-t border-ink/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Total</span>
                <span className="text-2xl font-serif text-ink">{formatCurrency(total)}</span>
              </div>
              {stockError && (
                <div className="mb-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <PackageX className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium">{stockError}</p>
                </div>
              )}
              {orderError && (
                <p className="text-xs text-red-500 mb-2">Error saving. Please try again.</p>
              )}
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
                {submitting ? 'Saving...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
