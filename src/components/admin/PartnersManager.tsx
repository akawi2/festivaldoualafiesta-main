import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  partner_type: string;
  website_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const PartnersManager = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    partner_type: "Partenaire Principal",
    website_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_get_partners");

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Erreur lors du chargement des partenaires");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      partner_type: "Partenaire Principal",
      website_url: "",
      is_active: true,
    });
    setSelectedFile(null);
    setEditingPartner(null);
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      partner_type: partner.partner_type,
      website_url: partner.website_url || "",
      is_active: partner.is_active,
    });
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = editingPartner?.logo_url || null;

      // Upload logo if a file was selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from("partner-logos").upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("partner-logos").getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      // Use the SECURITY DEFINER function to bypass RLS
      const { data, error } = await supabase.rpc("admin_upsert_partner", {
        p_name: formData.name,
        p_partner_type: formData.partner_type,
        p_id: editingPartner?.id || null,
        p_logo_url: logoUrl,
        p_website_url: formData.website_url || null,
        p_is_active: formData.is_active,
        p_display_order: editingPartner ? editingPartner.display_order : partners.length,
      });

      if (error) throw error;
      toast.success(editingPartner ? "Partenaire mis à jour avec succès" : "Partenaire créé avec succès");

      setDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast.error("Erreur lors de l'enregistrement du partenaire");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) return;

    try {
      const { data, error } = await supabase.rpc("admin_delete_partner", { p_id: id });

      if (error) throw error;
      if (!data) throw new Error("Échec de la suppression");
      
      toast.success("Partenaire supprimé avec succès");
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("Erreur lors de la suppression du partenaire");
    }
  };

  const toggleActive = async (partner: Partner) => {
    try {
      const { data, error } = await supabase.rpc("admin_toggle_partner_active", { 
        p_id: partner.id, 
        p_is_active: !partner.is_active 
      });

      if (error) throw error;
      if (!data) throw new Error("Échec de la mise à jour du statut");
      
      toast.success(`Partenaire ${!partner.is_active ? "activé" : "désactivé"}`);
      fetchPartners();
    } catch (error) {
      console.error("Error toggling partner status:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-navy">Gestion des Partenaires</CardTitle>
              <CardDescription className="text-gray-medium">Gérer l'enregistrement des Partenaires</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-admin-accent hover:bg-admin-accent/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Partenaire
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-navy">Logo</TableHead>
                  <TableHead className="text-navy">Nom</TableHead>
                  <TableHead className="text-navy">Type</TableHead>
                  <TableHead className="text-navy">Site Web</TableHead>
                  <TableHead className="text-navy">Statut</TableHead>
                  <TableHead className="text-navy">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      {partner.logo_url && (
                        <img src={partner.logo_url} alt={partner.name} className="h-12 w-12 object-contain" />
                      )}
                    </TableCell>
                    <TableCell className="text-navy">{partner.name}</TableCell>
                    <TableCell className="text-navy">{partner.partner_type}</TableCell>
                    <TableCell className="text-navy">
                      {partner.website_url && (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:underline flex items-center gap-1"
                        >
                          Visiter <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={partner.is_active ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleActive(partner)}
                        className={partner.is_active ? "bg-green-600 text-white" : ""}
                      >
                        {partner.is_active ? "Actif" : "Inactif"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(partner)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(partner.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="bg-white text-navy">
          <DialogHeader>
            <DialogTitle>{editingPartner ? "Modifier le Partenaire" : "Ajouter un Partenaire"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Partenaire *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                /*className="bg-white/50 border-gold/30 text-navy/50"*/
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo du Partenaire</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                /*className="bg-navy/50 border-gold/30 text-white"*/
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de Partenaire *</Label>
              <Select
                value={formData.partner_type}
                onValueChange={(value) => setFormData({ ...formData, partner_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy text-white">
                  <SelectItem value="Partenaire Principal">Partenaire Principal</SelectItem>
                  <SelectItem value="Partenaire Média">Partenaire Média</SelectItem>
                  <SelectItem value="Partenaire Technique">Partenaire Technique</SelectItem>
                  <SelectItem value="Sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">URL du Site Web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
                /*className="bg-navy/50 border-gold/30 text-white"*/
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold/90">
                {loading ? "Enregistrement..." : editingPartner ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
