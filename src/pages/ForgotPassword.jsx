import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Text field (same as Login) ───────────────────────────────────────────────

function TextField({ label, id, icon: Icon, error, ...props }) {
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
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 h-12 rounded-xl border text-[16px] text-ink placeholder-ink-soft/50
            focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all
            ${error
              ? 'border-red-500/60 bg-red-50 focus:ring-red-500/40 focus:border-red-500'
              : 'border-ink/10 bg-cream focus:ring-silver/30 focus:border-silver hover:border-ink/20'
            }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPassword() {
  const { t } = useLanguage();

  useSEO({
    title:       buildTitle(t('forgotTitle')),
    description: t('forgotSeoDesc'),
    robots:      'noindex,nofollow',
  });

  const [email, setEmail]           = useState('');
  const [emailError, setEmailError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [sent, setSent]             = useState(false);

  const validate = () => {
    if (!email.trim()) return t('loginErrEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('loginErrEmailFmt');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setEmailError(err); return; }

    setIsLoading(true);
    setGlobalError('');

    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setGlobalError(t('forgotErrGlobal'));
    } else {
      setSent(true);
    }
  };

  return (
    <AuthLayout>
      {sent ? (

        /* ── État succès ── */
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-serif italic text-ink mb-2">{t('forgotSuccess')}</h1>
          <p className="text-sm text-ink-soft leading-relaxed max-w-sm mx-auto mb-6">
            {t('forgotSuccessSentTo')} <strong className="text-ink">{email}</strong>. {t('forgotSuccessDesc')}
          </p>
          <p className="text-xs text-ink-soft mb-7">
            {t('forgotExpiry')}
          </p>
          <Link
            to="/connexion"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-silver transition-colors underline underline-offset-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('forgotRetour')}
          </Link>
        </div>

      ) : (

        /* ── Formulaire ── */
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-serif italic text-ink mb-2">{t('forgotTitle')}</h1>
            <p className="text-sm text-ink-soft leading-relaxed">
              {t('forgotSubtitle')}
            </p>
          </div>

          {globalError && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <TextField
              label={t('forgotEmail')}
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
                if (globalError) setGlobalError('');
              }}
              error={emailError}
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_4px_20px_rgba(24,20,15,0.15)] mt-1"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isLoading ? t('forgotLoading') : t('forgotSubmit')}
            </button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-ink/10" />
          </div>

          <p className="text-sm text-center text-ink-soft">
            <Link
              to="/connexion"
              className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-silver transition-colors underline underline-offset-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('forgotRetour')}
            </Link>
          </p>

          <p className="text-xs text-center text-ink-soft mt-4">
            {t('forgotPrivacy')}
          </p>
        </>
      )}
    </AuthLayout>
  );
}
