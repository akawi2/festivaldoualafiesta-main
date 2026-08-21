import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminUsersManager() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "admin",
    is_active: true,
  });

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs admin");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user (without password change for now)
        const { error } = await supabase
          .from("admin_users")
          .update({
            email: formData.email,
            name: formData.name,
            role: formData.role,
            is_active: formData.is_active,
          })
          .eq("id", editingUser.id);

        if (error) throw error;
        toast.success("Utilisateur admin mis à jour avec succès");
      } else {
        // Create new user - Note: In production, you'd want to hash the password
        const { error } = await supabase
          .from("admin_users")
          .insert([{
            email: formData.email,
            name: formData.name,
            password_hash: formData.password, // In production, hash this!
            role: formData.role,
            is_active: formData.is_active,
          }]);

        if (error) throw error;
        toast.success("Utilisateur admin créé avec succès");
      }

      setDialogOpen(false);
      resetForm();
      fetchAdminUsers();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role,
      is_active: user.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur admin ?")) return;

    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Utilisateur admin supprimé avec succès");
      fetchAdminUsers();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "admin",
      is_active: true,
    });
    setEditingUser(null);
  };

  if (loading) {
    return <div className="text-admin-accent text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-admin-accent">Utilisateurs administrateurs</h2>
          <p className="text-gray-600">Gérez les comptes d'accès à l'administration</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-admin-accent text-white font-semibold hover:opacity-90 transition-opacity"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-admin-border">
            <DialogHeader>
              <DialogTitle className="text-admin-accent">
                {editingUser ? "Modifier l'administrateur" : "Nouvel administrateur"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Configurez les informations de l'utilisateur administrateur
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-admin-border"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-gray-700">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border-admin-border"
                  required
                />
              </div>
              {!editingUser && (
                <div>
                  <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-white border-admin-border pr-10"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-admin-accent"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="role" className="text-gray-700">Rôle</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="bg-white border-admin-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-admin-border">
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="moderator">Modérateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-gray-700">Compte actif</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-admin-border hover:bg-admin-card-secondary"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-admin-accent text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  {editingUser ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-accent">Administrateurs ({adminUsers.length})</CardTitle>
          <CardDescription className="text-gray-600">
            Liste de tous les utilisateurs ayant accès à l'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun utilisateur administrateur trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-admin-border">
                  <TableHead className="text-gray-700">Nom</TableHead>
                  <TableHead className="text-gray-700">Email</TableHead>
                  <TableHead className="text-gray-700">Rôle</TableHead>
                  <TableHead className="text-gray-700">Statut</TableHead>
                  <TableHead className="text-gray-700">Créé le</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id} className="border-admin-border hover:bg-admin-card-secondary">
                    <TableCell className="text-gray-900 font-medium">{user.name}</TableCell>
                    <TableCell className="text-gray-700">{user.email}</TableCell>
                    <TableCell className="text-gray-700 capitalize">{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active 
                          ? "bg-green-500/20 text-green-600" 
                          : "bg-red-500/20 text-red-600"
                      }`}>
                        {user.is_active ? "Actif" : "Inactif"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                          className="border-admin-border text-admin-accent hover:bg-admin-card-secondary"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}