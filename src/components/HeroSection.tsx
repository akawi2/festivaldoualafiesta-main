import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-douala-fiesta-new.jpg";
import decorBorder from "@/assets/deco-afrique-border.png";
import cudLogo from "@/assets/cud.png";

const TARGET_DATE = new Date("2026-12-18T00:00:00").getTime();

const getTimeLeft = () => {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const HeroSection = () => {
  const { t } = useTranslation();
  const [showBorder, setShowBorder] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("accueil");
      const aboutSection = document.getElementById("apropos");

      if (heroSection && aboutSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const aboutRect = aboutSection.getBoundingClientRect();

        // Show border when we're in about section (not in hero section)
        const isInAboutSection = aboutRect.top <= window.innerHeight / 2;
        const isNotInHeroSection = heroRect.bottom <= window.innerHeight / 2;

        setShowBorder(isInAboutSection && isNotInHeroSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <Sparkles className="h-6 w-6 text-gold" />
            <span className="text-white font-medium tracking-wide uppercase text-sm">{t("hero.subtitle")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
            P<u>o</u> la bwam eeeeh!{" "}
            <span className="bg-gradient-coral bg-clip-text text-transparent">{t("hero.title")}</span> {t("hero.year")}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 leading-relaxed animate-fade-in">
            {t("hero.description")}
          </p>

          <div className="animate-fade-in flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
            <div>
              <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold mb-2">
                {t("hero.saveTheDate")}
              </p>
              <p className="bg-gradient-coral bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl font-bold">
                {t("hero.eventDate")}
              </p>
            </div>
            <div className="flex flex-nowrap gap-2 sm:gap-3">
              {[
                { value: timeLeft.days, label: t("hero.countdownDays") },
                { value: timeLeft.hours, label: t("hero.countdownHours") },
                { value: timeLeft.minutes, label: t("hero.countdownMinutes") },
                { value: timeLeft.seconds, label: t("hero.countdownSeconds") },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-2 sm:px-3 sm:py-2.5 min-w-[56px] sm:min-w-[64px] text-center"
                >
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gold tabular-nums leading-none">
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/80 uppercase tracking-wide mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Border */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[34px] bg-repeat-x transition-opacity duration-300 ${
          showBorder ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `url(${decorBorder})`,
          backgroundSize: "auto 100%",
        }}
      />

      {/* Floating Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="animate-[bounce_3s_ease-in-out_infinite]">
          <img src={cudLogo} alt="Logo CUD Douala" className="w-16 h-16 sm:w-20 sm:h-20 md:w-[120px] md:h-[120px] object-contain mx-auto" />
        </div>
        <p className="text-white/80 text-xs sm:text-sm mt-2 sm:mt-4 font-medium">{t("hero.organizedBy")}</p>
      </div>
    </section>
  );
};

export default HeroSection;
