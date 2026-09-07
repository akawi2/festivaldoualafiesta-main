import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";

const Programme = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Programme - Festival Douala Fiesta"
        description="Découvrez le programme complet du Festival Douala Fiesta 2026 sur 14 jours d'événements exceptionnels : concerts, spectacles et animations."
        keywords="programme festival, événements Douala Fiesta, concerts, spectacles, Cameroun"
        canonicalUrl="https://festivaldoualafiesta.cm/programme"
        ogImage="https://festivaldoualafiesta.cm/og-image.jpg"
      />
      {/* Header */}
      <div className="bg-gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("program.backToHome")}
          </Button>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t("program.title")} {t("program.festival")}
          </h1>
          <p className="text-xl text-gray-light max-w-3xl">{t("program.description")}</p>
        </div>
      </div>

      {/* Content */}
      <NewsSection />

      <Footer />
    </div>
  );
};

export default Programme;
