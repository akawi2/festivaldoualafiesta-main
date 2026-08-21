import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Loader2, RefreshCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface StandReservation {
  id: string;
  stand_name: string;
  stand_phone: string;
  stand_type: string;
  price_fcfa: number;
  quantity: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export function StandsManager() {
  const [stands, setStands] = useState<StandReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStands();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('stand_reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stand_reservations'
        },
        (payload) => {
          console.log('Stand reservation change:', payload);
          fetchStands();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stand_reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStands(data || []);
    } catch (error) {
      console.error('Error fetching stands:', error);
      toast.error('Erreur lors du chargement des stands');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('stand_reservations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success('Statut mis à jour');
      fetchStands();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('stand_reservations')
        .update({ payment_status: paymentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Statut de paiement mis à jour');
      fetchStands();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nom/Entreprise', 'Téléphone', 'Type de Stand', 'Prix Unitaire', 'Quantité', 'Prix Total', 'Statut', 'Paiement', 'Date de Réservation'].join(','),
      ...stands.map(stand => [
        stand.stand_name,
        stand.stand_phone,
        stand.stand_type,
        stand.price_fcfa,
        stand.quantity,
        stand.total_price,
        stand.status,
        stand.payment_status,
        new Date(stand.created_at).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_stands_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export CSV réussi');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      paid: 'bg-green-500/10 text-green-600 border-green-500/20',
      failed: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    
    const labels = {
      pending: 'En attente',
      paid: 'Payé',
      failed: 'Échoué',
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  const totalRevenue = stands.reduce((sum, stand) => sum + (stand.total_price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-sm font-medium">Total Réservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-accent">{stands.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-sm font-medium">Stands Réservés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-accent">
              {stands.reduce((sum, stand) => sum + stand.quantity, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-sm font-medium">Revenu Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-accent">{formatPrice(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-admin-card border-admin-border shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5 text-admin-accent" />
              <CardTitle className="text-navy">Réservations de Stands</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-admin-accent/50 text-admin-accent bg-admin-accent/10">
                {stands.length} réservation{stands.length > 1 ? 's' : ''}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                className="border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10"
              >
                <Download className="h-4 w-4 mr-1" />
                Exporter CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchStands}
                className="border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-medium">
            Gérez les réservations de stands pour l'événement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stands.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-navy">Nom/Entreprise</TableHead>
                    <TableHead className="text-navy">Téléphone</TableHead>
                    <TableHead className="text-navy">Type de Stand</TableHead>
                    <TableHead className="text-navy">Prix Unitaire</TableHead>
                    <TableHead className="text-navy">Quantité</TableHead>
                    <TableHead className="text-navy">Prix Total</TableHead>
                    <TableHead className="text-navy">Statut</TableHead>
                    <TableHead className="text-navy">Paiement</TableHead>
                    <TableHead className="text-navy">Date</TableHead>
                    <TableHead className="text-navy">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stands.map((stand) => (
                    <TableRow key={stand.id}>
                      <TableCell className="font-medium text-gray-dark">{stand.stand_name}</TableCell>
                      <TableCell className="text-gray-dark">{stand.stand_phone}</TableCell>
                      <TableCell className="text-gray-dark">
                        <Badge variant="outline">{stand.stand_type}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-dark">{formatPrice(stand.price_fcfa)}</TableCell>
                      <TableCell className="text-gray-dark">{stand.quantity}</TableCell>
                      <TableCell className="font-medium text-gray-dark">
                        {formatPrice(stand.total_price)}
                      </TableCell>
                      <TableCell>{getStatusBadge(stand.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(stand.payment_status)}</TableCell>
                      <TableCell className="text-gray-dark">
                        {new Date(stand.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-col">
                          <div className="flex gap-2">
                            {stand.status !== 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/50 text-green-600 hover:bg-green-500/10 text-xs"
                                onClick={() => updateStatus(stand.id, 'confirmed')}
                              >
                                Confirmer
                              </Button>
                            )}
                            {stand.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-600 hover:bg-red-500/10 text-xs"
                                onClick={() => updateStatus(stand.id, 'cancelled')}
                              >
                                Annuler
                              </Button>
                            )}
                          </div>
                          {stand.payment_status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500/50 text-blue-600 hover:bg-blue-500/10 text-xs"
                              onClick={() => updatePaymentStatus(stand.id, 'paid')}
                            >
                              Marquer payé
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
              <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune réservation de stand pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
