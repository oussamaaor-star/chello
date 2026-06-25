import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordField } from '../components/auth/PasswordField';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPassword() {
  const { t } = useLanguage();

  useSEO({
    title:       buildTitle(t('resetTitle')),
    description: t('resetSubtitle'),
  });

  const navigate = useNavigate();

  const [form, setForm]           = useState({ password: '', confirm: '' });
  const [errors, setErrors]       = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone]           = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase embeds the recovery token in the URL hash and fires PASSWORD_RECOVERY
  // via onAuthStateChange once it processes it.
  useEffect(() => {
    // Check hash immediately (token might already be processed on page load)
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type%3Drecovery')) {
      setSessionReady(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validate = () => {
    const next = {};
    if (!form.password) next.password = t('registerErrPassword');
    else if (form.password.length < 8) next.password = t('resetErrMin');
    if (!form.confirm) next.confirm = t('registerErrConfirm');
    else if (form.password !== form.confirm) next.confirm = t('registerErrConfirmMatch');
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: form.password });
    setIsLoading(false);

    if (error) {
      setGlobalError(error.message ?? t('registerErrGlobal'));
    } else {
      setDone(true);
      setTimeout(() => navigate('/connexion', { replace: true }), 3000);
    }
  };

  // ── Lien invalide / expiré ────────────────────────────────────────────────
  if (!sessionReady && !done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-silver/10 mb-5">
            <KeyRound className="w-8 h-8 text-silver" />
          </div>
          <h1 className="text-2xl font-serif italic text-ink mb-2">{t('resetInvalidTitle')}</h1>
          <p className="text-sm text-ink-soft leading-relaxed max-w-sm mx-auto mb-7">
            {t('resetInvalidDesc')}
          </p>
          <Link
            to="/mot-de-passe-oublie"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-ink/90 text-cream rounded-xl text-sm font-semibold transition-colors shadow-[0_4px_20px_rgba(24,20,15,0.15)]"
          >
            {t('resetNewRequest')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {done ? (

        /* ── Succès ── */
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-serif italic text-ink mb-2">{t('resetSuccess')}</h1>
          <p className="text-sm text-ink-soft leading-relaxed mb-7">
            {t('resetSuccessDesc')}
          </p>
          <Link
            to="/connexion"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-silver transition-colors underline underline-offset-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('loginSubmit')}
          </Link>
        </div>

      ) : (

        /* ── Formulaire ── */
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-serif italic text-ink mb-2">{t('resetTitle')}</h1>
            <p className="text-sm text-ink-soft">
              {t('resetSubtitle')}
            </p>
          </div>

          {globalError && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <PasswordField
              label={t('resetPassword')}
              id="password"
              name="password"
              placeholder={t('resetMinPlaceholder')}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <PasswordField
              label={t('resetConfirm')}
              id="confirm"
              name="confirm"
              placeholder={t('resetConfirm')}
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-ink hover:bg-ink/90 text-cream rounded-full text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_4px_20px_rgba(24,20,15,0.15)] mt-1"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {isLoading ? t('resetLoading') : t('resetSubmit')}
            </button>
          </form>

          <p className="text-xs text-center text-ink-soft/60 mt-6">
            {t('resetPrivacy')}
          </p>
        </>
      )}
    </AuthLayout>
  );
}
