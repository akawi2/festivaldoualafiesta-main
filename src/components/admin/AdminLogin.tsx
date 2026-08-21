import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Power } from "lucide-react";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the secure admin_login function
      const { data, error } = await supabase.rpc('admin_login', {
        p_email: email,
        p_password: password
      });

      if (error) {
        console.error("Login error:", error);
        toast.error("Erreur lors de la connexion");
        return;
      }

      if (!data || data.length === 0) {
        toast.error("Email ou mot de passe incorrect");
        return;
      }

      const adminUser = data[0];
      
      // Store admin session in localStorage
      localStorage.setItem("admin_session", JSON.stringify({
        user: adminUser,
        timestamp: Date.now()
      }));
      
      toast.success("Connexion réussie");
      // Trigger a custom event to notify parent component
      window.dispatchEvent(new CustomEvent("admin_login", { detail: adminUser }));
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-navy/90 border-gold/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gold">
            Administration
          </CardTitle>
          <CardDescription className="text-gold/70">
            Connectez-vous pour accéder au panneau d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gold/70" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-navy/50 border-gold/30 text-gold placeholder:text-gold/50"
                  placeholder="admin@doualafiestaevents.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gold">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gold/70" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-navy/50 border-gold/30 text-gold placeholder:text-gold/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gold/70 hover:text-gold"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-gold text-navy font-semibold hover:scale-105 transition-transform"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              onClick={() => navigate("/")}
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-gold/10 hover:bg-gold/20 text-gold hover:text-gold border-2 border-gold/30 hover:border-gold/50 transition-all hover:scale-110"
              title="Retour à l'accueil"
            >
              <Power className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}