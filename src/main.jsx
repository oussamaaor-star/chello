import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Providers
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { CartDrawerProvider } from './context/CartDrawerContext';

// Styles
import './index.css';
import './styles/glass.css';

// ─── Sentry ────────────────────────────────────────────────────────────────────
// Le SDK Sentry (surtout l'intégration Replay) est lourd pour le fil principal.
// On le charge en différé APRÈS le rendu (requestIdleCallback) pour ne pas
// gonfler le Total Blocking Time au démarrage. Voir initSentryDeferred() en bas.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? '';

// ─── Error boundary léger (n'embarque pas Sentry dans le bundle critique) ──────
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    // Remonte l'erreur à Sentry s'il est déjà chargé.
    if (window.__sentry?.captureException) {
      window.__sentry.captureException(error, { extra: info });
    }
  }
  render() {
    if (this.state.error) return <SentryFallback error={this.state.error} />;
    return this.props.children;
  }
}

// ─── Fallback affiché si une erreur React non gérée remonte jusqu'ici ─────────
function SentryFallback({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="max-w-md text-center">
        <p className="text-4xl mb-4">😕</p>
        <h1 className="text-xl font-bold text-ink mb-2">
          Une erreur inattendue s'est produite
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          Notre équipe a été prévenue. Veuillez rafraîchir la page ou revenir
          à l'accueil.
        </p>
        <p className="text-xs font-mono text-red-400 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6 text-left break-all">
          {error?.message ?? 'Erreur inconnue'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <CartDrawerProvider>
                <App />
              </CartDrawerProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);

// ─── Init Sentry en différé (hors du fil critique → réduit le TBT) ────────────
if (SENTRY_DSN) {
  const initSentry = () => {
    import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
        ],
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      window.__sentry = Sentry; // permet à l'ErrorBoundary de remonter les erreurs
    }).catch(() => {});
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initSentry, { timeout: 5000 });
  } else {
    setTimeout(initSentry, 3000);
  }
}
