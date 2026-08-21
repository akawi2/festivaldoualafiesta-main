import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MissGalleryImage {
  id: string;
  miss_candidate_id: string | null;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  is_active: boolean;
}

interface MissCandidate {
  id: string;
  name: string;
}

export const MissGalleryManager = () => {
  const [images, setImages] = useState<MissGalleryImage[]>([]);
  const [candidates, setCandidates] = useState<MissCandidate[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showInGallery, setShowInGallery] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("MDF 2024");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
    fetchCandidates();
    fetchCategories();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("miss_gallery_images_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "miss_gallery_images",
        },
        (payload) => {
          console.log("Miss gallery image change:", payload);
          fetchImages();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("miss_gallery_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error("Error fetching images:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase.from("miss_candidates").select("id, name").order("name");

      if (error) throw error;
      setCandidates(data || []);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_categories")
        .select("id, name, is_active")
        .eq("is_active", true)
        .eq("place_it", "miss")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage.from("miss-gallery").upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("miss-gallery").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImageToStorage(selectedFile);

      const { error } = await supabase.from("miss_gallery_images").insert({
        miss_candidate_id: selectedCandidateId === "none" ? null : selectedCandidateId || null,
        image_url: imageUrl,
        category: selectedCategory,
        is_active: isActive,
        display_order: images.length,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Image ajoutée avec succès",
      });

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding image:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedCandidateId("");
    setSelectedFile(null);
    setIsActive(false);
    setShowInGallery(true);
    setSelectedCategory("MDF 2024");
  };

  // Ligne 191
  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      // CORRECTION: On inverse l'état 'is_active' de l'image passée en argument
      const newActiveStatus = !is_active;

      const { error } = await supabase
        .from("miss_gallery_images")
        // Utilise le nouvel état calculé
        .update({ is_active: newActiveStatus })
        .eq("id", id);

      if (error) throw error;

      // Déterminer le statut pour le message de succès
      const statusText = newActiveStatus ? "activée" : "désactivée";

      toast({
        title: "Succès",
        // Utilise le statut correct pour le message
        description: `Image ${statusText} avec succès`,
      });

      // Rafraîchir la liste des images (important pour la mise à jour de l'UI)
      await fetchImages();
    } catch (error: any) {
      console.error("Error toggling active status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };
  // Ligne 212 (fin de la fonction)

  const deleteImage = async (id: string, imageUrl: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;

    try {
      // Delete from storage
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("miss-gallery").remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase.from("miss_gallery_images").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Image supprimée avec succès",
      });
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      });
    }
  };

  const moveImage = async (id: string, currentOrder: number, direction: "up" | "down") => {
    const targetOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    const targetImage = images.find((img) => img.display_order === targetOrder);

    if (!targetImage) return;

    try {
      await supabase.from("miss_gallery_images").update({ display_order: targetOrder }).eq("id", id);

      await supabase.from("miss_gallery_images").update({ display_order: currentOrder }).eq("id", targetImage.id);

      fetchImages();
    } catch (error: any) {
      console.error("Error moving image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de déplacer l'image",
        variant: "destructive",
      });
    }
  };

  const getCandidateName = (candidateId: string | null) => {
    if (!candidateId) return "Non attribuée";
    const candidate = candidates.find((c) => c.id === candidateId);
    return candidate?.name || "Candidate inconnue";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Galerie Miss</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une image à la galerie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="candidate">Candidate (optionnel)</Label>
                <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune candidate</SelectItem>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showInGallery"
                  checked={showInGallery}
                  onCheckedChange={(checked) => setShowInGallery(checked as boolean)}
                />
                <Label htmlFor="showInGallery" className="cursor-pointer">
                  Afficher dans la galerie des Miss
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Afficher dans le profil de la candidate
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>
                  Annuler
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Ajout en cours..." : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Aucune image dans la galerie</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter la première image
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={getCandidateName(image.miss_candidate_id)}
                  className="w-full h-full object-contain object-center"
                />
                {image.is_active && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Active
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <p className="font-medium">{getCandidateName(image.miss_candidate_id)}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleActive(image.id, image.is_active)}>
                    {image.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(image.id, image.display_order, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(image.id, image.display_order, "down")}
                    disabled={index === images.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteImage(image.id, image.image_url)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
