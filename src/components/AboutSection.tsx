import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart, Trophy, Clock, House, Locate } from "lucide-react";
import { useTranslation } from "react-i18next";
import lanceGauche from "@/assets/lance-gauche.png";
import lanceDroite from "@/assets/lance-droite.png";
import patternBg from "@/assets/pattern-background.png";
import mayorEditorialImage from "@/assets/mayor-editorial-image.png";

const AboutSection = () => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: <Users className="h-8 w-8 text-gold" />,
      number: "400K+",
      label: t("about.stats.attendees"),
    },
    {
      icon: <Heart className="h-8 w-8 text-gold" />,
      number: "300+",
      label: t("about.stats.artists"),
    },
    {
      icon: <House className="h-8 w-8 text-gold" />,
      number: "350+",
      label: t("about.stats.exhibitors"),
    },
    {
      icon: <Locate className="h-8 w-8 text-gold" />,
      number: "06",
      label: t("about.stats.districts"),
    },
  ];

  return (
    <section id="apropos" className="py-10 bg-background">
      <br />
      <br />

      {/* Newspaper Editorial Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white/95 border-1 border-gray-100 rounded-lg overflow-hidden">
          {" "}
          {/*shadow-xl*/}
          {/* Newspaper Header */}
          <div className="text-white p-4 border-b-4 border-gold">
            <div className="text-center">
              <h3 className="text-lg font-bold tracking-wider text-gold">{t("about.mayorWord")}</h3>
              <div className="text-xs opacity-80 mt-1 text-gold">Festival Douala Fiesta 2025</div>
            </div>
          </div>
          {/* Article Content */}
          <div className="p-6 lg:p-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Mayor Image */}
              <div className="lg:col-span-1">
                <div className="relative">
                  <img
                    src={mayorEditorialImage}
                    alt="Dr Roger MBASSA NDINE, Maire de Douala"
                    className="w-full h-64 lg:h-full"
                  />
                  <div className="absolute bottom-5 left-5 right-0">
                    <p className="text-white text-xs font-medium">{t("about.mayorName")}</p>
                    <p className="text-white/80 text-xs">{t("about.mayorTitle")}</p>
                  </div>
                </div>
              </div>

              {/* Article Text */}
              <div className="lg:col-span-3">
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p className="text-lg font-medium text-gray-900">{t("about.doualais")}</p>

                  <p className="text-sm">{t("about.introduction1")}</p>

                  <p className="text-sm">{t("about.introduction2")}</p>

                  <p className="text-sm">{t("about.introduction3")}</p>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gold">
                    <p className="text-sm font-medium text-gray-900 mb-2">{t("about.point")}</p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li>• {t("about.point1")}</li>
                      <li>• {t("about.point2")}</li>
                      <li>• {t("about.point3")}</li>
                      <li>• {t("about.point4")}</li>
                    </ul>
                  </div>

                  <p className="text-sm">{t("about.introduction4")}</p>

                  <p className="text-sm font-medium text-gold">{t("about.introduction5")}</p>

                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{t("about.introduction6")}</p>
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {t("about.mayorName")}, {t("about.mayorTitle")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 px-4">
            <img
              src={lanceGauche}
              alt="Lance décorative gauche"
              className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto opacity-80 lance-gauche flex-shrink-0"
            />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground title-float text-center">
              {t("about.title")}{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">{t("about.festivalName")}</span>
            </h2>
            <img
              src={lanceDroite}
              alt="Lance décorative droite"
              className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto opacity-80 lance-droite flex-shrink-0"
            />
          </div>
          <br />
          <br />
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t("about.welcome")}
            <br />
            {t("about.dates")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">{t("about.mission")}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.missionText")}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.team")}</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">{t("about.approach")}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">{t("about.approach1Title")}</strong>
                  {t("about.approach1")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">{t("about.approach2Title")}</strong>
                  {t("about.approach2")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">{t("about.approach3Title")}</strong>
                  {t("about.approach3")}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-2xl font-bold text-foreground my-8 md:my-0">{t("about.activities")}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="font-medium text-gold">Miss Douala Fiesta : </span>
              {t("about.miss")}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="font-medium text-gold">{t("about.funActSpan")}: </span>
              {t("about.funActivities")}
            </p>
          </div>
          <div className="space-y-4 md:space-y-6">
            <h3 className="hidden md:block text-2xl font-bold text-foreground">&nbsp;&nbsp;</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="font-medium text-gold">{t("about.showsSpan")}: </span>
              {t("about.shows")}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="font-medium text-gold">{t("about.salesSpan")}: </span>
              {t("about.sales")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-elegant hover:shadow-gold transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
