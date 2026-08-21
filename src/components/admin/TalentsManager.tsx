import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, RefreshCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface TalentSubmission {
  id: string;
  name: string;
  stage_name: string;
  phone: string;
  quartier: string;
  arrondissement: string;
  participation_type: string;
  talent_description: string;
  status: string;
  created_at: string;
}

export function TalentsManager() {
  const [talents, setTalents] = useState<TalentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTalents();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('talent_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'talent_submissions'
        },
        (payload) => {
          console.log('Talent submission change:', payload);
          fetchTalents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTalents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('talent_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTalents(data || []);
    } catch (error) {
      console.error('Error fetching talents:', error);
      toast.error('Erreur lors du chargement des talents');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.rpc('admin_update_talent_status', {
        p_id: id,
        p_status: status
      });

      if (error) throw error;
      toast.success('Statut mis à jour');
      fetchTalents();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'Nom de scène', 'Téléphone', 'Quartier', 'Arrondissement', 'Type de participation', 'Description du talent', 'Statut', 'Date de soumission'].join(','),
      ...talents.map(talent => [
        talent.name,
        talent.stage_name,
        talent.phone,
        talent.quartier,
        talent.arrondissement,
        talent.participation_type,
        `"${talent.talent_description.replace(/"/g, '""')}"`,
        talent.status,
        new Date(talent.created_at).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `soumissions_talents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export CSV réussi');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-600 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.pending}>
        {labels[status as keyof typeof labels] || status}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mic className="h-5 w-5 text-admin-accent" />
              <CardTitle className="text-navy">Soumissions de Talents</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-admin-accent/50 text-admin-accent bg-admin-accent/10">
                {talents.length} soumission{talents.length > 1 ? 's' : ''}
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
                onClick={fetchTalents}
                className="border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-medium">
            Gérez les candidatures pour le concours de talents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {talents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-navy">Nom</TableHead>
                    <TableHead className="text-navy">Nom de scène</TableHead>
                    <TableHead className="text-navy">Téléphone</TableHead>
                    <TableHead className="text-navy">Quartier</TableHead>
                    <TableHead className="text-navy">Arrondissement</TableHead>
                    <TableHead className="text-navy">Type</TableHead>
                    <TableHead className="text-navy">Description</TableHead>
                    <TableHead className="text-navy">Statut</TableHead>
                    <TableHead className="text-navy">Date</TableHead>
                    <TableHead className="text-navy">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {talents.map((talent) => (
                    <TableRow key={talent.id}>
                      <TableCell className="font-medium text-gray-dark">{talent.name}</TableCell>
                      <TableCell className="text-gray-dark">{talent.stage_name}</TableCell>
                      <TableCell className="text-gray-dark">{talent.phone}</TableCell>
                      <TableCell className="text-gray-dark">{talent.quartier}</TableCell>
                      <TableCell className="text-gray-dark">{talent.arrondissement}</TableCell>
                      <TableCell className="text-gray-dark">{talent.participation_type}</TableCell>
                      <TableCell className="text-gray-dark max-w-xs truncate">
                        {talent.talent_description}
                      </TableCell>
                      <TableCell>{getStatusBadge(talent.status)}</TableCell>
                      <TableCell className="text-gray-dark">
                        {new Date(talent.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {talent.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/50 text-green-600 hover:bg-green-500/10"
                              onClick={() => updateStatus(talent.id, 'approved')}
                            >
                              Approuver
                            </Button>
                          )}
                          {talent.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                              onClick={() => updateStatus(talent.id, 'rejected')}
                            >
                              Rejeter
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
              <Mic className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune soumission de talent pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
