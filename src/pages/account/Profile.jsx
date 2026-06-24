import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Save, CheckCircle, AlertCircle,
  Shield, Camera, Trash2, Loader2, X, KeyRound,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Champ de formulaire ──────────────────────────────────────────────────────

function Field({ label, id, icon: Icon, error, ...props }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-ink-soft" />
          </div>
        )}
        <input
          id={id}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border text-sm text-ink placeholder-ink-soft/50
            focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all
            ${error
              ? 'border-red-500 bg-red-50 focus:ring-red-500/30 focus:border-red-500'
              : 'border-ink/10 bg-cream focus:ring-gold/30 focus:border-gold hover:border-ink/20'
            }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Section avatar ───────────────────────────────────────────────────────────

function AvatarSection() {
  const { user, avatarUrl, updateAvatar, deleteAvatar } = useAuth();
  const { t } = useLanguage();

  const fileInputRef                    = useRef(null);
  const [preview, setPreview]           = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const displayUrl = preview ?? avatarUrl;
  const hasAvatar  = !!displayUrl;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setAvatarFeedback(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    const result = await updateAvatar(file);
    setUploading(false);
    if (result.success) {
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      setAvatarFeedback({ type: 'success', message: t('profilePhotoMaj') });
    } else {
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      setAvatarFeedback({ type: 'error', message: result.error });
    }
    setTimeout(() => setAvatarFeedback(null), 5000);
  };

  const handleDelete = async () => {
    setAvatarFeedback(null);
    setDeleting(true);
    const result = await deleteAvatar();
    setDeleting(false);
    if (result.success) {
      setAvatarFeedback({ type: 'success', message: t('profilePhotoSupprimee') });
    } else {
      setAvatarFeedback({ type: 'error', message: result.error });
    }
    setTimeout(() => setAvatarFeedback(null), 5000);
  };

  const isBusy = uploading || deleting;

  return (
    <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-6">
      <h3 className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-deep mb-5">
        {t('profilePhotoLabel')}
      </h3>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => !isBusy && fileInputRef.current?.click()}
            className="group relative w-24 h-24 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            aria-label={t('profileModifierPhoto')}
            disabled={isBusy}
          >
            {hasAvatar ? (
              <img
                src={displayUrl}
                alt={t('profilePhotoLabel')}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full bg-cream-deep flex items-center justify-center">
                <span className="text-2xl font-bold text-gold select-none">{initials}</span>
              </div>
            )}

            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              isBusy
                ? 'bg-black/50 opacity-100'
                : 'bg-black/40 opacity-0 group-hover:opacity-100'
            }`}>
              {uploading ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : deleting ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <Camera className="w-7 h-7 text-white" />
              )}
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-ink truncate">
            {user?.name ?? '—'}
          </p>
          <p className="text-sm text-ink-soft truncate">{user?.email}</p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink text-cream rounded-full text-xs font-semibold hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
            >
              <Camera className="w-3.5 h-3.5" />
              {avatarUrl ? t('profilePhotoChanger') : t('profilePhotoAjouter')}
            </button>

            {avatarUrl && !uploading && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-ink/20 text-ink-soft rounded-full text-xs font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {deleting ? t('profileSuppression') : t('profileSupprimer')}
              </button>
            )}
          </div>

          <p className="text-[11px] text-ink-soft mt-2.5">
            {t('profilePhotoFormat')}
          </p>
        </div>
      </div>

      {avatarFeedback && (
        <div className={`flex items-start gap-2.5 mt-4 p-3.5 rounded-xl text-sm border ${
          avatarFeedback.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {avatarFeedback.type === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          }
          <span className="flex-1 leading-relaxed">{avatarFeedback.message}</span>
          <button
            type="button"
            onClick={() => setAvatarFeedback(null)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { t }                   = useLanguage();
  const { user, updateProfile } = useAuth();

  const [form, setForm]         = useState({ name: '', email: '' });
  const [errors, setErrors]     = useState({});
  const [globalError, setGlobalError] = useState('');
  const [saved, setSaved]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? '', email: user.email ?? '' });
    }
  }, [user]);

  const isDirty = form.name !== (user?.name ?? '') || form.email !== (user?.email ?? '');

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('profileNomRequis');
    if (!form.email.trim()) next.email = t('profileEmailRequis');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = t('profileEmailFormat');
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError) setGlobalError('');
    if (saved) setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const result = await updateProfile(form.name.trim(), form.email.trim());
    setIsLoading(false);
    if (result.success) {
      setSaved(true);
    } else {
      setGlobalError(result.error ?? t('error'));
    }
  };

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div>
        <h2 className="text-xl font-serif italic text-ink">{t('profileTitle')}</h2>
        <p className="text-sm text-ink-soft mt-1">{t('profileSauvegarder')}</p>
      </div>

      {/* ── Avatar ── */}
      <AvatarSection />

      {/* ── Formulaire infos personnelles ── */}
      <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-6">
        <h3 className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-deep mb-5">
          {t('profileInfosPerso')}
        </h3>

        {saved && (
          <div className="flex items-center gap-3 p-4 mb-5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{t('profileSuccess')}</span>
          </div>
        )}

        {globalError && (
          <div className="flex items-start gap-3 p-4 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field
            label={t('profileNom')}
            id="name"
            name="name"
            type="text"
            placeholder={t('profileNom')}
            icon={User}
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            autoComplete="name"
          />

          <Field
            label={t('profileEmail')}
            id="email"
            name="email"
            type="email"
            placeholder={t('profileEmail')}
            icon={Mail}
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-ink-soft flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {t('profileDonneesSecurisees')}
            </p>
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-full text-sm font-semibold hover:bg-ink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? t('loading') : t('profileSauvegarder')}
            </button>
          </div>
        </form>
      </div>

      {/* ── Sécurité ── */}
      <div className="bg-cream-deep rounded-2xl border border-ink/10 shadow-sm p-6">
        <h3 className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-deep mb-4">
          {t('profileSecurite')}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{t('profileMotDePasse')}</p>
            <p className="text-xs text-ink-soft mt-0.5">{t('profileMdpDesc')}</p>
          </div>
          <Link
            to="/mot-de-passe-oublie"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-ink/20 rounded-full text-sm text-ink hover:bg-cream transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {t('profileModifier')}
          </Link>
        </div>
      </div>

    </div>
  );
}
