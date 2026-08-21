import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import ContactSection from "@/components/ContactSection";

const Contact = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const highlight = (location.state as { highlight?: string } | null)?.highlight;
    if (!highlight) return;

    const timer = setTimeout(() => {
      const element = document.querySelector(`[data-highlight-form="${highlight}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("highlight-form");
        setTimeout(() => element.classList.remove("highlight-form"), 3000);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact - Festival Douala Fiesta"
        description="Contactez le Festival Douala Fiesta pour réserver votre stand, proposer votre talent ou obtenir plus d'informations sur l'événement."
        keywords="contact festival, réserver stand, Douala Fiesta, Cameroun"
        canonicalUrl="https://festivaldoualafiesta.cm/contact"
        ogImage="https://festivaldoualafiesta.cm/og-image.jpg"
      />

      {/* Header */}
      <div className="bg-gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("contact.backToHome")}
          </Button>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t("contact.title")} {t("contact.us")}
          </h1>
          <p className="text-xl text-gray-light max-w-3xl">{t("contact.getInTouch")}</p>
        </div>
      </div>

      {/* Content */}
      <ContactSection />
    </div>
  );
};

export default Contact;
