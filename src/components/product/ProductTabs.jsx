import { useState, useEffect } from 'react';
import { Star, Send, LogIn, Droplets, Sparkles, ShieldCheck, FlaskConical, Clock, Wind, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ReviewCard } from './ReviewCard';
import { StarRating } from '../ui/StarRating';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

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

// ─── Notes olfactives ─────────────────────────────────────────────────────────

function NoteRow({ label, notes, bg, text, dot }) {
  if (!notes?.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
        <h4 className="text-xs font-bold uppercase tracking-widest text-ink-soft">{label}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {notes.map((note) => (
          <span key={note} className={`px-3 py-1.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Sélecteur d'étoiles ──────────────────────────────────────────────────────

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const { t } = useLanguage();
  const starLabel = (n) => t('starPickerLabel', { n }) || (n === 1 ? `Note 1 étoile` : `Note ${n} étoiles`);
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
            n <= (hovered || value) ? 'fill-gold text-gold' : 'text-ink/30 hover:text-gold'
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
        : (insertErr.message ?? t('reviewError')));
    } else {
      setSuccess(true);
      setRating(0);
      setComment('');
      onAdded();
    }
  };

  if (success) {
    return (
      <div className="p-5 bg-emerald-900/30 border border-emerald-700/50 rounded-2xl text-sm text-emerald-400 font-medium">
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
          className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream-deep text-sm text-ink placeholder-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none transition-all"
        />
      </div>

      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-gold text-cream rounded-xl text-sm font-bold hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
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

  const liveAvg      = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : null;
  const displayRating = liveAvg ?? product.rating ?? null;
  const totalCount    = reviews.length > 0 ? reviews.length : (product.reviewCount ?? 0);

  const distribution = (() => {
    if (reviews.length === 0) {
      const r = product.rating ?? 4;
      if (r >= 4.8) return [72, 20, 5, 2, 1];
      if (r >= 4.5) return [58, 28, 9, 3, 2];
      if (r >= 4.0) return [40, 35, 15, 6, 4];
      return [25, 35, 25, 10, 5];
    }
    return [5, 4, 3, 2, 1].map((star) =>
      Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100),
    );
  })();

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
            {totalCount > 0 ? `${totalCount.toLocaleString(lang === 'ar' ? 'ar-MA' : 'fr-FR')} ${t('productAvisCount')}` : t('productNoAvis')}
          </div>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, i) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-ink-soft w-3 text-right">{star}</span>
              <Star className="w-3 h-3 fill-gold text-gold flex-shrink-0" />
              <div className="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${distribution[i]}%` }}
                />
              </div>
              <span className="text-xs text-ink-soft/70 w-8 text-right">{distribution[i]}%</span>
            </div>
          ))}
        </div>
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
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gold text-cream rounded-xl text-xs font-bold hover:bg-gold-deep transition-colors"
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
          <span className="w-6 h-6 border-2 border-ink/10 border-t-gold rounded-full animate-spin" />
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

// ─── Onglet À propos ──────────────────────────────────────────────────────────

function AboutTab({ product }) {
  const { t } = useLanguage();
  const initial = product.brand?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="max-w-2xl space-y-6">
      {/* Brand card */}
      <div className="flex items-center gap-4 p-5 bg-cream rounded-2xl border border-ink/10">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-serif font-bold text-gold">{initial}</span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft/70 mb-0.5">{t('aboutMaison')}</p>
          <p className="text-lg font-serif text-ink">{product.brand}</p>
        </div>
      </div>

      {/* À propos du décant */}
      <div className="p-5 bg-cream rounded-2xl border border-ink/10 space-y-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Droplets className="w-4 h-4 text-gold" />
          {t('aboutCeQueVousRecevez')}
        </h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          {t('aboutDecantDesc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { icon: Droplets,    titleKey: 'aboutAuthentique',  subKey: 'aboutMemeJus' },
            { icon: Sparkles,    titleKey: 'aboutTesterAvant',  subKey: 'aboutIdealDecouvrir' },
            { icon: ShieldCheck, titleKey: 'aboutGarantiConforme', subKey: 'aboutFlacon' },
          ].map(({ icon: Icon, titleKey, subKey }) => (
            <div key={titleKey} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-ink/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">{t(titleKey)}</p>
                <p className="text-xs text-ink-soft/70 mt-0.5">{t(subKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
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

  const hasNotes = Object.values(product.notes || {}).some((arr) => arr?.length > 0);

  const tabs = [
    t('tabDescription'),
    hasNotes ? t('tabNotes') : t('tabAPropos'),
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
                ? 'border-gold text-gold'
                : 'border-transparent text-ink-soft/70 hover:text-ink hover:border-ink/15'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="p-6 lg:p-8">

        {/* ── Description ── */}
        {activeTab === 0 && (
          <div className="max-w-2xl space-y-6">
            {product.description ? (
              <p className="text-ink-soft leading-relaxed text-base">{product.description}</p>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cream-deep flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-ink-soft/50" />
                </div>
                <p className="text-ink-soft text-sm">{t('specDescVenir')}</p>
              </div>
            )}

            {/* ── Fiche technique ── */}
            {(() => {
              const SEASON_LABELS = { printemps: t('specSeasonPrintemps'), ete: t('specSeasonEte'), automne: t('specSeasonAutomne'), hiver: t('specSeasonHiver') };
              const OCCASION_LABELS = { quotidien: t('specOccQuotidien'), soiree: t('specOccSoiree'), bureau: t('specOccBureau'), sport: t('specOccSport') };
              const FAMILY_LABELS = { floral: t('specFamFloral'), 'fruite-sucre': t('specFamFruite'), 'sucre-gourmand': t('specFamSucre'), 'epice-oriental': t('specFamEpice'), 'fougere-classique': t('specFamFougere'), 'frais-aquatique': t('specFamFrais'), 'citron-boise': t('specFamCitron'), aromatique: t('specFamAromat'), animalique: 'Animalique', musque: 'Musqué', ambre: 'Ambré', oud: 'Oud', boise: 'Boisé', poudre: 'Poudré', balsamic: 'Balsamique', vanille: 'Vanillé', vert: 'Vert', fruite: 'Fruité', tropical: 'Tropical', sucre: 'Sucré', epice: 'Épicé', oriental: 'Oriental', fougere: 'Fougère', citronne: 'Citronné', frais: 'Frais', aquatique: 'Aquatique' };

              const specs = [
                product.concentration  && { icon: FlaskConical, label: t('specConcentration'), value: product.concentration },
                Array.isArray(product.olfactoryFamily) && product.olfactoryFamily.length > 0 && { icon: Sparkles, label: t('specFamille'), value: product.olfactoryFamily.map(f => FAMILY_LABELS[f] ?? f).join(' · ') },
                product.longevity      && { icon: Clock,        label: t('specTenue'),         value: product.longevity },
                product.projection     && { icon: Wind,         label: t('specProjection'),    value: product.projection },
              ].filter(Boolean);

              const seasons   = product.season?.length   > 0 ? product.season.map(s => SEASON_LABELS[s] ?? s).join(' · ')   : null;
              const occasions = product.occasion?.length > 0 ? product.occasion.map(o => OCCASION_LABELS[o] ?? o).join(' · ') : null;

              if (specs.length === 0 && !seasons && !occasions) return null;

              return (
                <div className="border-t border-ink/10 pt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-soft/70 mb-4">{t('specCaracteristiques')}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {specs.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2.5 p-3 bg-cream rounded-xl border border-ink/10">
                        <Icon className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft/70 leading-none mb-1">{label}</p>
                          <p className="text-sm font-semibold text-ink truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                    {seasons && (
                      <div className="flex items-start gap-2.5 p-3 bg-cream rounded-xl border border-ink/10 col-span-2 sm:col-span-1">
                        <CalendarDays className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft/70 leading-none mb-1">{t('specSaisons')}</p>
                          <p className="text-xs font-medium text-ink">{seasons}</p>
                        </div>
                      </div>
                    )}
                    {occasions && (
                      <div className="flex items-start gap-2.5 p-3 bg-cream rounded-xl border border-ink/10 col-span-2 sm:col-span-2">
                        <Sparkles className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft/70 leading-none mb-1">{t('specOccasions')}</p>
                          <p className="text-xs font-medium text-ink">{occasions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Ingrédients */}
            {product.ingredients && (
              <div className="border-t border-ink/10 pt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-soft/70 mb-3">{t('specIngredients')}</p>
                <p className="text-xs text-ink-soft/70 leading-relaxed">{product.ingredients}</p>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-cream border border-ink/10 text-ink-soft rounded-full text-xs font-medium capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Notes Olfactives ── */}
        {activeTab === 1 && hasNotes && (
          <div className="max-w-2xl">
            <p className="text-xs text-ink-soft/70 mb-7 italic">
              {t('specPyramideDesc')}
            </p>
            <div className="space-y-7">
              <NoteRow
                label={t('noteTop')}
                notes={product.notes?.top}
                bg="bg-gold/10" text="text-gold"
                dot="bg-gold"
              />
              <NoteRow
                label={t('noteCoeur')}
                notes={product.notes?.heart}
                bg="bg-rose-100" text="text-rose-700"
                dot="bg-rose-400"
              />
              <NoteRow
                label={t('noteFond')}
                notes={product.notes?.base}
                bg="bg-ink/5" text="text-ink-soft"
                dot="bg-ink-soft"
              />
            </div>
          </div>
        )}

        {/* ── À propos ── */}
        {activeTab === 1 && !hasNotes && <AboutTab product={product} />}

        {/* ── Avis ── */}
        {activeTab === 2 && <ReviewsTab product={product} />}

      </div>
    </div>
  );
}
