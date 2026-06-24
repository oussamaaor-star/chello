import { Component } from 'react';
import { translations } from '../../i18n/translations';

// Lecture de la langue hors React (composant classe, pas de hook possible).
function tr(key) {
  const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'fr';
  return translations[lang]?.[key] ?? translations.fr[key] ?? key;
}

// ─── RouteErrorBoundary ───────────────────────────────────────────────────────
// Boundary d'erreur au niveau de la zone de page (Header/Footer restent montés).
//
// Deux rôles :
//   1. Récupération automatique des échecs de chargement de chunk. Après un
//      redéploiement, l'index.html d'un visiteur revenant peut demander un chunk
//      hashé qui n'existe plus → l'import() dynamique échoue ("ChunkLoadError",
//      "Loading chunk failed", "Failed to fetch dynamically imported module"…).
//      On force alors UN SEUL rechargement automatique (garde sessionStorage)
//      pour récupérer le nouvel index.html, sans boucle de rechargement.
//   2. Pour toute autre erreur de rendu, on affiche un repli convivial (FR)
//      au lieu de laisser l'app entière passer en écran blanc.

const RELOAD_GUARD_KEY = 'chunk-reload-once';

function isChunkLoadError(error) {
  if (!error) return false;
  const name = String(error.name ?? '');
  const message = String(error.message ?? '');
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk|dynamically imported module|Failed to fetch dynamically/i.test(message)
  );
}

export class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isReloading: false };
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error)) {
      // Rechargement automatique unique : on garde une trace dans sessionStorage
      // pour ne jamais boucler si le rechargement ne résout pas le problème.
      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === '1';
        if (!alreadyReloaded) sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
      } catch {
        // sessionStorage indisponible (mode privé strict…) : on ne tente pas le
        // rechargement auto pour éviter toute boucle, on montre le repli.
        alreadyReloaded = true;
      }

      if (!alreadyReloaded) {
        // eslint-disable-next-line react/no-direct-mutation-state
        this.setState({ isReloading: true });
        window.location.reload();
        return;
      }
    }
    // Erreur applicative classique : on reste sur le repli (état hasError).
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (this.state.isReloading) {
      // Évite un flash de l'UI de repli pendant que reload() s'exécute.
      return null;
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="w-full max-w-md bg-cream-deep border border-ink/10 rounded-2xl p-8">
            <h1 className="text-xl font-serif text-ink mb-2">
              {tr('errBoundaryTitle')}
            </h1>
            <p className="text-sm text-ink-soft mb-7 leading-relaxed">
              {tr('errBoundaryDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-cream rounded-xl text-sm font-semibold hover:bg-gold-deep transition-colors"
              >
                {tr('errBoundaryReload')}
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-ink/15 text-ink-soft rounded-xl text-sm font-medium hover:bg-cream-deep transition-colors"
              >
                {tr('errBoundaryHome')}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
