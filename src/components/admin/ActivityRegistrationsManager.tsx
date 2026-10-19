import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Loader2, RefreshCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface ActivityRegistration {
  id: string;
  discipline: string;
  full_name: string;
  age: number;
  commercial_name: string;
  district: string;
  experience_years: number;
  phone: string;
  weight_category: string | null;
  status: string;
  created_at: string;
}

const DISCIPLINES: Record<string, string> = {
  mami_makala: "Mami Makala",
  papa_beignet: "Papa Beignet",
  besua: "Besua (lutte)",
};

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export function ActivityRegistrationsManager() {
  const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_list_activity_registrations");
      if (error) throw error;
      setRegistrations((data as unknown as ActivityRegistration[]) || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Erreur lors du chargement des inscriptions");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.rpc("admin_update_activity_registration_status", { p_id: id, p_status: status });
      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const weightLabel = (w: string | null) => (w === "light" ? "Léger (-75 kg)" : w === "heavy" ? "Lourd (+80 kg)" : "");
  const visible = filter === "all" ? registrations : registrations.filter((r) => r.discipline === filter);

  const handleExport = () => {
    const rows = [
      ["Discipline", "Nom et prénom", "Âge", "Nom commercial", "Quartier / arrondissement", "Ancienneté (ans)", "Téléphone", "Catégorie de poids", "Statut", "Date"],
      ...visible.map((r) => [
        DISCIPLINES[r.discipline] || r.discipline,
        r.full_name,
        r.age,
        r.commercial_name,
        r.district,
        r.experience_years,
        r.phone,
        weightLabel(r.weight_category),
        r.status,
        new Date(r.created_at).toLocaleDateString("fr-FR"),
      ]),
    ];
    const blob = new Blob(["﻿" + rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inscriptions_activites_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Export CSV réussi");
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-600 border-green-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    const labels: Record<string, string> = { pending: "En attente", approved: "Retenu", rejected: "Refusé" };
    return (
      <Badge variant="outline" className={styles[status] || styles.pending}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-admin-card border-admin-border shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5 text-admin-accent" />
              <CardTitle className="text-navy">Inscriptions aux activités</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <select
                aria-label="Filtrer par discipline"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-9 rounded-md border border-admin-accent/50 bg-white px-2 text-sm text-admin-accent"
              >
                <option value="all">Toutes les disciplines</option>
                {Object.entries(DISCIPLINES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Badge variant="outline" className="border-admin-accent/50 text-admin-accent bg-admin-accent/10">
                {visible.length} inscription{visible.length > 1 ? "s" : ""}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExport} className="border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10">
                <Download className="h-4 w-4 mr-1" />
                Exporter CSV
              </Button>
              <Button variant="outline" size="sm" onClick={fetchRegistrations} aria-label="Actualiser" className="border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-medium">Mami Makala, Papa Beignet et Besua (lutte traditionnelle)</CardDescription>
        </CardHeader>
        <CardContent>
          {visible.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-navy">Discipline</TableHead>
                    <TableHead className="text-navy">Nom et prénom</TableHead>
                    <TableHead className="text-navy">Âge</TableHead>
                    <TableHead className="text-navy">Nom commercial</TableHead>
                    <TableHead className="text-navy">Quartier / arr.</TableHead>
                    <TableHead className="text-navy">Ancienneté</TableHead>
                    <TableHead className="text-navy">Téléphone</TableHead>
                    <TableHead className="text-navy">Poids</TableHead>
                    <TableHead className="text-navy">Statut</TableHead>
                    <TableHead className="text-navy">Date</TableHead>
                    <TableHead className="text-navy">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="outline">{DISCIPLINES[r.discipline] || r.discipline}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-dark">{r.full_name}</TableCell>
                      <TableCell className="text-gray-dark">{r.age}</TableCell>
                      <TableCell className="text-gray-dark">{r.commercial_name}</TableCell>
                      <TableCell className="text-gray-dark">{r.district}</TableCell>
                      <TableCell className="text-gray-dark">{r.experience_years} an(s)</TableCell>
                      <TableCell className="text-gray-dark">{r.phone}</TableCell>
                      <TableCell className="text-gray-dark">{weightLabel(r.weight_category)}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-gray-dark">{new Date(r.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {r.status !== "approved" && (
                            <Button size="sm" variant="outline" className="border-green-500/50 text-green-600 hover:bg-green-500/10" onClick={() => updateStatus(r.id, "approved")}>
                              Retenir
                            </Button>
                          )}
                          {r.status !== "rejected" && (
                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-600 hover:bg-red-500/10" onClick={() => updateStatus(r.id, "rejected")}>
                              Refuser
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-medium">
              <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune inscription pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
