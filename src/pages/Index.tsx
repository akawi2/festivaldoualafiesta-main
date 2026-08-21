import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import PartnersSection from "@/components/PartnersSection";
import Footer from "@/components/Footer";
import FloatingRegisterButton from "@/components/FloatingRegisterButton";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-clip">
      <SEO
        title="Festival Douala Fiesta - L'événement culturel incontournable de Douala"
        description="DOUALA Fiesta transforme vos rêves en événements inoubliables. Mariages, événements d'entreprise, anniversaires - 15 ans d'expertise en organisation d'événements."
        keywords="festival Douala, événement culturel, Cameroun, musique, danse, art, culture africaine, Douala Fiesta"
        canonicalUrl="https://festivaldoualafiesta.cm/"
        ogImage="https://festivaldoualafiesta.cm/og-image.jpg"
      />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <PartnersSection />
      <Footer />
      <FloatingRegisterButton />
    </div>
  );
};

export default Index;
