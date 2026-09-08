import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import HomeGallerySection from "@/components/HomeGallerySection";
import Footer from "@/components/Footer";
import FloatingRegisterButton from "@/components/FloatingRegisterButton";
import { SEO } from "@/components/SEO";

const Index = () => {
  const location = useLocation();

  // Permet à la Navigation d'un lien "#accueil"/"#apropos" depuis une autre
  // page de retomber ici puis défiler jusqu'à la bonne section.
  useEffect(() => {
    if (!location.hash) return;
    const element = document.querySelector(location.hash);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [location.hash]);

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
      <HomeGallerySection />
      <Footer />
      <FloatingRegisterButton />
    </div>
  );
};

export default Index;
