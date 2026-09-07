import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Music, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isSameDay } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface ProgramEvent {
  id: string;
  title: string;
  description_fr: string | null;
  description_en: string | null;
  artist_name: string;
  start_time: string;
  end_time: string;
  stage: string;
  event_type: string;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  ticket_info: string | null;
}

const NewsSection = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sélectionner la locale selon la langue
  const locale = i18n.language === 'en' ? enUS : fr;

  // Chargement des événements depuis la base de données
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("program_events")
          .select("*")
          .eq("is_active", true)
          .order("start_time", { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Toutes les dates uniques présentes dans les événements, triées par ordre croissant.
  // Le nombre d'onglets "Jour X" s'adapte ainsi automatiquement au nombre réel de
  // journées programmées, au lieu d'être limité à 3 jours en dur.
  const uniqueDates = useMemo(
    () => Array.from(new Set(events.map((event) => format(parseISO(event.start_time), "yyyy-MM-dd")))).sort(),
    [events],
  );

  // Récupérer les événements d'une date donnée, triés par ordre décroissant d'heure
  const getEventsByDate = (dateStr: string) => {
    return events
      .filter((event) => format(parseISO(event.start_time), "yyyy-MM-dd") === dateStr)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  };

  const renderProgrammeCard = (event: ProgramEvent) => (
    <Card
      key={event.id}
      className="group overflow-hidden shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-2 cursor-pointer"
    >
      {event.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-gold/10 text-accent-foreground">
            {event.event_type}
          </Badge>
          {event.is_featured && <Badge className="bg-primary text-primary-foreground">Vedette</Badge>}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(parseISO(event.start_time), "HH:mm")} - {format(parseISO(event.end_time), "HH:mm")}
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">{event.title}</h3>
        <p className="text-sm font-medium text-muted-foreground">{event.artist_name}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {event.stage}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed line-clamp-3">
          {(i18n.language === 'en' ? event.description_en : event.description_fr) || "Événement du festival Douala Fiesta"}
        </p>
        {event.ticket_info && (
          <Badge variant="outline" className="mt-2">
            {event.ticket_info}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDayEvents = (dateStr: string) => {
    const dayEvents = getEventsByDate(dateStr);
    const firstEventDate = dayEvents.length > 0 ? parseISO(dayEvents[0].start_time) : null;
    const dayTitle = firstEventDate ? format(firstEventDate, "EEEE dd MMMM yyyy", { locale }) : "";
    const daySubtitle = firstEventDate
      ? `${dayEvents.length} ${t("program.events")}${dayEvents.length > 1 ? "s" : ""} ${t("program.nbProgram")}`
      : "";

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2 capitalize">{dayTitle}</h3>
          <p className="text-muted-foreground">{daySubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{dayEvents.map((event) => renderProgrammeCard(event))}</div>
      </div>
    );
  };

  return (
    <section id="programme" className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          renderLoadingSkeleton()
        ) : uniqueDates.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted rounded-full p-6 w-fit mx-auto mb-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">{t("program.noEvents")}</h4>
            <p className="text-muted-foreground">{t("program.comingSoon")}</p>
          </div>
        ) : (
          <Tabs defaultValue={uniqueDates[0]} className="w-full">
            <TabsList className="flex flex-wrap h-auto justify-center gap-2 mb-12 bg-transparent">
              {uniqueDates.map((dateStr, index) => (
                <TabsTrigger key={dateStr} value={dateStr} className="text-sm">
                  {t("program.day")} {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {uniqueDates.map((dateStr) => (
              <TabsContent key={dateStr} value={dateStr}>
                {renderDayEvents(dateStr)}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
