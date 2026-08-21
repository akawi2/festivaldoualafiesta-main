import { useState, useEffect } from "react";
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

  // Grouper les événements par date et les trier par ordre décroissant d'heure
  const getEventsByDay = (dayNumber: number) => {
    if (events.length === 0) return [];

    // Obtenir toutes les dates uniques des événements
    const uniqueDates = Array.from(
      new Set(events.map((event) => format(parseISO(event.start_time), "yyyy-MM-dd"))),
    ).sort(); // Tri croissant des dates

    // Sélectionner la date correspondant au jour demandé (indexé à partir de 1)
    const targetDateStr = uniqueDates[dayNumber - 1];
    if (!targetDateStr) return [];

    // Filtrer les événements de cette date et les trier par heure décroissante
    return events
      .filter((event) => {
        const eventDateStr = format(parseISO(event.start_time), "yyyy-MM-dd");
        return eventDateStr === targetDateStr;
      })
      .sort((a, b) => {
        // Tri décroissant par heure de début
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      });
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

  const renderDayEvents = (dayNumber: number) => {
    const dayEvents = getEventsByDay(dayNumber);

    // Obtenir la vraie date du premier événement de ce jour
    let dayTitle = `Jour ${dayNumber}`;
    let daySubtitle = "";

    if (dayEvents.length > 0) {
      const firstEventDate = parseISO(dayEvents[0].start_time);
      dayTitle = format(firstEventDate, "EEEE dd MMMM yyyy", { locale });
      daySubtitle = `${dayEvents.length} ${t("program.events")}${dayEvents.length > 1 ? "s" : ""} ${t("program.nbProgram")}`;
    }

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2 capitalize">{dayTitle}</h3>
          <p className="text-muted-foreground">{daySubtitle}</p>
        </div>
        {isLoading ? (
          renderLoadingSkeleton()
        ) : dayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dayEvents.map((event) => renderProgrammeCard(event))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-muted rounded-full p-6 w-fit mx-auto mb-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">{t("program.noEvents")}</h4>
            <p className="text-muted-foreground">{t("program.comingSoon")}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="programme" className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Tabs defaultValue="jour1" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
            <TabsTrigger value="jour1" className="text-sm">
              {t("program.day")} 1
            </TabsTrigger>
            <TabsTrigger value="jour2" className="text-sm">
              {t("program.day")} 2
            </TabsTrigger>
            <TabsTrigger value="jour3" className="text-sm">
              {t("program.day")} 3
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jour1">{renderDayEvents(1)}</TabsContent>

          <TabsContent value="jour2">{renderDayEvents(2)}</TabsContent>

          <TabsContent value="jour3">{renderDayEvents(3)}</TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default NewsSection;
