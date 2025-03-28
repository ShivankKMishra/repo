import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import FeaturedArtisans from '@/components/home/FeaturedArtisans';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import ArtisanStory from '@/components/home/ArtisanStory';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import CommunityForum from '@/components/home/CommunityForum';
import NewsletterSignup from '@/components/home/NewsletterSignup';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedCategories />
        <FeaturedArtisans />
        <FeaturedProducts />
        <ArtisanStory />
        <UpcomingEvents />
        <CommunityForum />
        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  );
}
