import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, UserPlus, CheckCircle } from 'lucide-react';

import { AuthLayout, BoxReveal, AnimatedInput } from '../components/auth/AuthLayout';
import { PasswordField } from '../components/auth/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';
import { translateAuthError } from '../utils/authErrors';

// Domaines réservés/de test rejetés par Supabase — on bloque avant l'appel réseau.
const BLOCKED_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net', 'test.com', 'test.test', 'localhost', 'invalid'];

// ─── Indicateur de force du mot de passe ─────────────────────────────────────

function PasswordStrength({ password, labels }) {
  const score = password
    ? [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
      ].filter(Boolean).length
    : 0;

  const levels = [
    { label: labels[0], color: 'bg-red-500',    width: 'w-1/4' },
    { label: labels[1], color: 'bg-orange-400', width: 'w-2/4' },
    { label: labels[2], color: 'bg-gold',       width: 'w-3/4' },
    { label: labels[3], color: 'bg-emerald-500', width: 'w-full' },
  ];
  const level = levels[score - 1] ?? levels[0];

  return (
    <div className="mt-2 h-[26px]">
      <div className="h-1 bg-ink/10 rounded-full overflow-hidden">
        {password && (
          <div className={`h-full rounded-full transition-all duration-300 ${level.color} ${level.width}`} />
        )}
      </div>
      <p className="text-xs text-ink-soft mt-1 h-4 leading-4">{password ? level.label : ''}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Register() {
  useSEO(SEO_PRESETS.register);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm]               = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]           = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [accepted, setAccepted]       = useState(false);
  const [success, setSuccess]         = useState(false);
  const [countdown, setCountdown]     = useState(4);

  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) { clearInterval(interval); navigate('/connexion', { replace: true }); }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, navigate]);

  if (isAuthenticated) return <Navigate to="/compte/profil" replace />;

  const validate = () => {
    const next = {};
    if (!form.name.trim())     next.name     = t('registerErrNom');
    if (!form.email.trim())    next.email    = t('registerErrEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('registerErrEmailFmt');
    else if (BLOCKED_EMAIL_DOMAINS.includes(form.email.trim().split('@')[1]?.toLowerCase())) next.email = t('registerErrEmailDomain');
    if (!form.password)        next.password = t('registerErrPassword');
    else if (form.password.length < 8) next.password = t('registerErrPasswordMin');
    if (!form.confirm)         next.confirm  = t('registerErrConfirm');
    else if (form.confirm !== form.password) next.confirm = t('registerErrConfirmMatch');
    if (!accepted)             next.terms    = t('registerErrCgu');
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError)  setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setIsLoading(true);
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    setIsLoading(false);
    if (result.success) {
      fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
      }).catch(() => {});
      setSuccess(true);
    } else {
      setGlobalError(result.error ? translateAuthError(t, result.error) : t('registerErrGlobal'));
    }
  };

  const pwdLabels = [
    t('pwdTresF'),
    t('pwdFaible'),
    t('pwdMoyen'),
    t('pwdFort'),
  ];

  if (success) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-serif italic text-ink mb-2">{t('registerSuccess')}</h1>
          <p className="text-sm text-ink-soft mb-1">
            {t('registerSuccessDesc')} <strong className="text-ink">{form.name.split(' ')[0]}</strong>.
          </p>
          <p className="text-xs text-ink-soft mb-8">
            {t('registerSuccessEmail')} <strong className="text-ink">{form.email}</strong>.
          </p>
          <Link
            to="/connexion"
            className="w-full flex items-center justify-center gap-2 py-3.5
              bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold
              transition-all shadow-[0_4px_20px_rgba(24,20,15,0.15)]"
          >
            {t('registerConnecter')}
          </Link>
          <p className="text-xs text-ink-soft/60 mt-4">
            {t('registerRedirect').replace('{n}', countdown)}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Titre */}
      <div className="mb-5">
        <BoxReveal width="100%" boxColor="rgba(184,145,90,0.4)" duration={0.35}>
          <h1 className="text-2xl font-serif italic text-ink mb-1">{t('registerTitle')}</h1>
        </BoxReveal>
        <BoxReveal width="100%" boxColor="rgba(184,145,90,0.3)" duration={0.35}>
          <p className="text-sm text-ink-soft">
            {t('registerSubtitle')}
          </p>
        </BoxReveal>
      </div>

      {/* Erreur globale */}
      {globalError && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

        {/* Nom */}
        <BoxReveal width="100%" boxColor="rgba(184,145,90,0.35)" duration={0.35}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-ink">{t('registerNom')}</label>
            <AnimatedInput
              id="name" name="name" type="text"
              placeholder={t('registerNom')}
              value={form.name} onChange={handleChange}
              autoComplete="name"
              className={errors.name ? 'ring-2 ring-red-500/50' : ''}
            />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </div>
        </BoxReveal>

        {/* Email */}
        <BoxReveal width="100%" boxColor="rgba(184,145,90,0.35)" duration={0.35}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-ink">{t('registerEmail')}</label>
            <AnimatedInput
              id="email" name="email" type="email"
              placeholder={t('registerEmailPlaceholder')}
              value={form.email} onChange={handleChange}
              autoComplete="email"
              className={errors.email ? 'ring-2 ring-red-500/50' : ''}
            />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </div>
        </BoxReveal>

        {/* Mot de passe */}
        <BoxReveal width="100%" boxColor="rgba(184,145,90,0.35)" duration={0.35}>
          <div>
            <PasswordField
              label={t('registerPassword')}
              id="password" name="password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <PasswordStrength password={form.password} labels={pwdLabels} />
          </div>
        </BoxReveal>

        {/* Confirmation */}
        <BoxReveal width="100%" boxColor="rgba(184,145,90,0.35)" duration={0.35}>
          <PasswordField
            label={t('registerConfirm')}
            id="confirm" name="confirm"
            placeholder={t('registerConfirm')}
            value={form.confirm} onChange={handleChange}
            error={errors.confirm}
            autoComplete="new-password"
          />
        </BoxReveal>

        {/* CGU */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                accepted
                  ? 'bg-ink border-ink'
                  : errors.terms
                  ? 'border-red-500'
                  : 'border-ink/30 group-hover:border-gold'
              }`}
              onClick={() => {
                setAccepted((v) => !v);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
            >
              {accepted && (
                <svg className="w-3 h-3 text-cream" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-ink-soft select-none leading-snug">
              {t('registerCgu')}{' '}
              <Link to="/cgv" target="_blank" rel="noopener noreferrer" className="text-gold font-medium underline underline-offset-2 hover:text-gold-deep transition-colors">
                {t('registerCguLink')}
              </Link>
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs text-red-500">{errors.terms}</p>}
        </div>

        {/* Bouton */}
        <BoxReveal width="100%" boxColor="rgba(184,145,90,0.4)" duration={0.35} overflow="visible">
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full flex items-center justify-center gap-2 py-3.5
              bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold
              transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]
              shadow-[0_4px_20px_rgba(24,20,15,0.15)]"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {isLoading ? t('registerLoading') : t('registerSubmit')}
          </button>
        </BoxReveal>
      </form>

      {/* Séparateur */}
      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-px bg-ink/10" />
        <span className="text-xs text-ink-soft uppercase tracking-wider">{t('separateurOu')}</span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>

      <BoxReveal width="100%" boxColor="rgba(184,145,90,0.3)" duration={0.35} overflow="visible">
        <p className="text-sm text-center text-ink-soft">
          {t('registerDejaCompte')}{' '}
          <Link to="/connexion" className="font-semibold text-gold hover:text-gold-deep transition-colors underline underline-offset-2">
            {t('registerConnecter')}
          </Link>
        </p>
      </BoxReveal>

      <p className="text-xs text-center text-ink-soft/60 mt-3">
        {t('registerFree')}
      </p>
    </AuthLayout>
  );
}
