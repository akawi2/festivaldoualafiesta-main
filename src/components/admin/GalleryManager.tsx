import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Image, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAutoSave } from "@/hooks/useAutoSave";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string;
  description_fr: string | null;
  description_en: string | null;
  image_url: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  name_en?: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description_fr: "",
    description_en: "",
    image_url: "",
    category: "Général",
    is_active: true,
    display_order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { debouncedSave } = useAutoSave({
    delay: 3000,
    onSave: async (data) => {
      await updateImage(data.id, data);
    },
  });

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_categories")
        .select("*")
        .eq("is_active", true)
        .eq("place_it", "mediatheque")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_get_gallery_images");

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des images:", error);
      toast.error("Erreur lors du chargement des images");
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("miss-registration-files").upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("miss-registration-files").getPublicUrl(filePath);

    return publicUrl;
  };

  const createImage = async () => {
    try {
      setUploading(true);

      let imageUrl = formData.image_url;

      if (selectedFile) {
        imageUrl = await uploadFileToStorage(selectedFile);
      }

      const { data, error } = await supabase.rpc("admin_upsert_gallery_image", {
        p_title: formData.title,
        p_category: formData.category,
        p_image_url: imageUrl,
        p_id: null,
        p_description_fr: formData.description_fr || null,
        p_description_en: formData.description_en || null,
        p_is_active: formData.is_active,
        p_display_order: Math.max(...images.map((img) => img.display_order), 0) + 1,
      });

      if (error) throw error;

      await fetchImages();
      toast.success("Image ajoutée avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création de l'image");
    } finally {
      setUploading(false);
    }
  };

  const updateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      // Get current image data
      const currentImage = images.find((img) => img.id === id);
      if (!currentImage) return;

      const { data, error } = await supabase.rpc("admin_upsert_gallery_image", {
        p_title: updates.title ?? currentImage.title,
        p_category: updates.category ?? currentImage.category,
        p_image_url: updates.image_url ?? currentImage.image_url,
        p_id: id,
        p_description_fr: updates.description_fr ?? currentImage.description_fr ?? null,
        p_description_en: updates.description_en ?? currentImage.description_en ?? null,
        p_is_active: updates.is_active ?? currentImage.is_active,
        p_display_order: updates.display_order ?? currentImage.display_order,
      });

      if (error) throw error;

      await fetchImages();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);

      if (error) throw error;

      setImages(images.filter((img) => img.id !== id));
      toast.success("Image supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    // Inversion locale + mise à jour optimiste
    const newActiveStatus = !isActive;
    const previous = images;
    setImages(images.map((img) => (img.id === id ? { ...img, is_active: newActiveStatus } : img)));

    try {
      // Get current image data
      const currentImage = images.find((img) => img.id === id);
      if (!currentImage) {
        toast.error("Image non trouvée");
        setImages(previous);
        return;
      }

      const { error } = await supabase.rpc("admin_upsert_gallery_image", {
        p_title: currentImage.title,
        p_category: currentImage.category,
        p_image_url: currentImage.image_url,
        p_id: id,
        p_description_fr: currentImage.description_fr,
        p_description_en: currentImage.description_en,
        p_is_active: newActiveStatus,
        p_display_order: currentImage.display_order,
      });

      if (error) throw error;

      const statusText = newActiveStatus ? "activée" : "désactivée";
      toast.success(`Image ${statusText} avec succès`);

      // Re-synchroniser avec la base (ordre / autres champs)
      await fetchImages();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      // Revenir à l'état précédent en cas d'échec
      setImages(previous);
      toast.error("Impossible de modifier le statut");
    }
  };

  const moveImage = async (id: string, direction: "up" | "down") => {
    try {
      const currentIndex = images.findIndex((img) => img.id === id);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= images.length) return;

      // Mise à jour optimiste de l'interface pour un retour visuel immédiat
      const reorderedImages = [...images];
      const [movedImage] = reorderedImages.splice(currentIndex, 1);
      reorderedImages.splice(newIndex, 0, movedImage);

      // Mettre à jour immédiatement l'état local
      setImages(reorderedImages);

      // Mettre à jour tous les display_order dans la base de données
      const updatePromises = reorderedImages.map((img, idx) =>
        supabase.from("gallery_images").update({ display_order: idx }).eq("id", img.id),
      );

      await Promise.all(updatePromises);

      toast.success("Ordre mis à jour");
    } catch (error) {
      console.error("Erreur lors du déplacement:", error);
      toast.error("Erreur lors du déplacement");
      // En cas d'erreur, recharger les données pour revenir à l'état correct
      await fetchImages();
    }
  };

  const openEditDialog = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      description_fr: image.description_fr || "",
      description_en: image.description_en || "",
      image_url: image.image_url,
      category: image.category,
      is_active: image.is_active,
      display_order: image.display_order,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description_fr: "",
      description_en: "",
      image_url: "",
      category: "Général",
      is_active: true,
      display_order: 0,
    });
    setEditingImage(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingImage) {
      setUploading(true);
      try {
        let imageUrl = formData.image_url;

        if (selectedFile) {
          imageUrl = await uploadFileToStorage(selectedFile);
        }

        const { error } = await supabase.rpc("admin_upsert_gallery_image", {
          p_title: formData.title,
          p_category: formData.category,
          p_image_url: imageUrl,
          p_id: editingImage.id,
          p_description_fr: formData.description_fr || null,
          p_description_en: formData.description_en || null,
          p_is_active: formData.is_active,
          p_display_order: formData.display_order,
        });

        if (error) throw error;

        await fetchImages();
        toast.success("Image mise à jour avec succès");
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error("Erreur lors de la mise à jour");
      } finally {
        setUploading(false);
      }
    } else {
      await createImage();
    }

    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion de la Galerie</h2>
          <p className="text-muted-foreground">Gérez les images affichées dans la galerie du site</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une image
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingImage ? "Modifier l'image" : "Ajouter une image"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de l'image"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{formData.category === "Vidéo" ? "Vidéo" : "Image"}</label>
                <Input
                  type="file"
                  accept={formData.category === "Vidéo" ? "video/*" : "image/*"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      const url = URL.createObjectURL(file);
                      setFormData({ ...formData, image_url: url });
                    }
                  }}
                  required={!editingImage}
                />
                {formData.image_url && (
                  <div className="mt-2">
                    {formData.category === "Vidéo" ? (
                      <video src={formData.image_url} className="w-40 h-24 object-cover rounded-md" controls />
                    ) : (
                      <img src={formData.image_url} alt="Aperçu" className="w-20 h-20 object-cover rounded-md" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Français)</label>
                <Textarea
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  placeholder="Description en français"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (English)</label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Description in English"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>
                  Annuler
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Upload en cours..." : editingImage ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {image.category === "Vidéo" ? (
                <>
                  <video
                    src={image.image_url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[20px] border-l-primary border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={image.is_active ? "default" : "secondary"}>{image.category}</Badge>
                {!image.is_active && <Badge variant="destructive">Masqué</Badge>}
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Button size="sm" variant="secondary" onClick={() => moveImage(image.id, "up")} disabled={index === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => moveImage(image.id, "down")}
                  disabled={index === images.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{image.description_fr}</p>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => toggleActive(image.id, image.is_active)}>
                  {image.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                  <Button size="sm" variant="outline" onClick={() => openEditDialog(image)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer l'image</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer "{image.title}" ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteImage(image.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <Card className="p-12 text-center">
          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucune image</h3>
          <p className="text-muted-foreground mb-4">Commencez par ajouter votre première image à la galerie.</p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une image
          </Button>
        </Card>
      )}
    </div>
  );
}
