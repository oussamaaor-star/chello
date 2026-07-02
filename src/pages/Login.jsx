import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';

import { AuthLayout, BoxReveal, AnimatedInput } from '../components/auth/AuthLayout';
import { PasswordField } from '../components/auth/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';
import { translateAuthError } from '../utils/authErrors';
import { supabase } from '../lib/supabase';

export default function Login() {
  useSEO(SEO_PRESETS.login);
  const { login, isAuthenticated, role } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/compte/profil';
  const { t } = useLanguage();

  const [form, setForm]             = useState({ email: '', password: '' });
  const [errors, setErrors]         = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendState, setResendState]   = useState('idle'); // idle | loading | sent | error

  if (isAuthenticated) return <Navigate to={from} replace />;

  const validate = () => {
    const next = {};
    if (!form.email.trim())                               next.email    = t('loginErrEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('loginErrEmailFmt');
    if (!form.password)                                   next.password = t('loginErrPassword');
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name])   setErrors((prev)  => ({ ...prev, [name]: '' }));
    if (globalError)    setGlobalError('');
    if (needsConfirm)   { setNeedsConfirm(false); setResendState('idle'); }
  };

  const handleResend = async () => {
    setResendState('loading');
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email.trim() });
    setResendState(error ? 'error' : 'sent');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setIsLoading(true);
    const result = await login(form.email.trim(), form.password);
    setIsLoading(false);
    if (result.success) {
      const dest = result.role === 'admin' ? '/admin'
                 : result.role === 'cashier' ? '/caisse'
                 : from;
      navigate(dest, { replace: true });
    }
    else {
      setGlobalError(result.error ? translateAuthError(t, result.error) : t('loginGlobalErr'));
      setNeedsConfirm(/email not confirmed/i.test(result.error || ''));
    }
  };

  return (
    <AuthLayout>
      {/* Titre */}
      <div className="mb-8">
        <BoxReveal width="100%" boxColor="rgba(158,158,158,0.4)" duration={0.35}>
          <h1 className="text-3xl font-serif italic text-ink mb-2 tracking-tight">{t('loginTitle')}</h1>
        </BoxReveal>
        <BoxReveal width="100%" boxColor="rgba(158,158,158,0.3)" duration={0.35}>
          <p className="text-sm text-ink-soft leading-relaxed">
            {t('loginSubtitle')}
          </p>
        </BoxReveal>
      </div>

      {/* Erreur globale */}
      {globalError && (
        <div className="flex items-start gap-3 p-4 mb-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Renvoi de l'e-mail de confirmation (compte non confirmé) */}
      {needsConfirm && (
        <div className="mb-6 text-center">
          {resendState === 'sent' ? (
            <p className="text-xs text-emerald-600">{t('loginResendSent')}</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === 'loading'}
              className="text-xs font-medium text-silver hover:text-silver-deep underline underline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resendState === 'loading' ? t('loginResendLoading') : t('loginResendConfirm')}
            </button>
          )}
          {resendState === 'error' && (
            <p className="text-xs text-red-500 mt-1">{t('loginGlobalErr')}</p>
          )}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Email */}
        <BoxReveal width="100%" boxColor="rgba(158,158,158,0.35)" duration={0.35}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              {t('loginEmail')}
            </label>
            <AnimatedInput
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </div>
        </BoxReveal>

        {/* Mot de passe */}
        <BoxReveal width="100%" boxColor="rgba(158,158,158,0.35)" duration={0.35}>
          <div className="flex flex-col gap-1.5">
            <PasswordField
              label={t('loginPassword')}
              id="password"
              name="password"
              placeholder={t('loginPassword')}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1">
              <Link
                to="/mot-de-passe-oublie"
                className="text-xs text-ink-soft hover:text-silver transition-colors"
              >
                {t('loginForgot')}
              </Link>
            </div>
          </div>
        </BoxReveal>

        {/* Bouton */}
        <BoxReveal width="100%" boxColor="rgba(158,158,158,0.4)" duration={0.35} overflow="visible">
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
              <LogIn className="w-4 h-4 rtl:-scale-x-100" />
            )}
            {isLoading ? t('loginLoading') : t('loginSubmit')}
          </button>
        </BoxReveal>
      </form>

      {/* Séparateur */}
      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-ink/10" />
        <span className="text-xs text-ink-soft uppercase tracking-wider">{t('loginOu')}</span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>

      {/* Lien inscription */}
      <BoxReveal width="100%" boxColor="rgba(158,158,158,0.3)" duration={0.35} overflow="visible">
        <p className="text-sm text-center text-ink-soft">
          {t('loginPasDeCompte')}{' '}
          <Link
            to="/inscription"
            className="font-semibold text-silver hover:text-silver-deep transition-colors underline underline-offset-2"
          >
            {t('loginCreer')}
          </Link>
        </p>
      </BoxReveal>

      <p className="text-xs text-center text-ink-soft/60 mt-5">
        {t('loginDonnees')}
      </p>
    </AuthLayout>
  );
}
