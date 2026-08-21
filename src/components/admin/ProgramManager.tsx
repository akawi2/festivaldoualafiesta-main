import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, MapPin, Star, Edit, Trash2, Save, X, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAutoSave } from "@/hooks/useAutoSave";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
  created_at: string;
  updated_at: string;
}
interface EventFormData {
  title: string;
  description_fr: string;
  description_en: string;
  artist_name: string;
  start_time: string;
  end_time: string;
  stage: string;
  event_type: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  ticket_info: string;
}
const stages = ["Scène Principale", "Scène Électro", "Scène Culturelle", "Scène Acoustique", "Espace Food", "Zone VIP"];

interface GalleryCategory {
  id: string;
  name: string;
  name_en: string | null;
  place_it: string | null;
  is_active: boolean;
}

export function ProgramManager() {
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<ProgramEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description_fr: "",
    description_en: "",
    artist_name: "",
    start_time: "",
    end_time: "",
    stage: "Scène Principale",
    event_type: "Concert",
    image_url: "",
    is_featured: false,
    is_active: true,
    ticket_info: "",
  });
  const { debouncedSave } = useAutoSave({
    delay: 1500,
    onSave: async (data) => {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
      }
    },
    onError: (error) => {
      console.error("Auto-save error:", error);
    },
  });
  const loadEvents = async () => {
    try {
      const { data, error } = await supabase.from("program_events").select("*").order("start_time", {
        ascending: true,
      });
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Erreur lors du chargement du programme");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_categories")
        .select("*")
        .eq("place_it", "heros")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Erreur lors du chargement des catégories");
    }
  };
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `program/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("program-events").upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("program-events").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    }
  };

  const createEvent = async (eventData: EventFormData) => {
    try {
      const { data: newId, error } = await supabase.rpc("create_program_event", {
        p_title: eventData.title,
        p_description: eventData.description_fr,
        p_artist_name: eventData.artist_name,
        p_start_time: eventData.start_time,
        p_end_time: eventData.end_time,
        p_stage: eventData.stage,
        p_event_type: eventData.event_type,
        p_image_url: eventData.image_url || null,
        p_is_featured: eventData.is_featured,
        p_is_active: eventData.is_active,
        p_ticket_info: eventData.ticket_info || null,
      });

      if (error) throw error;

      toast.success("Événement créé avec succès");
      resetForm();
      loadEvents(); // Reload events to get the new one
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Erreur lors de la création de l'événement");
    }
  };
  const updateEvent = async (id: string, eventData: Partial<EventFormData>) => {
    try {
      const { data, error } = await supabase.rpc("admin_update_program_event", {
        p_id: id,
        p_title: eventData.title || "",
        p_artist_name: eventData.artist_name || "",
        p_start_time: eventData.start_time || "",
        p_end_time: eventData.end_time || "",
        p_stage: eventData.stage || "Scène Principale",
        p_event_type: eventData.event_type || "Concert",
        p_description_fr: eventData.description_fr || null,
        p_description_en: eventData.description_en || null,
        p_image_url: eventData.image_url || null,
        p_is_featured: eventData.is_featured ?? null,
        p_is_active: eventData.is_active ?? null,
        p_ticket_info: eventData.ticket_info || null,
      });
      
      if (error) throw error;
      
      await loadEvents(); // Reload to get fresh data
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };
  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("program_events").delete().eq("id", id);
      if (error) throw error;
      setEvents((prev) => prev.filter((event) => event.id !== id));
      toast.success("Événement supprimé");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Erreur lors de la suppression");
    }
  };
  const resetForm = () => {
    setFormData({
      title: "",
      description_fr: "",
      description_en: "",
      artist_name: "",
      start_time: "",
      end_time: "",
      stage: "Scène Principale",
      event_type: "Concert",
      image_url: "",
      is_featured: false,
      is_active: true,
      ticket_info: "",
    });
    setIsCreating(false);
    setEditingEvent(null);
  };
  const startEdit = (event: ProgramEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description_fr: event.description_fr,
      description_en: event.description_en,
      artist_name: event.artist_name,
      start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
      stage: event.stage,
      event_type: event.event_type,
      image_url: event.image_url,
      is_featured: event.is_featured,
      is_active: event.is_active,
      ticket_info: event.ticket_info,
    });
  };
  const handleFormChange = (field: keyof EventFormData, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);
    if (editingEvent) {
      debouncedSave(newFormData);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreating) {
      await createEvent(formData);
    } else if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
      setEditingEvent(null);
    }
  };
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Music className="h-7 w-7 text-primary" />
            Gestion du Programme
          </h2>
          <p className="text-muted-foreground">Gérez les événements et spectacles du festival</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || !!editingEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Événement
        </Button>
      </div>

      {/* Form */}
      {(isCreating || editingEvent) && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              {isCreating ? "Créer un Événement" : "Modifier l'Événement"}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre de l'événement</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="Nom de l'événement"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Artiste/Intervenant</Label>
                  <Input
                    value={formData.artist_name}
                    onChange={(e) => handleFormChange("artist_name", e.target.value)}
                    placeholder="Nom de l'artiste ou intervenant"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleFormChange("start_time", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleFormChange("end_time", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scène</Label>
                  <Select value={formData.stage} onValueChange={(value) => handleFormChange("stage", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={formData.event_type} onValueChange={(value) => handleFormChange("event_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (français)</Label>
                <Textarea
                  value={formData.description_fr}
                  onChange={(e) => handleFormChange("description_fr", e.target.value)}
                  placeholder="Description de l'événement (texte en français)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Description (anglais)</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => handleFormChange("description_en", e.target.value)}
                  placeholder="Description de l'événement (texte en français)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Image de l'événement</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const publicUrl = await uploadImage(file);
                        if (publicUrl) {
                          handleFormChange("image_url", publicUrl);
                        }
                      }
                    }}
                    className="w-full"
                  />
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Aperçu"
                      className="w-16 h-16 object-cover rounded-lg border-2 border-border"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleFormChange("is_featured", checked)}
                  />
                  <Label>Événement vedette</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleFormChange("is_active", checked)}
                  />
                  <Label>Actif</Label>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? "Créer" : "Sauvegarder"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="bg-card border-border hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                    {event.is_featured && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Vedette
                      </Badge>
                    )}
                    {!event.is_active && <Badge variant="secondary">Inactif</Badge>}
                  </div>

                  <p className="text-foreground font-medium mb-2 text-base">{event.artist_name}</p>

                  {event.description_fr && (
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{event.description_fr}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md">
                      <Calendar className="h-4 w-4 text-primary" />
                      {format(new Date(event.start_time), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md">
                      <Clock className="h-4 w-4 text-primary" />
                      {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md">
                      <MapPin className="h-4 w-4 text-primary" />
                      {event.stage}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                    {event.ticket_info && (
                      <Badge variant="secondary" className="text-xs">
                        {event.ticket_info}
                      </Badge>
                    )}
                  </div>

                  {event.image_url && (
                    <div className="mt-3">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(event)} disabled={!!editingEvent}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {events.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Aucun événement</h3>
                <p className="text-muted-foreground mb-4">Commencez par créer votre premier événement.</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
