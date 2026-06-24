import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, Truck, Package, X,
  MapPin, CreditCard, ShoppingBag, Loader2, AlertCircle,
  Star, Zap, BadgeCheck, ExternalLink, Tag, Download,
} from 'lucide-react';
import { trackInvoiceDownload } from '../../lib/analytics';
import { supabase }   from '../../lib/supabase';
import { useAuth }    from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

// Étapes du tracker selon le statut courant (order — les labels seront définis dans le composant)
const STEP_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// ─── Composant : ligne article ────────────────────────────────────────────────

function OrderItemRow({ item, imageUrl }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-start gap-4 py-4 border-b border-ink/10 last:border-0">
      {/* Miniature */}
      <div className="w-16 h-16 rounded-xl bg-cream-deep border border-ink/10 flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-ink-soft" />
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink leading-snug truncate">
          {item.product_name}
        </p>
        {item.brand && (
          <p className="text-xs text-ink-soft mt-0.5">{item.brand}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {item.selected_size && (
            <span className="text-xs bg-cream-deep border border-ink/10 text-ink-soft px-2 py-0.5 rounded-md">
              {item.selected_size}
            </span>
          )}
          <span className="text-xs text-ink-soft">{t('orderDetailQte')} : {item.quantity}</span>
          <span className="text-xs text-ink-soft">
            {Number(item.unit_price).toFixed(2)} OMR / {t('orderDetailUnite')}
          </span>
        </div>
      </div>

      {/* Total ligne */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-bold text-ink">
          {Number(item.line_total).toFixed(2)} OMR
        </p>
      </div>
    </div>
  );
}

// ─── Helper : URL transporteur ───────────────────────────────────────────────

const CARRIER_CONFIG = {
  amana:      { label: 'Amana',         url: (n) => `https://www.amana.ma/track?ref=${n}` },
  aramex:     { label: 'Aramex',        url: (n) => `https://www.aramex.com/track/results?mode=0&ShipmentNumber=${n}` },
  zr_express: { label: 'ZR Express',    url: (n) => `https://zrexpresse.com/tracking?num=${n}` },
  sendex:     { label: 'Sendex',        url: (n) => `https://sendex.ma/suivi?code=${n}` },
  barid:      { label: 'Barid Al-Maghrib', url: (n) => `https://www.poste.ma/suivi?code=${n}` },
  dhl:        { label: 'DHL',           url: (n) => `https://www.dhl.com/ma-fr/home/tracking.html?tracking-id=${n}` },
};

// ─── Composant : carte info ───────────────────────────────────────────────────

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-ink-soft" />
        </div>
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-deep">{title}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function OrderDetail() {
  const { t, lang }             = useLanguage();
  const { id }                  = useParams();
  const { user }                = useAuth();

  // ── Status config (inside component so t() is available) ─────────────────
  const STATUS = {
    pending:    { label: t('orderStatusEnAttente'),  bg: 'bg-cream-deep',     text: 'text-ink-soft',      border: 'border-ink/10',       icon: Clock       },
    confirmed:  { label: t('orderStatusConfirmee'),  bg: 'bg-blue-50',        text: 'text-blue-600',      border: 'border-blue-200',     icon: CheckCircle },
    processing: { label: t('orderStatusEnCours'),    bg: 'bg-gold/10',        text: 'text-gold-deep',     border: 'border-gold/20',      icon: Clock       },
    shipped:    { label: t('orderStatusEnLivraison'),bg: 'bg-indigo-50',      text: 'text-indigo-600',    border: 'border-indigo-200',   icon: Truck       },
    delivered:  { label: t('orderStatusLivree'),     bg: 'bg-emerald-50',     text: 'text-emerald-600',   border: 'border-emerald-200',  icon: CheckCircle },
    cancelled:  { label: t('orderStatusAnnulee'),    bg: 'bg-red-50',         text: 'text-red-500',       border: 'border-red-200',      icon: X           },
  };

  const PAYMENT_STATUS = {
    pending:        { label: t('payStatusEnAttente'), color: 'text-ink-soft'     },
    paid:           { label: t('payStatusPaye'),      color: 'text-emerald-600'  },
    simulated_paid: { label: t('payStatusSimule'),    color: 'text-blue-600'    },
    failed:         { label: t('payStatusEchoue'),    color: 'text-red-500'     },
    refunded:       { label: t('payStatusRembourse'), color: 'text-gold'        },
  };

  const TRACKER_STEPS = [
    { key: 'confirmed',  icon: CheckCircle, label: t('trackerConfirmee')  },
    { key: 'processing', icon: Package,     label: t('trackerPreparation')},
    { key: 'shipped',    icon: Truck,       label: t('trackerEnRoute')    },
    { key: 'delivered',  icon: Star,        label: t('trackerLivree')     },
  ];
  const navigate                = useNavigate();
  const [order, setOrder]               = useState(null);
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!user || !id) { setLoading(false); return; }
    loadOrder();
  }, [id, user?.id]);

  const loadOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .eq('user_id', user.id)   // sécurité : uniquement les commandes de l'utilisateur
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setOrder(data);

    // Récupère les images depuis Supabase pour tous les produits de la commande
    const productIds = (data.order_items ?? []).map((i) => i.product_id).filter(Boolean);
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, images')
        .in('id', productIds);

      if (products) {
        const imageMap = {};
        for (const p of products) {
          // images est un tableau JSONB ; on prend la première URL disponible
          imageMap[p.id] = Array.isArray(p.images) ? (p.images[0] ?? null) : null;
        }
        setProductImages(imageMap);
      }
    }

    setLoading(false);
  };

  const downloadInvoice = async () => {
    if (!order) return;
    try {
      const { generateInvoice } = await import('../../utils/generateInvoice');
      generateInvoice(order);
      trackInvoiceDownload(order.id);
    } catch (err) {
      console.error('[Invoice]', err.message);
    }
  };

  // ── Données dérivées ────────────────────────────────────────────────────────

  const ref = order?.id.replace(/-/g, '').slice(0, 8).toUpperCase() ?? '';
  const cfg = STATUS[order?.status] ?? STATUS.confirmed;
  const StatusIcon = cfg.icon;

  const dateLocale = lang === 'ar' ? 'ar-MA' : 'fr-FR';
  const orderDate = order
    ? new Date(order.created_at).toLocaleDateString(dateLocale, {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const currentStepIdx = STEP_ORDER.indexOf(order?.status ?? 'confirmed');
  const snap           = order?.shipping_address_snapshot;

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-ink-soft animate-spin" />
      </div>
    );
  }

  // ── Commande introuvable ─────────────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/compte/commandes')}
          className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />{t('ordersTitle')}
        </button>
        <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-serif text-ink mb-2">{t('orderDetailNotFound')}</h3>
          <p className="text-sm text-ink-soft max-w-xs mx-auto mb-6 leading-relaxed">
            {t('orderDetailNotFoundDesc')}
          </p>
          <Link
            to="/compte/commandes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cream-deep text-cream rounded-xl text-sm font-semibold hover:bg-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />{t('orderDetailRetour')}
          </Link>
        </div>
      </div>
    );
  }

  // ── Page détail ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Retour + breadcrumb ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/compte/commandes')}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('orderDetailRetour')}</span>
        </button>
        <span className="text-ink-soft/60">/</span>
        <span className="text-sm font-semibold text-ink font-mono">#{ref}</span>
      </div>

      {/* ── En-tête commande ── */}
      <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icône statut */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
              <StatusIcon className={`w-5 h-5 ${cfg.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-lg font-black text-ink font-mono tracking-wider">
                  #{ref}
                </p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <StatusIcon className="w-3 h-3" />{cfg.label}
                </span>
              </div>
              <p className="text-sm text-ink-soft">{orderDate}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 sm:flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-ink-soft mb-0.5">{t('orderDetailTotalCmd')}</p>
              <p className="text-2xl font-black text-ink">
                {Number(order.total).toFixed(2)} OMR
              </p>
            </div>
            {/* Download Invoice Button - always visible for orders */}
            <button
              onClick={downloadInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/10 bg-cream text-xs font-semibold text-ink hover:bg-cream hover:border-ink/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {t('orderDetailFacture')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tracker ── */}
      {order.status !== 'cancelled' && (
        <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-5">{t('orderDetailSuivi')}</p>
          <div className="flex items-start">
            {TRACKER_STEPS.map(({ key, icon: Icon, label }, idx) => {
              const stepIdx  = STEP_ORDER.indexOf(key);
              const isDone   = stepIdx <= currentStepIdx;
              const isActive = stepIdx === currentStepIdx;
              return (
                <div key={key} className="flex-1 flex flex-col items-center text-center">
                  <div className="flex items-center w-full mb-2">
                    <div className={`flex-1 h-0.5 ${idx === 0 ? 'invisible' : isDone ? 'bg-emerald-500' : 'bg-ink/10'}`} />
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ${
                      isActive
                        ? 'bg-emerald-500 ring-emerald-500/30'
                        : isDone
                        ? 'bg-emerald-600 ring-transparent'
                        : 'bg-cream ring-transparent'
                    }`}>
                      <Icon className={`w-4 h-4 ${isDone ? 'text-cream' : 'text-ink-soft'}`} />
                    </div>
                    <div className={`flex-1 h-0.5 ${idx === TRACKER_STEPS.length - 1 ? 'invisible' : isDone && stepIdx < currentStepIdx ? 'bg-emerald-500' : 'bg-ink/10'}`} />
                  </div>
                  <p className={`text-[10px] font-semibold leading-snug px-1 ${
                    isActive ? 'text-emerald-400' : isDone ? 'text-ink' : 'text-ink-soft'
                  }`}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Corps : 2 colonnes lg ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── Colonne principale : articles ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Articles */}
          <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                {t('orderDetailArticles')}
              </p>
              <span className="text-xs text-ink-soft bg-cream border border-ink/10 px-2.5 py-1 rounded-full">
                {order.order_items?.length ?? 0} {(order.order_items?.length ?? 0) > 1 ? t('orderDetailArticles2') : t('orderDetailArticle')}
              </span>
            </div>
            <div className="divide-y divide-ink/10">
              {order.order_items?.length > 0
                ? order.order_items.map((item) => (
                    <OrderItemRow
                      key={item.id}
                      item={item}
                      imageUrl={productImages[item.product_id] ?? null}
                    />
                  ))
                : (
                  <p className="text-sm text-ink-soft py-6 text-center">
                    {t('orderDetailAucunArticle')}
                  </p>
                )
              }
            </div>
          </div>

        </div>

        {/* ── Colonne latérale : récap + livraison + paiement ── */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">

          {/* Totaux */}
          <InfoCard icon={ShoppingBag} title={t('orderDetailRecap')}>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">{t('cartSousTotal')}</span>
                <span className="font-semibold text-ink">
                  {Number(order.subtotal).toFixed(2)} OMR
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">{t('orderDetailLivraison')}</span>
                <span className={`font-semibold ${Number(order.shipping_cost) === 0 ? 'text-emerald-400' : 'text-ink'}`}>
                  {Number(order.shipping_cost) === 0
                    ? t('checkoutGratuite')
                    : `${Number(order.shipping_cost).toFixed(2)} OMR`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-ink/10">
                <span className="font-bold text-ink">{t('orderDetailTotal')}</span>
                <span className="text-lg font-black text-ink">
                  {Number(order.total).toFixed(2)} OMR
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Livraison */}
          <InfoCard icon={Truck} title={t('orderDetailLivraisonTitle')}>
            <div className="space-y-3">
              {/* Méthode */}
              <div className="flex items-center gap-2">
                {order.delivery_method === 'express' ? (
                  <Zap className="w-4 h-4 text-gold flex-shrink-0" />
                ) : (
                  <Truck className="w-4 h-4 text-ink-soft flex-shrink-0" />
                )}
                <span className="text-sm text-ink font-medium">
                  {order.delivery_method === 'express'
                    ? t('orderDetailLivraisonExpress')
                    : t('orderDetailLivraisonStandard')}
                </span>
              </div>

              {/* Adresse snapshot */}
              {snap && (
                <div className="bg-cream rounded-xl p-3 space-y-0.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-ink-soft flex-shrink-0 mt-0.5" />
                    <div>
                      {snap.full_name && (
                        <p className="text-sm font-semibold text-ink">{snap.full_name}</p>
                      )}
                      {snap.address_line_1 && (
                        <p className="text-xs text-ink-soft">{snap.address_line_1}</p>
                      )}
                      {(snap.postal_code || snap.city) && (
                        <p className="text-xs text-ink-soft">
                          {[snap.postal_code, snap.city].filter(Boolean).join(' ')}
                        </p>
                      )}
                      {snap.country && (
                        <p className="text-xs text-ink-soft">{snap.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Suivi colis */}
          {order.tracking_number && (
            <InfoCard icon={Truck} title={t('orderDetailSuiviColis')}>
              <div className="space-y-3">
                {/* Transporteur */}
                {order.carrier && CARRIER_CONFIG[order.carrier] && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                      {t('orderDetailTransporteur')}
                    </span>
                    <span className="text-sm font-medium text-ink ml-auto">
                      {CARRIER_CONFIG[order.carrier]?.label ?? order.carrier}
                    </span>
                  </div>
                )}

                {/* Numéro + lien */}
                <div className="bg-cream rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
                    {t('orderDetailNumSuivi')}
                  </p>
                  <p className="text-sm font-mono font-semibold text-ink break-all">
                    {order.tracking_number}
                  </p>
                  {order.carrier && CARRIER_CONFIG[order.carrier] && (
                    <a
                      href={CARRIER_CONFIG[order.carrier].url(order.tracking_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft/60 hover:text-gold-deep transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t('orderDetailSuivreColis')}
                    </a>
                  )}
                </div>
              </div>
            </InfoCard>
          )}

          {/* Code promo */}
          {order.promo_code && (
            <InfoCard icon={Tag} title={t('orderDetailReduction2')}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">{t('orderDetailCodePromo')}</span>
                  <span className="text-sm font-mono font-semibold text-emerald-400">
                    {order.promo_code}
                  </span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">{t('orderDetailReduction')}</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      −{Number(order.discount_amount).toFixed(2)} OMR
                    </span>
                  </div>
                )}
              </div>
            </InfoCard>
          )}

          {/* Paiement */}
          <InfoCard icon={CreditCard} title={t('orderDetailPaiement')}>
            <div className="space-y-2.5">
              {/* Statut paiement */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-soft">{t('orderDetailStatut')}</span>
                <div className="flex items-center gap-1.5">
                  {order.payment_status === 'paid' && (
                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className={`text-sm font-semibold ${
                    (PAYMENT_STATUS[order.payment_status] ?? PAYMENT_STATUS.pending).color
                  }`}>
                    {(PAYMENT_STATUS[order.payment_status] ?? PAYMENT_STATUS.pending).label}
                  </span>
                </div>
              </div>

              {/* Méthode */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-soft">{t('orderDetailMethode')}</span>
                <span className="text-sm font-medium text-ink capitalize">
                  {order.payment_method === 'cod' ? t('orderDetailPaiementCOD') : order.payment_method ?? '—'}
                </span>
              </div>

              {/* Référence Stripe discrète */}
              {order.stripe_session_id && (
                <div className="pt-2 border-t border-ink/10">
                  <p className="text-[10px] text-ink-soft/60 font-mono truncate">
                    {order.stripe_session_id.slice(0, 24)}…
                  </p>
                </div>
              )}
            </div>
          </InfoCard>

        </div>
      </div>

    </div>
  );
}
