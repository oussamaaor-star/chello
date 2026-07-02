import { useSEO } from '../hooks/useSEO';
import { SEO_PRESETS } from '../utils/seo';
import { useCatalogue } from '../hooks/useCatalogue';
import { RecentlyViewedProducts } from '../components/product/RecentlyViewedProducts';
import { ReelGallery } from '../components/ui/ReelGallery';
import { CinematicLookbook } from '../components/home/CinematicLookbook';
import { StorefrontInvite } from '../components/home/StorefrontInvite';
import { TrustSignals } from '../components/home/TrustSignals';
import { HomeHero } from '../components/home/HomeHero';
import { HomeMarquee } from '../components/home/HomeMarquee';
import { CategoryBento } from '../components/home/CategoryBento';
import { FeaturedTabs } from '../components/home/FeaturedTabs';
import { BrandStory } from '../components/home/BrandStory';
import { LoyaltyCta } from '../components/home/LoyaltyCta';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { InstagramSection } from '../components/home/InstagramSection';
import { LocationSection } from '../components/home/LocationSection';

// Page d'accueil = pure composition : chaque section vit dans components/home/
// (état et animations locaux à chaque section, aucun état partagé ici).
export default function Home() {
  const { products } = useCatalogue();

  useSEO(SEO_PRESETS.home);

  return (
    <div className="bg-cream overflow-x-hidden">
      {/* Hero plein écran cinématique */}
      <HomeHero />

      {/* Réassurance juste après le hero */}
      <TrustSignals />

      {/* Bandeau promo défilant */}
      <HomeMarquee />

      {/* Moment vidéo plein écran (lookbook.mp4) */}
      <CinematicLookbook />

      {/* Collections — bento grid asymétrique */}
      <CategoryBento products={products} />

      {/* Produits — onglets Best Sellers / New In */}
      <FeaturedTabs products={products} />

      {/* Vidéo enseigne (storefront.mp4) + shop the look */}
      <StorefrontInvite />

      {/* Notre histoire — section immersive parallaxe */}
      <BrandStory />

      {/* Fidélité — carte premium */}
      <LoyaltyCta />

      {/* Newsletter — ancre #newsletter (levier -10% depuis le Footer) */}
      <NewsletterSection />

      {/* La boutique en mouvement — galerie de reels */}
      <ReelGallery />

      {/* Instagram — follow us */}
      <InstagramSection />

      {/* Localisation — adresse + Maps + WhatsApp */}
      <LocationSection />

      {/* Produits récemment vus (n'apparaît que si historique) */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <RecentlyViewedProducts currentProductId={null} />
        </div>
      </section>
    </div>
  );
}
