import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Heart, Star, ArrowUp, ArrowDown } from "lucide-react";

interface KwattHero {
  id: string;
  name: string;
  category: string;
  description_fr: string;
  description_en: string;
  image_url: string;
  likes_count: number;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface HeroFormData {
  name: string;
  category: string;
  description_fr: string;
  description_en: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

interface GalleryCategory {
  id: string;
  name: string;
  is_active: boolean;
}

export function HerosKwattManager() {
  const [heroes, setHeroes] = useState<KwattHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<KwattHero | null>(null);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Littérature");
  const [formData, setFormData] = useState<HeroFormData>({
    name: "",
    category: "Littérature",
    description_fr: "",
    description_en: "",
    image_url: "",
    is_active: true,
    is_featured: false,
    display_order: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchHeroes();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_categories")
        .select("id, name, is_active")
        .eq("is_active", true)
        .eq("place_it", "heros")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("kwatt_heroes")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setHeroes(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des héros:", error);
      toast.error("Impossible de charger les héros");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hero?: KwattHero) => {
    if (hero) {
      setEditingHero(hero);
      setFormData({
        name: hero.name,
        category: hero.category,
        description_fr: hero.description_fr || "",
        description_en: hero.description_en || "",
        image_url: hero.image_url || "",
        is_active: hero.is_active,
        is_featured: hero.is_featured,
        display_order: hero.display_order,
      });
    } else {
      setEditingHero(null);
      setFormData({
        name: "",
        category: "",
        description_fr: "",
        description_en: "",
        image_url: "",
        is_active: true,
        is_featured: false,
        display_order: heroes.length,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingHero(null);
    setFormData({
      name: "",
      category: "",
      description_fr: "",
      description_en: "",
      image_url: "",
      is_active: true,
      is_featured: false,
      display_order: 0,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadingImage(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("kwatt-heroes").upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("kwatt-heroes").getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingHero) {
        const { error } = await supabase.from("kwatt_heroes").update(formData).eq("id", editingHero.id);

        if (error) throw error;
        toast.success("Héros mis à jour avec succès");
      } else {
        const { error } = await supabase.from("kwatt_heroes").insert([formData]);

        if (error) throw error;
        toast.success("Héros créé avec succès");
      }

      handleCloseDialog();
      fetchHeroes();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement du héros");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce héros ?")) return;

    try {
      const { error } = await supabase.from("kwatt_heroes").delete().eq("id", id);

      if (error) throw error;
      toast.success("Héros supprimé avec succès");
      fetchHeroes();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du héros");
    }
  };

  const handleMoveOrder = async (hero: KwattHero, direction: "up" | "down") => {
    const currentIndex = heroes.findIndex((h) => h.id === hero.id);
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === heroes.length - 1)) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetHero = heroes[targetIndex];

    try {
      await supabase.from("kwatt_heroes").update({ display_order: targetHero.display_order }).eq("id", hero.id);

      await supabase.from("kwatt_heroes").update({ display_order: hero.display_order }).eq("id", targetHero.id);

      fetchHeroes();
    } catch (error) {
      console.error("Erreur lors du changement d'ordre:", error);
      toast.error("Erreur lors du changement d'ordre");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-navy">Gestion des Héros du Kwatt</CardTitle>
              <CardDescription className="text-gray-medium">
                Gérez les héros culturels mis en avant sur le site
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="bg-admin-accent hover:bg-admin-accent/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un héros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-navy">Ordre</TableHead>
                  <TableHead className="text-navy">Nom</TableHead>
                  <TableHead className="text-navy">Catégorie</TableHead>
                  <TableHead className="text-navy">Likes</TableHead>
                  <TableHead className="text-navy">Statut</TableHead>
                  <TableHead className="text-navy">Mis en avant</TableHead>
                  <TableHead className="text-navy text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {heroes.map((hero, index) => (
                  <TableRow key={hero.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-dark">{hero.display_order}</span>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOrder(hero, "up")}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOrder(hero, "down")}
                            disabled={index === heroes.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-dark">{hero.name}</TableCell>
                    <TableCell className="text-gray-dark">{hero.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-gray-dark">{hero.likes_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={hero.is_active ? "default" : "secondary"}
                        className={
                          hero.is_active
                            ? "bg-green-500/10 text-green-700 border-green-500/20"
                            : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                        }
                      >
                        {hero.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hero.is_featured && (
                        <Badge className="bg-gold/10 text-gold border-gold/20">
                          <Star className="h-3 w-3 mr-1" />
                          En vedette
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(hero)}
                          className="text-admin-accent hover:text-admin-accent/80"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(hero.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {heroes.length === 0 && (
            <div className="text-center py-12 text-gray-medium">
              <p>Aucun héros créé pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHero ? "Modifier le héros" : "Ajouter un héros"}</DialogTitle>
            <DialogDescription>Remplissez les informations du héros du Kwatt</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Sarah Mbella"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>

              {/*
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

                */}
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
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

              {/*
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-accent"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
               
              </select>
               */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_fr" className="text-sm form-medium">
                Description (français)
              </Label>
              <Textarea
                /* id="description" */
                value={formData.description_fr}
                onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                placeholder="Décrivez les accomplissements du héros... (texte en français)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_en" className="text-sm form-medium">
                Description (anglais)
              </Label>
              <Textarea
                /* id="description" */
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Décrivez les accomplissements du héros... (texte en anglais)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_file">Image du héros</Label>
              <Input
                id="image_file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
              />
              {uploadingImage && <p className="text-sm text-gray-medium">Téléchargement en cours...</p>}
              {formData.image_url && (
                <div className="mt-2">
                  <img src={formData.image_url} alt="Aperçu" className="h-32 w-32 object-cover rounded-md" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Ordre d'affichage</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                min="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Héros actif (visible sur le site)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">Mettre en vedette (Héros du jour)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button type="submit" className="bg-admin-accent hover:bg-admin-accent/90 text-white">
                {editingHero ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
