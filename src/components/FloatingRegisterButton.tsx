import { useState } from "react";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import missCrownHead from "@/assets/miss-crown-head.png";

const FloatingRegisterButton = () => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(true);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/miss-election");
  };

  return (
    <>
      {/* Bouton flottant avec bulle élégante */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Bulle de texte élégante */}
          {showTooltip && (
            <div className="hidden sm:block absolute bottom-16 right-2 mb-2 w-64 transform">
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gold/20 p-4 backdrop-blur-sm bg-white/95">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-gold" />
                    <span className="font-bold text-navy text-sm">{t("miss.concours")}</span>
                    <Crown className="h-5 w-5 text-gold" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">✨ {t("miss.participate")} ✨</p>
                  <p className="text-xs text-gold font-medium mt-1">{t("miss.click")}</p>
                </div>

                {/* Flèche de la bulle */}
                <div className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>

                {/* Bouton pour fermer */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(false);
                  }}
                  className="absolute top-1 right-2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <Button
            onClick={handleClick}
            size="lg"
            className="h-20 w-20 rounded-full border-0 overflow-hidden bg-transparent hover:bg-transparent hover:scale-110 transition-all duration-700 shadow-2xl hover:shadow-gold/50 p-0 animate-[pulse_16s_ease-in-out_infinite] hover:animate-none"
          >
            <img src={missCrownHead} alt="Miss Douala Fiesta" className="h-full w-full object-contain" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default FloatingRegisterButton;
