import { useState, useEffect } from 'react';
import { Star, Send, LogIn, Sparkles, ShieldCheck, Truck, RotateCcw, Ruler } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ReviewCard } from './ReviewCard';
import { StarRating } from '../ui/StarRating';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import categoriesData from '../../data/categories.json';

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formatRelativeDate(iso, t) {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (mins  < 60)  return t('ilYAMin', { n: mins });
  if (hours < 24)  return t('ilYAH', { n: hours });
  if (days  < 7)   return t('ilYAJ', { n: days });
  if (weeks < 5)   return weeks === 1 ? t('ilYASemaine', { n: weeks }) : t('ilYASemaines', { n: weeks });
  if (months < 12) return t('ilYAMois', { n: months });
  return t('ilYAPlus');
}

// ─── Sélecteur d'étoiles ──────────────────────────────────────────────────────

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const { t, lang } = useLanguage();
  const starLabel = (n) =>
    t('starPickerLabel', { n }) ||
    (lang === 'ar' ? `${n} نجوم` : n === 1 ? '1 star' : `${n} stars`);
  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label={t('reviewNote')}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={starLabel(n)}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star className={`w-7 h-7 transition-colors ${
            n <= (hovered || value) ? 'fill-amber-500 text-amber-500' : 'text-ink/30 hover:text-amber-400'
          }`} />
        </button>
      ))}
    </div>
  );
}

// ─── Formulaire d'ajout d'avis ────────────────────────────────────────────────

function AddReviewForm({ productId, onAdded }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0)               { setError(t('reviewNoteReq')); return; }
    if (comment.trim().length < 10) { setError(t('reviewMin10Chars')); return; }
    setLoading(true);
    setError('');

    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user.id).single();
    const displayName = profile?.full_name?.trim() || t('reviewClientVerifie');

    const { error: insertErr } = await supabase.from('reviews').insert({
      product_id:   productId,
      user_id:      user.id,
      display_name: displayName,
      rating,
      comment: comment.trim(),
    });
    setLoading(false);

    if (insertErr) {
      setError(insertErr.code === '23505'
        ? t('reviewError')
        : t('reviewError'));
    } else {
      setSuccess(true);
      setRating(0);
      setComment('');
      onAdded();
    }
  };

  if (success) {
    return (
      <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700 font-medium">
        ✓ {t('reviewSuccess')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream rounded-2xl border border-ink/10 p-5">
      <p className="text-sm font-semibold text-ink mb-5">{t('reviewVotreAvis')}</p>

      <div className="mb-4">
        <label className="block text-xs font-medium text-ink-soft mb-2.5 uppercase tracking-wider">
          {t('reviewNote')}
        </label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-ink-soft mb-2 uppercase tracking-wider">
          {t('reviewCommentaire')}
        </label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => { setComment(e.target.value); if (error) setError(''); }}
          placeholder={t('reviewPlaceholder')}
          className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream-deep text-sm text-ink placeholder-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-silver/50 focus:border-silver resize-none transition-all"
        />
      </div>

      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-silver text-cream rounded-xl text-sm font-bold hover:bg-silver-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
          : <Send className="w-4 h-4" />}
        {loading ? t('reviewEnvoi') : t('reviewEnvoyer')}
      </button>
    </form>
  );
}

// ─── Onglet Avis ──────────────────────────────────────────────────────────────

function ReviewsTab({ product }) {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, comment, display_name, created_at')
        .eq('product_id', product.id)
        .not('approved', 'eq', false)
        .order('created_at', { ascending: false });
      setReviews(data ?? []);
    } catch (err) {
      console.error('fetchReviews error:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasReviews    = reviews.length > 0;
  const liveAvg       = hasReviews
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : null;
  const displayRating = liveAvg;
  const totalCount    = reviews.length;

  // Distribution réelle uniquement — rien d'inventé quand 0 avis
  const distribution = hasReviews
    ? [5, 4, 3, 2, 1].map((star) =>
        Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100),
      )
    : null;

  const displayReviews = reviews.map((r) => ({
    name:     r.display_name,
    rating:   r.rating,
    text:     r.comment,
    date:     formatRelativeDate(r.created_at, t),
    verified: true,
  }));

  return (
    <div>
      {/* Résumé note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 bg-cream rounded-2xl border border-ink/10 mb-7">
        <div className="text-center flex-shrink-0">
          <div className="text-5xl font-serif text-ink leading-none">
            {displayRating != null ? displayRating.toFixed(1) : '—'}
          </div>
          {displayRating != null && (
            <StarRating rating={displayRating} className="justify-center mt-2" />
          )}
          <div className="text-xs text-ink-soft/70 mt-1">
            {totalCount > 0 ? `${totalCount.toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-US')} ${t('productAvisCount')}` : t('productNoAvis')}
          </div>
        </div>

        {/* Barres de distribution — uniquement s'il existe de vrais avis */}
        {distribution && (
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-ink-soft w-3 text-end">{star}</span>
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-silver rounded-full transition-all"
                    style={{ width: `${distribution[i]}%` }}
                  />
                </div>
                <span className="text-xs text-ink-soft/70 w-8 text-end">{distribution[i]}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire / invite */}
      <div className="mb-7">
        {isAuthenticated ? (
          <AddReviewForm productId={product.id} onAdded={fetchReviews} />
        ) : (
          <div className="p-5 bg-cream border border-ink/10 rounded-2xl flex items-center justify-between gap-4">
            <p className="text-sm text-ink-soft">
              {t('reviewConnexion')}
            </p>
            <Link
              to="/connexion"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-silver text-cream rounded-xl text-xs font-bold hover:bg-silver-deep transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('reviewVoirConnexion')}
            </Link>
          </div>
        )}
      </div>

      {/* Liste des avis */}
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="w-6 h-6 border-2 border-ink/10 border-t-silver rounded-full animate-spin" />
        </div>
      ) : displayReviews.length > 0 ? (
        <div className="space-y-4">
          {displayReviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-ink-soft/70 py-8">
          {t('reviewsEmptyBeFirst')}
        </p>
      )}
    </div>
  );
}

// ─── Onglet À propos (mode — matière / entretien / livraison) ──────────────────

function AboutTab({ product }) {
  const { lang } = useLanguage();

  const category = categoriesData.find((c) => c.slug === product.category);
  const categoryLabel = category ? (lang === 'ar' ? category.label : category.labelEn) : null;

  const sizesText = product.sizes?.length > 0 ? product.sizes.join(' · ') : null;
  const colorsCount = product.colors?.length > 0 ? product.colors.length : null;

  // Lignes « détails » — uniquement les champs réels du produit
  const details = [
    categoryLabel && { label: lang === 'ar' ? 'الفئة' : 'Category', value: categoryLabel },
    sizesText && { label: lang === 'ar' ? 'المقاسات المتوفرة' : 'Available sizes', value: sizesText },
    colorsCount && {
      label: lang === 'ar' ? 'الألوان' : 'Colors',
      value: lang === 'ar' ? `${colorsCount} ألوان متوفرة` : `${colorsCount} colors available`,
    },
  ].filter(Boolean);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Description produit */}
      <div>
        <h3 className="text-sm font-bold text-ink mb-2.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-silver" />
          {lang === 'ar' ? 'عن المنتج' : 'About this item'}
        </h3>
        {product.description ? (
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        ) : (
          <p className="text-sm text-ink-soft/70 leading-relaxed">
            {lang === 'ar'
              ? 'قطعة مختارة بعناية من تشيلو، تجمع بين الأناقة والجودة لتناسب إطلالاتك اليومية والمناسبات.'
              : 'A carefully selected Chello piece that blends elegance and quality for both everyday looks and special occasions.'}
          </p>
        )}
      </div>

      {/* Détails (champs réels) */}
      {details.length > 0 && (
        <div className="border-t border-ink/10 pt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft/70 mb-3">
            {lang === 'ar' ? 'التفاصيل' : 'Details'}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {details.map(({ label, value }) => (
              <div key={label} className="p-3 bg-cream rounded-xl border border-ink/10">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-soft/70 leading-none mb-1.5">{label}</dt>
                <dd className="text-sm font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Matière & entretien */}
      <div className="border-t border-ink/10 pt-5">
        <h3 className="text-sm font-bold text-ink mb-2.5 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-silver" />
          {lang === 'ar' ? 'الخامة والعناية' : 'Material & care'}
        </h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          {lang === 'ar'
            ? 'خامات منتقاة بعناية لراحة ومتانة عالية. يُنصح بالغسل اليدوي أو على دورة لطيفة بماء بارد، وتجنّب المُبيّض، والتجفيف في الظل للحفاظ على الشكل واللون.'
            : 'Carefully selected fabrics for comfort and durability. Hand wash or use a gentle cold cycle, avoid bleach, and dry in the shade to preserve shape and color.'}
        </p>
      </div>

      {/* Livraison & retours */}
      <div className="border-t border-ink/10 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-2.5 p-3 bg-cream rounded-xl border border-ink/10">
          <Truck className="w-4 h-4 text-silver flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-ink">{lang === 'ar' ? 'التوصيل' : 'Delivery'}</p>
            <p className="text-xs text-ink-soft/70 mt-0.5">
              {lang === 'ar'
                ? 'خلال 2-3 أيام عمل في جميع أنحاء عُمان — الدفع عند الاستلام.'
                : '2–3 business days across Oman — cash on delivery.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 bg-cream rounded-xl border border-ink/10">
          <RotateCcw className="w-4 h-4 text-silver flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-ink">{lang === 'ar' ? 'الإرجاع' : 'Returns'}</p>
            <p className="text-xs text-ink-soft/70 mt-0.5">
              {lang === 'ar'
                ? 'إرجاع أو استبدال خلال 7 أيام إذا كانت القطعة بحالتها الأصلية.'
                : 'Return or exchange within 7 days if the item is in its original condition.'}
            </p>
          </div>
        </div>
      </div>

      {/* Réassurance */}
      <div className="flex items-center gap-2.5 text-xs text-ink-soft/70 border-t border-ink/10 pt-5">
        <ShieldCheck className="w-4 h-4 text-silver flex-shrink-0" />
        <span>
          {lang === 'ar'
            ? 'منتجات أصلية مع ضمان الجودة من تشيلو.'
            : 'Authentic products with Chello’s quality guarantee.'}
        </span>
      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-ink/10 pt-5">
          {product.tags.map((tag) => (
            <span key={tag} className="px-3 py-1.5 bg-cream border border-ink/10 text-ink-soft rounded-full text-xs font-medium capitalize">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useLanguage();

  const tabs = [
    t('tabAPropos'),
    t('tabAvis'),
  ];

  return (
    <div className="bg-cream-deep rounded-3xl border border-ink/10 overflow-hidden">

      {/* Nav */}
      <div className="border-b border-ink/10 flex overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === i
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-soft/70 hover:text-ink hover:border-ink/15'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="p-6 lg:p-8">
        {activeTab === 0 && <AboutTab product={product} />}
        {activeTab === 1 && <ReviewsTab product={product} />}
      </div>
    </div>
  );
}
