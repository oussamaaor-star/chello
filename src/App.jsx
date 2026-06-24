import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useRef, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import { AppRoutes } from './router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingWidgets } from './components/ui/FloatingWidgets';

// Composants non-critiques : chargés après le premier rendu (hors chemin critique)
const CartDrawer      = lazy(() => import('./components/cart/CartDrawer').then(m => ({ default: m.CartDrawer })));
const ExitIntentPopup = lazy(() => import('./components/ui/ExitIntentPopup').then(m => ({ default: m.ExitIntentPopup })));
const CookieBanner    = lazy(() => import('./components/ui/CookieBanner').then(m => ({ default: m.CookieBanner })));

function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return children;
}

const AUTH_ROUTES = ['/connexion', '/inscription', '/mot-de-passe-oublie', '/reset-password'];

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isAuth  = AUTH_ROUTES.includes(pathname);

  if (isAdmin) {
    return (
      <div className="min-h-screen">
        <AppRoutes />
      </div>
    );
  }

  if (isAuth) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="h-[132px] lg:h-[136px] flex-shrink-0" />
        <AppRoutes />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-cream">
        <Header />
        {/* Compense la hauteur du header fixe : mobile = barre haut (80px) +
            barre recherche persistante (~52px) ≈ 132px ; desktop = 96px + nav (~40px) = 136px */}
        <div className="h-[132px] lg:h-[136px] flex-shrink-0" />
        <main className="flex-grow min-h-screen">
          <AppRoutes />
        </main>
        <Footer />
      </div>
      <FloatingWidgets />
      <Suspense fallback={null}>
        <CartDrawer />
        <ExitIntentPopup />
        <CookieBanner />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <AppShell />
      </SmoothScroll>
    </BrowserRouter>
  );
}

export default App;
