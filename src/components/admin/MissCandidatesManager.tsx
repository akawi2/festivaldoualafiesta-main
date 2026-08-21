import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Crown, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MissCandidate {
  id: string;
  name: string;
  age?: number;
  city?: string;
  description_fr?: string;
  description_en?: string;
  image_url?: string;
  votes_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MissCandidatesManager = () => {
  const [candidates, setCandidates] = useState<MissCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<MissCandidate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    city: "",
    description_fr: "",
    description_en: "",
    image_url: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("miss_candidates")
        .select("*")
        .order("votes_count", { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des candidates:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `assets/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("miss-registration-files").upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("miss-registration-files").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Le nom est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const candidateData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.city || null,
        description_fr: formData.description_fr,
        description_en: formData.description_en,
        image_url: imageUrl || null,
        is_active: formData.is_active,
      };

      const { data, error } = await supabase.rpc("admin_upsert_miss_candidate", {
        p_name: candidateData.name,
        p_age: candidateData.age,
        p_city: candidateData.city,
        p_description_fr: candidateData.description_fr,
        p_id: editingCandidate?.id || null,
        p_description_en: candidateData.description_en || null,
        p_image_url: candidateData.image_url || null,
        p_is_active: candidateData.is_active,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: editingCandidate ? "Candidate modifiée avec succès" : "Candidate ajoutée avec succès",
      });

      resetForm();
      setDialogOpen(false);
      fetchCandidates();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la candidate",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (candidate: MissCandidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      age: candidate.age?.toString(),
      city: candidate.city,
      description_fr: candidate.description_fr,
      description_en: candidate.description_en,
      image_url: candidate.image_url,
      is_active: candidate.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette candidate ?")) {
      return;
    }

    try {
      const { error } = await supabase.from("miss_candidates").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Candidate supprimée avec succès",
      });

      fetchCandidates();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la candidate",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      city: "",
      description_fr: "",
      description_en: "",
      image_url: "",
      is_active: true,
    });
    setEditingCandidate(null);
    setImageFile(null);
  };

  const exportToCSV = () => {
    const headers = ["Nom", "Âge", "Ville", "Votes", "Statut"];
    const csvData = candidates.map((c) => [
      c.name,
      c.age || "",
      c.city || "",
      c.votes_count,
      c.is_active ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `candidates_votes_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetVotes = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser tous les votes ? Cette action est irréversible.")) {
      return;
    }

    try {
      // Export CSV first
      exportToCSV();

      // Reset votes
      const { error } = await supabase.rpc("admin_reset_miss_votes");

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les votes ont été réinitialisés et exportés en CSV",
      });

      fetchCandidates();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les votes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Gestion des Candidates Miss
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetVotes}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser les votes
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Candidate
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCandidate ? "Modifier la candidate" : "Nouvelle candidate"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm form-medium">
                  Description (français)
                </Label>
                <Textarea
                  /* id="description" */
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm form-medium">
                  Description (anglais)
                </Label>
                <Textarea
                  /* id="description" */
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Photo de la candidate</Label>
                <Input
                  id="image_url"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                    }
                  }}
                />
                {formData.image_url && !imageFile && (
                  <p className="text-sm text-muted-foreground mt-1">Image actuelle: {formData.image_url}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingCandidate ? "Modifier" : "Ajouter"}</Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Âge</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>{candidate.age || "-"}</TableCell>
                <TableCell>{candidate.city || "-"}</TableCell>
                <TableCell className="font-semibold">{candidate.votes_count}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      candidate.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {candidate.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(candidate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(candidate.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {candidates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Aucune candidate trouvée</div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissCandidatesManager;
