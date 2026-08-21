import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export default function Admin() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const checkAdminAuth = () => {
      try {
        const adminSession = localStorage.getItem("admin_session");
        if (adminSession) {
          const session = JSON.parse(adminSession);
          // Check if session is still valid (less than 24 hours old)
          const isValid = Date.now() - session.timestamp < 24 * 60 * 60 * 1000;
          if (isValid) {
            setAdminUser(session.user);
          } else {
            localStorage.removeItem("admin_session");
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("admin_session");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();

    // Listen for admin login events
    const handleAdminLogin = (event: CustomEvent) => {
      setAdminUser(event.detail);
      setLoading(false);
    };

    window.addEventListener("admin_login", handleAdminLogin as EventListener);

    return () => {
      window.removeEventListener("admin_login", handleAdminLogin as EventListener);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("admin_session");
      setAdminUser(null);
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin />;
  }

  return <AdminDashboard user={adminUser} onLogout={handleLogout} />;
}