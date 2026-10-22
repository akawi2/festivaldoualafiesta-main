import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MissStepsTimeline from "@/components/MissStepsTimeline";
import ActivityRegistrationDialog, { ActivityDiscipline } from "@/components/ActivityRegistrationDialog";
import lanceGauche from "@/assets/lance-gauche.png";
import lanceDroite from "@/assets/lance-droite.png";

interface CaravanStop {
  date: string;
  place: string;
  venues: string;
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-3 text-muted-foreground">
        <span className="w-2 h-2 bg-gold rounded-full mt-2.5 flex-shrink-0" aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

interface SectionProps {
  id: string;
  name: string;
  period: string;
  children: React.ReactNode;
}

const ActivitySection = ({ id, name, period, children }: SectionProps) => (
  <section id={id} className="scroll-mt-28">
    <Card className="shadow-elegant">
      <CardContent className="p-6 sm:p-8 space-y-5">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{name}</h2>
          <Badge className="bg-gradient-coral text-white border-0 whitespace-normal text-left">
            <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" aria-hidden="true" />
            {period}
          </Badge>
        </div>
        {children}
      </CardContent>
    </Card>
  </section>
);

const Activities = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [registration, setRegistration] = useState<{ disciplines: ActivityDiscipline[]; title: string } | null>(null);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const timer = setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [location.hash, location.key]);

  const list = (key: string) => t(key, { returnObjects: true }) as string[];
  const stops = t("activities.caravan.stops", { returnObjects: true }) as CaravanStop[];

  const sectionLinks = [
    { id: "caravane", key: "caravan" },
    { id: "promed", key: "promed" },
    { id: "miss", key: "miss" },
    { id: "noel", key: "noel" },
    { id: "mami-makala", key: "mami" },
    { id: "besua", key: "besua" },
    { id: "brain-games", key: "brain" },
    { id: "spectacles", key: "shows" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Activités - Festival Douala Fiesta 2026"
        description="Caravane, PROME'D, Miss Douala Fiesta, Noël Solidaire, Mami Makala & Papa Beignet, Besua, Douala Brain Games : toutes les activités du Festival Douala Fiesta 2026."
        keywords="activités festival, caravane Douala, PROME'D, Miss Douala Fiesta, Besua, Douala Brain Games, Mami Makala"
        canonicalUrl="https://festivaldoualafiesta.cm/activites"
        ogImage="https://festivaldoualafiesta.cm/og-image.jpg"
      />
      <Navigation />

      <div className="bg-gradient-hero text-white py-20 pt-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("activities.backToHome")}
          </Button>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              {t("activities.title")}{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">{t("activities.titleSpan")}</span>
            </h1>
          </div>
          <p className="text-xl text-gray-light max-w-3xl">{t("activities.subtitle")}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src={lanceGauche} alt="" className="h-8 sm:h-10 w-auto opacity-80" />
            <img src={lanceDroite} alt="" className="h-8 sm:h-10 w-auto opacity-80" />
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">{t("activities.intro")}</p>
        </div>

        <nav aria-label="Activités" className="flex flex-wrap justify-center gap-2">
          {sectionLinks.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:border-gold hover:text-gold transition-colors"
            >
              {t(`activities.${s.key}.name`)}
            </a>
          ))}
        </nav>

        {/* Caravane */}
        <ActivitySection id="caravane" name={t("activities.caravan.name")} period={t("activities.caravan.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.caravan.text")}</p>
          <h3 className="text-lg font-semibold text-foreground">{t("activities.caravan.calendar")}</h3>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stops.map((stop) => (
              <li key={stop.place} className="rounded-lg border border-border p-4">
                <p className="font-semibold text-foreground">{stop.date}</p>
                <p className="text-gold font-medium">{stop.place}</p>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gold" aria-hidden="true" />
                  {stop.venues}
                </p>
              </li>
            ))}
          </ol>
        </ActivitySection>

        {/* PROME'D */}
        <ActivitySection id="promed" name={t("activities.promed.name")} period={t("activities.promed.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.promed.text")}</p>
          <Bullets items={list("activities.promed.items")} />
          <p className="text-muted-foreground leading-relaxed">{t("activities.promed.closing")}</p>
          <Button
            onClick={() => navigate("/contact", { state: { highlight: "reserver-stand" } })}
            className="bg-gradient-gold text-navy font-semibold hover:scale-105 transition-transform"
          >
            {t("activities.promed.cta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </ActivitySection>

        {/* Miss */}
        <ActivitySection id="miss" name={t("activities.miss.name")} period={t("activities.miss.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.miss.text")}</p>
          <h3 className="text-lg font-semibold text-foreground">{t("activities.goals")}</h3>
          <Bullets items={list("activities.miss.goals")} />
          <div className="pt-4">
            <MissStepsTimeline />
          </div>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link to="/miss-election">
              {t("activities.miss.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </ActivitySection>

        {/* Noël solidaire */}
        <ActivitySection id="noel" name={t("activities.noel.name")} period={t("activities.noel.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.noel.text")}</p>
          <h3 className="text-lg font-semibold text-foreground">{t("activities.goals")}</h3>
          <Bullets items={list("activities.noel.goals")} />
        </ActivitySection>

        {/* Mami Makala & Papa Beignet */}
        <ActivitySection id="mami-makala" name={t("activities.mami.name")} period={t("activities.mami.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.mami.text")}</p>
          <h3 className="text-lg font-semibold text-foreground">{t("activities.goals")}</h3>
          <Bullets items={list("activities.mami.goals")} />
          <h3 className="text-lg font-semibold text-foreground">{t("activities.mami.stepsTitle")}</h3>
          <ol className="space-y-2 list-decimal pl-5 marker:text-gold marker:font-bold text-muted-foreground">
            {list("activities.mami.steps").map((step) => (
              <li key={step} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
          <Button
            onClick={() => setRegistration({ disciplines: ["mami_makala", "papa_beignet"], title: t("activities.mami.name") })}
            className="bg-gradient-gold text-navy font-semibold hover:scale-105 transition-transform"
          >
            {t("activities.register")}
          </Button>
        </ActivitySection>

        {/* Besua */}
        <ActivitySection id="besua" name={t("activities.besua.name")} period={t("activities.besua.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.besua.text")}</p>
          <p className="text-muted-foreground leading-relaxed">{t("activities.besua.organisation")}</p>
          <p className="font-medium text-foreground">{t("activities.besua.categories")}</p>
          <Button
            onClick={() => setRegistration({ disciplines: ["besua"], title: t("activities.besua.name") })}
            className="bg-gradient-gold text-navy font-semibold hover:scale-105 transition-transform"
          >
            {t("activities.register")}
          </Button>
        </ActivitySection>

        {/* Douala Brain Games */}
        <ActivitySection id="brain-games" name={t("activities.brain.name")} period={t("activities.brain.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.brain.text")}</p>
          <p className="text-muted-foreground leading-relaxed">{t("activities.brain.disciplines")}</p>
          <p className="text-muted-foreground leading-relaxed">{t("activities.brain.news")}</p>
          <p className="text-muted-foreground leading-relaxed">{t("activities.brain.calendar")}</p>
          <p className="text-sm text-muted-foreground">{t("activities.brain.support")}</p>
        </ActivitySection>

        {/* Spectacles / show live */}
        <ActivitySection id="spectacles" name={t("activities.shows.name")} period={t("activities.shows.period")}>
          <p className="text-muted-foreground leading-relaxed">{t("activities.shows.text")}</p>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link to="/programme">
              {t("activities.seeProgram")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </ActivitySection>
      </div>

      {registration && (
        <ActivityRegistrationDialog
          open
          onOpenChange={(open) => !open && setRegistration(null)}
          disciplines={registration.disciplines}
          title={registration.title}
        />
      )}

      <Footer />
    </div>
  );
};

export default Activities;
