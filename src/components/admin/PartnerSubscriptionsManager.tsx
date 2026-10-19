import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, Loader2, RefreshCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionItem {
  key: string;
  label_fr: string;
  price_fcfa: number | null;
}

interface PartnerSubscription {
  id: string;
  kind: string;
  organization_name: string;
  representative_name: string;
  representative_position: string | null;
  activity_sector: string | null;
  phone: string;
  email: string;
  items: SubscriptionItem[];
  total_price: number;
  contribution_type: string | null;
  contribution_details: string | null;
  status: string;
  created_at: string;
}

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export function PartnerSubscriptionsManager() {
  const [subscriptions, setSubscriptions] = useState<PartnerSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_list_partner_subscriptions");
      if (error) throw error;
      setSubscriptions((data as unknown as PartnerSubscription[]) || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Erreur lors du chargement des souscriptions");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.rpc("admin_update_partner_subscription_status", { p_id: id, p_status: status });
      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchSubscriptions();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const kindLabel = (kind: string) => (kind === "sponsoring" ? "Sponsoring" : "Visibilité");
  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  const itemsLabel = (s: PartnerSubscription) => s.items.map((i) => i.label_fr).join(", ");

  const handleExport = () => {
    const rows = [
      ["Type", "Organisation", "Représentant", "Fonction", "Secteur", "Téléphone", "E-mail", "Choix", "Total (FCFA)", "Contribution", "Détails contribution", "Statut", "Date"],
      ...subscriptions.map((s) => [
        kindLabel(s.kind),
        s.organization_name,
        s.representative_name,
        s.representative_position,
        s.activity_sector,
        s.phone,
        s.email,
        itemsLabel(s),
        s.total_price,
        s.contribution_type === "financial" ? "Financier" : s.contribution_type === "in_kind" ? "En nature" : "",
        s.contribution_details,
        s.status,
        new Date(s.created_at).toLocaleDateString("fr-FR"),
      ]),
    ];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `souscriptions_partenaires_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Export CSV réussi");
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    const labels: Record<string, string> = { pending: "En attente", confirmed: "Confirmé", cancelled: "Annulé" };
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

  const confirmedTotal = subscriptions.filter((s) => s.status === "confirmed").reduce((sum, s) => sum + s.total_price, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-sm font-medium">Souscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-accent">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-accent">{subscriptions.filter((s) => s.status === "pending").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-sm font-medium">Montant confirmé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-accent">{formatPrice(confirmedTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-admin-card border-admin-border shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Handshake className="h-5 w-5 text-admin-accent" />
              <CardTitle className="text-navy">Sponsoring et visibilité</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10">
                <Download className="h-4 w-4 mr-1" />
                Exporter CSV
              </Button>
              <Button variant="outline" size="sm" onClick={fetchSubscriptions} aria-label="Actualiser" className="border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-medium">Souscriptions aux packs de sponsoring (fiche B) et aux espaces de visibilité (fiche C)</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-navy">Type</TableHead>
                    <TableHead className="text-navy">Organisation</TableHead>
                    <TableHead className="text-navy">Contact</TableHead>
                    <TableHead className="text-navy">Choix</TableHead>
                    <TableHead className="text-navy">Total</TableHead>
                    <TableHead className="text-navy">Statut</TableHead>
                    <TableHead className="text-navy">Date</TableHead>
                    <TableHead className="text-navy">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge variant="outline">{kindLabel(s.kind)}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-dark">
                        {s.organization_name}
                        {s.activity_sector && <div className="text-xs text-gray-medium">{s.activity_sector}</div>}
                      </TableCell>
                      <TableCell className="text-gray-dark text-sm">
                        {s.representative_name}
                        {s.representative_position && <span className="text-gray-medium"> ({s.representative_position})</span>}
                        <div>{s.phone}</div>
                        <div>{s.email}</div>
                      </TableCell>
                      <TableCell className="text-gray-dark text-sm max-w-xs">
                        {itemsLabel(s)}
                        {s.contribution_type && (
                          <div className="text-xs text-gray-medium">
                            {s.contribution_type === "financial" ? "Financier" : "En nature"}
                            {s.contribution_details ? ` : ${s.contribution_details}` : ""}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-dark whitespace-nowrap">{formatPrice(s.total_price)}</TableCell>
                      <TableCell>{statusBadge(s.status)}</TableCell>
                      <TableCell className="text-gray-dark">{new Date(s.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-col">
                          {s.status !== "confirmed" && (
                            <Button size="sm" variant="outline" className="border-green-500/50 text-green-600 hover:bg-green-500/10 text-xs" onClick={() => updateStatus(s.id, "confirmed")}>
                              Confirmer
                            </Button>
                          )}
                          {s.status !== "cancelled" && (
                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-600 hover:bg-red-500/10 text-xs" onClick={() => updateStatus(s.id, "cancelled")}>
                              Annuler
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
              <Handshake className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune souscription pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
