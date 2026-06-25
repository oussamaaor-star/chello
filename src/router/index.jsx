import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { PageLoader } from '../components/ui/PageLoader';
import { RouteErrorBoundary } from '../components/ui/RouteErrorBoundary';
import { usePageTracking } from '../hooks/useAnalytics';

// ─── Lazy loading de toutes les pages ────────────────────────────────────────
// Chaque import() crée un chunk JS séparé chargé uniquement quand la route est visitée.

const Home              = lazy(() => import('../pages/Home'));
const Catalogue         = lazy(() => import('../pages/Catalogue'));
const Product           = lazy(() => import('../pages/Product'));
const Wishlist          = lazy(() => import('../pages/Wishlist'));
const Login             = lazy(() => import('../pages/Login'));
const Register          = lazy(() => import('../pages/Register'));
const Search            = lazy(() => import('../pages/Search'));
const Checkout          = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const NotFound          = lazy(() => import('../pages/NotFound'));

// Account (layout + pages enfants)
const AccountLayout = lazy(() => import('../pages/account/AccountLayout'));
const Profile       = lazy(() => import('../pages/account/Profile'));
const Orders        = lazy(() => import('../pages/account/Orders'));
const OrderDetail   = lazy(() => import('../pages/account/OrderDetail'));
const Addresses     = lazy(() => import('../pages/account/Addresses'));
const StockAlerts   = lazy(() => import('../pages/account/StockAlerts'));

// Legal pages
const MentionsLegales          = lazy(() => import('../pages/legal/MentionsLegales'));
const CGV                      = lazy(() => import('../pages/legal/CGV'));
const PolitiqueConfidentialite = lazy(() => import('../pages/legal/PolitiqueConfidentialite'));
const LivraisonRetours         = lazy(() => import('../pages/legal/LivraisonRetours'));

// Contact & FAQ
const Contact = lazy(() => import('../pages/Contact'));
const FAQ     = lazy(() => import('../pages/FAQ'));
const About   = lazy(() => import('../pages/About'));

// Suivi de commande
const OrderTracking = lazy(() => import('../pages/OrderTracking'));

// Blog
const Blog     = lazy(() => import('../pages/Blog'));
const BlogPost = lazy(() => import('../pages/BlogPost'));

// Password reset
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('../pages/ResetPassword'));

// Fidélité
const RegisterLoyalty  = lazy(() => import('../pages/RegisterLoyalty'));
const LoyaltyCard      = lazy(() => import('../pages/LoyaltyCard'));
const FindLoyaltyCard  = lazy(() => import('../pages/FindLoyaltyCard'));

// Admin
const AdminLayout    = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminOrders    = lazy(() => import('../pages/admin/AdminOrders'));
const AdminProducts  = lazy(() => import('../pages/admin/AdminProducts'));
const AdminPromos    = lazy(() => import('../pages/admin/AdminPromos'));
const AdminUsers     = lazy(() => import('../pages/admin/AdminUsers'));
const AdminReviews   = lazy(() => import('../pages/admin/AdminReviews'));
const AdminLoyalty   = lazy(() => import('../pages/admin/AdminLoyalty'));
const AdminAlerts    = lazy(() => import('../pages/admin/AdminAlerts'));

// Cashier
const CashierLayout    = lazy(() => import('../pages/cashier/CashierLayout'));
const CashierDashboard = lazy(() => import('../pages/cashier/CashierDashboard'));
const CashierOrders    = lazy(() => import('../pages/cashier/CashierOrders'));
const CashierPOS       = lazy(() => import('../pages/cashier/CashierPOS'));
const CashierLoyalty   = lazy(() => import('../pages/cashier/CashierLoyalty'));
const CashierStock     = lazy(() => import('../pages/cashier/CashierStock'));

// ─── Routes ──────────────────────────────────────────────────────────────────

export function AppRoutes() {
  usePageTracking();
  const location = useLocation();
  return (
    // La boundary protège la zone de page : Header/Footer (montés en amont)
    // restent affichés même si une page lazy plante ou si un chunk échoue à
    // charger. La `key` liée au pathname réinitialise la boundary à chaque
    // navigation — sinon une route plantée resterait plantée après changement
    // d'URL.
    <RouteErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/"                      element={<Home />} />
        <Route path="/catalogue"             element={<Catalogue />} />
        <Route path="/categorie/:slug"       element={<Catalogue />} />
        <Route path="/produit/:slug"         element={<Product />} />
        <Route path="/favoris"               element={<Wishlist />} />
        <Route path="/connexion"             element={<Login />} />
        <Route path="/inscription"           element={<Register />} />
        <Route path="/recherche"             element={<Search />} />
        <Route path="/checkout"              element={<Checkout />} />
        <Route path="/suivi"               element={<OrderTracking />} />
        <Route path="/fidelite"            element={<RegisterLoyalty />} />
        <Route path="/fidelite/carte/:code" element={<LoyaltyCard />} />
        <Route path="/fidelite/retrouver"   element={<FindLoyaltyCard />} />
        <Route path="/blog"                element={<Blog />} />
        <Route path="/blog/:slug"          element={<BlogPost />} />
        <Route path="/confirmation-commande" element={<OrderConfirmation />} />

        {/* Pages légales */}
        <Route path="/mentions-legales"          element={<MentionsLegales />} />
        <Route path="/cgv"                       element={<CGV />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/livraison-retours"         element={<LivraisonRetours />} />

        {/* Contact & FAQ & About */}
        <Route path="/contact"   element={<Contact />} />
        <Route path="/faq"       element={<FAQ />} />
        <Route path="/a-propos"  element={<About />} />

        {/* Password reset */}
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reset-password"      element={<ResetPassword />} />

        <Route path="/compte" element={<AccountLayout />}>
          <Route path="profil"        element={<Profile />} />
          <Route path="commandes"     element={<Orders />} />
          <Route path="commandes/:id" element={<OrderDetail />} />
          <Route path="adresses"      element={<Addresses />} />
          <Route path="alertes"       element={<StockAlerts />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index           element={<AdminDashboard />} />
          <Route path="orders"   element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="promos"   element={<AdminPromos />} />
          <Route path="users"    element={<AdminUsers />} />
          <Route path="reviews"  element={<AdminReviews />} />
          <Route path="loyalty"  element={<AdminLoyalty />} />
          <Route path="alerts"   element={<AdminAlerts />} />
        </Route>

        {/* Cashier */}
        <Route path="/caisse" element={<CashierLayout />}>
          <Route index            element={<CashierDashboard />} />
          <Route path="commandes" element={<CashierOrders />} />
          <Route path="vente"     element={<CashierPOS />} />
          <Route path="fidelite"  element={<CashierLoyalty />} />
          <Route path="stock"     element={<CashierStock />} />
        </Route>

        {/* Fallback 404 — doit être en dernier */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}
