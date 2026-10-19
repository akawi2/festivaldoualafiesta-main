import { useTranslation } from "react-i18next";
import { Calendar, MapPin, Users } from "lucide-react";

interface MissStep {
  title: string;
  count: string;
  place: string;
  period: string;
}

export const MissStepsTimeline = () => {
  const { t } = useTranslation();
  const steps = t("missSteps.steps", { returnObjects: true }) as MissStep[];

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{t("missSteps.title")}</h3>
        <p className="text-muted-foreground">{t("missSteps.subtitle")}</p>
      </div>

      <ol className="relative max-w-3xl mx-auto border-l-2 border-gold/40 ml-4 sm:mx-auto space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="pl-8 relative">
            <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-navy text-sm font-bold shadow-gold">
              {index + 1}
            </span>
            <h4 className="font-semibold text-foreground text-lg">{step.title}</h4>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4 text-gold" aria-hidden="true" />
                {step.count}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
                {step.place}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
                {step.period}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default MissStepsTimeline;
