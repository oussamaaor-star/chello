import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, User, MessageSquare, Send, CheckCircle,
  Phone, Clock, ChevronRight,
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { buildTitle } from '../utils/seo';
import { SHOP_CONFIG } from '../utils/config';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Champ de formulaire ──────────────────────────────────────────────────────

function Field({ label, id, icon: Icon, error, multiline, ...props }) {
  const base = `w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-ink placeholder-ink-soft/50
    focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all
    ${error
      ? 'border-red-500 bg-red-50 focus:ring-red-500/30 focus:border-red-500'
      : 'border-ink/10 bg-cream focus:ring-silver/30 focus:border-silver hover:border-ink/20'}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute top-3 left-3.5 pointer-events-none">
          <Icon className="w-4 h-4 text-ink-soft" />
        </div>
        {multiline ? (
          <textarea id={id} rows={5} className={`${base} resize-none`} {...props} />
        ) : (
          <input id={id} className={base} {...props} />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Carte info ───────────────────────────────────────────────────────────────

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-4 p-5 bg-cream-deep rounded-2xl border border-ink/10">
      <div className="w-10 h-10 rounded-xl bg-silver/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-silver" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink mb-1">{title}</p>
        <div className="text-sm text-ink-soft leading-relaxed truncate">{children}</div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Contact() {
  const { t } = useLanguage();

  useSEO({
    title:       buildTitle(t('contactTitle') ?? 'Contact'),
    description: t('contactSeoDesc') ?? 'Contact Chello customer service.',
    canonical:   'https://chello-nine.vercel.app/contact',
  });

  const [form, setForm]       = useState({ name: '', email: '', message: '' });
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const validate = () => {
    const next = {};
    if (!form.name.trim())    next.name    = t('contactNom') + ' ' + t('error');
    if (!form.email.trim())   next.email   = t('contactEmail') + ' ' + t('error');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = t('contactError');
    if (!form.message.trim()) next.message = t('contactMessage') + ' ' + t('error');
    else if (form.message.trim().length < 10)
      next.message = t('contactError');
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-contact-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      const okMissingKeyInDev = data.reason === 'missing_api_key' && import.meta.env.DEV;
      if (data.sent || okMissingKeyInDev) {
        setSubmitted(true);
      } else {
        setError(t('contactErrEnvoi'));
      }
    } catch {
      setError(t('contactError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-cream-deep py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-ink-soft uppercase tracking-widest mb-5">
            <Link to="/" className="hover:text-ink transition-colors">{t('breadcrumbAccueil')}</Link>
            <ChevronRight className="w-3 h-3 opacity-50 rtl:rotate-180" />
            <span className="text-silver">{t('contactTitle')}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-ink mb-3 leading-tight">
            {t('contactTitle')}
          </h1>
          <p className="text-ink-soft text-sm sm:text-base max-w-md leading-relaxed">
            {t('contactSubtitle')}
          </p>

          {/* Infos contact en ligne */}
          <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-2xl">
            <InfoCard icon={Mail} title={t('contactEmail')}>
              <a
                href={`mailto:contact@chello.om`}
                title="contact@chello.om"
                className="hover:text-silver transition-colors"
              >
                contact@chello.om
              </a>
            </InfoCard>
            <InfoCard icon={Phone} title={t('contactTel')}>
              <p>+{SHOP_CONFIG.wa_number}</p>
            </InfoCard>
            <InfoCard icon={Clock} title={t('contactHoraires')}>
              <p>{t('contactHorairesCourt')}</p>
            </InfoCard>
          </div>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Formulaire ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-cream-deep rounded-2xl border border-ink/10 p-6 sm:p-8">

              {submitted ? (
                /* ── État succès ── */
                <div className="py-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-serif italic text-ink mb-2">{t('contactSuccess')}</h2>
                  <p className="text-sm text-ink-soft leading-relaxed max-w-sm mx-auto mb-7">
                    {t('contactSuccessDesc')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                      className="px-5 py-2.5 border border-ink/20 rounded-full text-sm text-ink hover:bg-cream transition-colors"
                    >
                      {t('contactEnvoyer')}
                    </button>
                    <Link
                      to="/"
                      className="px-5 py-2.5 bg-ink text-cream rounded-full text-sm font-semibold hover:bg-ink/90 transition-colors"
                    >
                      {t('retour')}
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── Formulaire ── */
                <>
                  <div className="mb-6">
                    <h2 className="text-lg font-serif italic text-ink">{t('contactEnvoyer')}</h2>
                    <p className="text-sm text-ink-soft mt-1">
                      {t('contactAllChamps')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <Field
                      label={t('contactNom')}
                      id="name"
                      name="name"
                      type="text"
                      placeholder={t('contactNom')}
                      icon={User}
                      value={form.name}
                      onChange={handleChange}
                      error={errors.name}
                      autoComplete="name"
                    />
                    <Field
                      label={t('contactEmail')}
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('registerEmailPlaceholder')}
                      icon={Mail}
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                      autoComplete="email"
                    />
                    <Field
                      label={t('contactMessage')}
                      id="message"
                      name="message"
                      placeholder={t('contactMessage')}
                      icon={MessageSquare}
                      value={form.message}
                      onChange={handleChange}
                      error={errors.message}
                      multiline
                    />

                    {error && (
                      <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-ink text-cream rounded-full text-sm font-semibold hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {loading ? t('contactSending') : t('contactSend')}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* ── Panneau latéral ── */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">

            {/* WhatsApp */}
            <a
              href={SHOP_CONFIG.wa_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-cream-deep rounded-2xl border border-ink/10 hover:border-green-600 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-silver-deep">WhatsApp</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">+{SHOP_CONFIG.wa_number}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-soft group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
            </a>

            {/* Horaires détaillés */}
            <div className="bg-cream-deep rounded-2xl border border-ink/10 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center">
                  <Clock className="w-4 h-4 text-ink-soft" />
                </div>
                <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-silver-deep">{t('contactHoraires')}</p>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { j: t('contactJourLV'),  h: t('contactHeuresLV')  },
                  { j: t('contactJourSam'), h: t('contactHeuresSam') },
                  { j: t('contactJourDim'), h: t('contactHeuresDim') },
                ].map(({ j, h }) => (
                  <div key={j} className="flex justify-between">
                    <span className="text-ink-soft">{j}</span>
                    <span className={`font-medium ${h === t('contactHeuresDim') ? 'text-red-500' : 'text-ink'}`}>{h}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-soft mt-3 leading-relaxed">
                {t('contactDelai')}
              </p>
            </div>

            {/* Lien FAQ */}
            <Link
              to="/faq"
              className="flex items-center justify-between p-5 bg-silver/10 border border-silver/20 rounded-2xl hover:bg-silver/15 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold text-silver-deep">{t('faqContactBtn')}</p>
                <p className="text-xs text-silver mt-0.5">{t('faqContact')}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-silver group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
