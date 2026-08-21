import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import MissCandidatesManager from "./MissCandidatesManager";
import { ProgramManager } from "./ProgramManager";
import { SiteSettingsManager } from "./SiteSettingsManager";
import { AdminUsersManager } from "./AdminUsersManager";
import { GalleryManager } from "./GalleryManager";
import { HerosKwattManager } from "./HerosKwattManager";
import { TalentsManager } from "./TalentsManager";
import { StandsManager } from "./StandsManager";
import { MissGalleryManager } from "./MissGalleryManager";
import { PartnersManager } from "./PartnersManager";
import { CategoriesManager } from "./CategoriesManager";
import { NewsletterManager } from "./NewsletterManager";
import { AdminSidebar } from "./AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Eye,
  Users,
  Crown,
  Heart,
  UserPlus,
  Lock,
  Unlock,
  UserX,
  UserCheck,
  Download,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

interface DashboardStats {
  totalCandidates: number;
  totalVotes: number;
  totalUsers: number;
  activeCandidates: number;
}

interface MissRegistration {
  id: string;
  name: string;
  first_name: string;
  age: number;
  city: string;
  phone: string;
  district: string;
  taille: string;
  borough: string;
  created_at: string;
  image_url?: string;
  card_url?: string;
  auth_url?: string;
  "date de naissance"?: string;
  profession?: string;
}

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalVotes: 0,
    totalUsers: 0,
    activeCandidates: 0,
  });
  const [registrations, setRegistrations] = useState<MissRegistration[]>([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { votingEnabled, registrationEnabled, updateSetting } = useSiteSettings();
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(registrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRegistrations = registrations.slice(startIndex, endIndex);

  const handleToggleVoting = async () => {
    const success = await updateSetting("voting_enabled", !votingEnabled);
    if (success) {
      toast.success(votingEnabled ? "Votes gelés" : "Votes activés");
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleToggleRegistration = async () => {
    const success = await updateSetting("registration_enabled", !registrationEnabled);
    if (success) {
      toast.success(registrationEnabled ? "Inscriptions fermées" : "Inscriptions ouvertes");
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    console.log("Fetching registrations...");
    try {
      const { data, error } = await supabase
        .from("miss_registrations")
        .select(
          `id, name, age, city, phone, created_at, first_name, taille, district, borough, image_url, card_url, auth_url, "date de naissance", profession`,
        )
        .order("created_at", { ascending: false });

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Setting registrations:", data);
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { count: candidatesCount } = await supabase.from("miss_candidates").select("*", {
        count: "exact",
        head: true,
      });

      const { count: activeCandidatesCount } = await supabase
        .from("miss_candidates")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: votesCount } = await supabase.from("miss_votes").select("*", {
        count: "exact",
        head: true,
      });

      const { count: usersCount } = await supabase.from("admin_users").select("*", {
        count: "exact",
        head: true,
      });

      setStats({
        totalCandidates: candidatesCount || 0,
        totalVotes: votesCount || 0,
        totalUsers: usersCount || 0,
        activeCandidates: activeCandidatesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const handleExportRegistrations = () => {
    if (registrations.length === 0) {
      toast.error("Il n'y a pas d'inscriptions à exporter");
      return;
    }

    // Create CSV content
    const headers = [
      'Nom', 'Prénom', 'Date de naissance', 'Âge', 'Taille (cm)', 
      'Ville de naissance', 'Arrondissement', 'Quartier', 'Téléphone', 
      "Date d'inscription"
    ];
    
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
        reg.name,
        reg.first_name,
        reg['date de naissance'] || '',
        reg.age || '',
        reg.taille || '',
        reg.city || '',
        reg.borough,
        reg.district || '',
        reg.phone || '',
        new Date(reg.created_at).toLocaleDateString('fr-FR')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscriptions_miss_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDeleteSelected = async () => {
    if (selectedRegistrations.length === 0) {
      toast.error("Veuillez sélectionner au moins une inscription à supprimer");
      return;
    }

    try {
      const { error } = await supabase
        .from('miss_registrations')
        .delete()
        .in('id', selectedRegistrations);

      if (error) throw error;

      toast.success(`${selectedRegistrations.length} inscription(s) supprimée(s)`);

      setSelectedRegistrations([]);
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registrations:', error);
      toast.error("Impossible de supprimer les inscriptions");
    }
  };

  const toggleSelectAll = () => {
    if (selectedRegistrations.length === registrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(registrations.map(reg => reg.id));
    }
  };

  const toggleSelectRegistration = (id: string) => {
    setSelectedRegistrations(prev =>
      prev.includes(id) ? prev.filter(regId => regId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      <AdminSidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 overflow-auto">
        <header className="admin-header sticky top-0 z-30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy">
                {activeTab === "overview" && "Vue d'ensemble"}
                {activeTab === "candidates" && "Gestion des Candidates"}
                {activeTab === "miss-gallery" && "Galerie Miss"}
                {activeTab === "heroes" && "Gestion des Héros du Kwatt"}
                {activeTab === "talents" && "Gestion des Talents"}
                {activeTab === "stands" && "Gestion des Stands"}
                {activeTab === "program" && "Gestion du programme"}
                {activeTab === "gallery" && "Gestion de la galerie"}
                {activeTab === "categories" && "Gestion des catégories"}
                {activeTab === "settings" && "Paramètres du site"}
                {activeTab === "users" && "Gestion des utilisateurs"}
                {activeTab === "newsletter" && "Newsletter"}
                {activeTab === "partners" && "Gestion des Partenaires"}
              </h1>
              <p className="text-gray-medium mt-1">Administration du site web Festival Douala Fiesta</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-admin-accent/50 text-admin-accent bg-admin-accent/10">
                En ligne
              </Badge>
              <div className="text-right">
                <p className="text-navy text-sm font-medium">{user.name}</p>
                <p className="text-gray-medium text-xs">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 bg-admin-bg">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="admin-card shadow-elegant hover:shadow-gold transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-navy">Total Candidates</CardTitle>
                    <Crown className="h-5 w-5 text-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gold">{stats.totalCandidates}</div>
                    <p className="text-xs text-gray-medium mt-1">Inscrites au concours</p>
                  </CardContent>
                </Card>

                <Card className="admin-card shadow-elegant hover:shadow-gold transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-navy">Candidates Actives</CardTitle>
                    <UserCheck className="h-5 w-5 text-admin-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-admin-accent">{stats.activeCandidates}</div>
                    <p className="text-xs text-gray-medium mt-1">Visibles sur le site</p>
                  </CardContent>
                </Card>

                <Card className="admin-card shadow-elegant hover:shadow-gold transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-navy">Total Votes</CardTitle>
                    <Heart className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">{stats.totalVotes}</div>
                    <p className="text-xs text-gray-medium mt-1">Votes enregistrés</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="admin-card shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-navy flex items-center gap-2">
                      {votingEnabled ? (
                        <Unlock className="h-5 w-5 text-green-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-red-500" />
                      )}
                      Contrôle des Votes
                    </CardTitle>
                    <CardDescription>
                      {votingEnabled ? "Les votes sont actuellement actifs" : "Les votes sont actuellement gelés"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleToggleVoting}
                      variant={votingEnabled ? "destructive" : "default"}
                      className="w-full shadow-elegant hover:shadow-gold transition-all"
                    >
                      {votingEnabled ? "Geler les votes" : "Activer les votes"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="admin-card shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-navy flex items-center gap-2">
                      {registrationEnabled ? (
                        <UserPlus className="h-5 w-5 text-green-500" />
                      ) : (
                        <UserX className="h-5 w-5 text-red-500" />
                      )}
                      Contrôle des Inscriptions
                    </CardTitle>
                    <CardDescription>
                      {registrationEnabled ? "Les inscriptions sont ouvertes" : "Les inscriptions sont fermées"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleToggleRegistration}
                      variant={registrationEnabled ? "destructive" : "default"}
                      className="w-full shadow-elegant hover:shadow-gold transition-all"
                    >
                      {registrationEnabled ? "Fermer les inscriptions" : "Ouvrir les inscriptions"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              {/*
              <Card className="admin-card  border-admin-border shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-navy">Dernières Inscriptions Miss</CardTitle>
                  <CardDescription>Les 10 dernières candidates inscrites</CardDescription>
                </CardHeader>
              */}

              <Card className="bg-admin-card shadow-elegant">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-5 w-5 text-admin-accent" />
                      <CardTitle className="text-navy">Candidates inscrites</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-admin-accent/50 text-admin-accent bg-admin-accent/10">
                        {registrations.length} inscriptions
                      </Badge>
                      {selectedRegistrations.length > 0 && (
                        <Button 
                          onClick={handleDeleteSelected} 
                          variant="destructive" 
                          size="sm"
                          className="shadow-elegant hover:shadow-gold transition-all"
                        >
                          Supprimer ({selectedRegistrations.length})
                        </Button>
                      )}
                      <Button
                        onClick={handleExportRegistrations}
                        variant="outline"
                        size="sm"
                        className="shadow-elegant hover:shadow-gold transition-all"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en CSV
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-gray-medium">
                    Dernières candidatures reçues pour le concours Miss
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-navy w-12">
                          <Checkbox
                            checked={selectedRegistrations.length === registrations.length && registrations.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="text-navy">Nom</TableHead>
                        <TableHead className="text-navy">Prénom</TableHead>
                        <TableHead className="text-navy">Date de naissance</TableHead>
                        <TableHead className="text-navy">Âge</TableHead>
                        <TableHead className="text-navy">Taille (cm)</TableHead>
                        <TableHead className="text-navy">Ville de naissance</TableHead>
                        <TableHead className="text-navy">Arrondissement</TableHead>
                        <TableHead className="text-navy">Quartier</TableHead>
                        <TableHead className="text-navy">Téléphone</TableHead>
                        <TableHead className="text-navy">Date d'inscription</TableHead>
                        <TableHead className="text-navy">Photo</TableHead>
                        <TableHead className="text-navy">Cni</TableHead>
                        <TableHead className="text-navy">Autorisation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRegistrations.map((registration) => (
                        <TableRow 
                          key={registration.id}
                          className={!registration.card_url ? "bg-red-50/50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedRegistrations.includes(registration.id)}
                              onCheckedChange={() => toggleSelectRegistration(registration.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-gray-dark">{registration.name}</TableCell>
                          <TableCell className="font-medium text-gray-dark">{registration.first_name}</TableCell>
                          <TableCell className="font-medium text-gray-dark">
                            {registration["date de naissance"]}
                          </TableCell>
                          <TableCell className="text-gray-dark">{registration.age}</TableCell>
                          <TableCell className="text-gray-dark">{registration.taille}</TableCell>
                          <TableCell className="text-gray-dark">{registration.city}</TableCell>
                          <TableCell className="font-medium text-gray-dark">{registration.district}</TableCell>
                          <TableCell className="font-medium text-gray-dark">{registration.borough}</TableCell>
                          <TableCell className="text-gray-dark">{registration.phone}</TableCell>
                          <TableCell className="text-gray-dark">
                            {new Date(registration.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="text-gray-dark">
                            {registration.image_url ? (
                              <a
                                href={registration.image_url}
                                download
                                className="text-gray hover:underline inline-flex items-center gap-1"
                              >
                                📷 Télécharger
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-gray-dark">
                            {registration.card_url ? (
                              <a
                                href={registration.card_url}
                                download
                                className="text-gray hover:underline inline-flex items-center gap-1"
                              >
                                🪪 Télécharger
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-gray-dark">
                            {registration.auth_url ? (
                              <a
                                href={registration.auth_url}
                                download
                                className="text-gray hover:underline inline-flex items-center gap-1"
                              >
                                📄 Télécharger
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          
                          {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1;
                            // Afficher les 3 premières pages, les 3 dernières, et la page courante avec ses voisines
                            if (
                              page === 1 || 
                              page === totalPages || 
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (
                              page === currentPage - 2 || 
                              page === currentPage + 2
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <span className="px-4">...</span>
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "candidates" && <MissCandidatesManager />}
          {activeTab === "miss-gallery" && <MissGalleryManager />}
          {activeTab === "heroes" && <HerosKwattManager />}
          {activeTab === "talents" && <TalentsManager />}
          {activeTab === "stands" && <StandsManager />}
          {activeTab === "program" && <ProgramManager />}
          {activeTab === "gallery" && <GalleryManager />}
          {activeTab === "categories" && <CategoriesManager />}
          {activeTab === "settings" && <SiteSettingsManager />}
          {activeTab === "users" && <AdminUsersManager />}
          {activeTab === "newsletter" && <NewsletterManager />}
          {activeTab === "partners" && <PartnersManager />}
        </div>
      </main>
    </div>
  );
}
