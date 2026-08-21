import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Ticket,
  ShoppingCart,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Image,
  Calendar,
  Trophy,
  Mic,
  Store,
  FolderOpen,
  Mail,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

interface AdminSidebarProps {
  user: AdminUser;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "overview", label: "Vue d'ensemble MDF", icon: LayoutDashboard },
  { id: "candidates", label: "Votes MDF", icon: Users },
  { id: "miss-gallery", label: "Galerie Miss", icon: Image },
  { id: "heroes", label: "Héros du Kwatt", icon: Trophy },
  { id: "talents", label: "Talents", icon: Mic },
  { id: "stands", label: "Stands", icon: Store },
  { id: "partners", label: "Partenaires", icon: ShoppingCart },
  { id: "program", label: "Programme", icon: Calendar },
  { id: "gallery", label: "Galerie", icon: Image },
  { id: "categories", label: "Catégories", icon: FolderOpen },
  /*{ id: 'settings', label: 'Paramètres', icon: Settings },*/
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "newsletter", label: "Newsletter", icon: Mail },
];

export function AdminSidebar({ user, activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-navy/90 text-gold hover:bg-navy"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen admin-sidebar border-r border-admin-border transition-all duration-300 ease-in-out shadow-elegant flex flex-col overflow-hidden",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold/30">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center shadow-gold">
                <span className="text-white font-bold text-sm">DF</span>
              </div>
              <div className="text-white font-semibold text-sm">Douala Fiesta</div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex text-white hover:bg-white/10"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        <div className={cn("p-4 border-b border-gold/30", isCollapsed && "hidden")}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gold/30 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user.name}</p>
              <p className="text-white/70 text-xs truncate">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10 text-left font-normal transition-all duration-200",
                      isActive
                        ? "bg-gold text-white hover:bg-gold/90 shadow-gold"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                      isCollapsed && "justify-center px-2",
                    )}
                    onClick={() => {
                      onTabChange(item.id);
                      if (window.innerWidth < 768) {
                        setIsMobileOpen(false);
                      }
                    }}
                  >
                    <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gold/30">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 text-white/80 hover:bg-destructive/20 hover:text-destructive transition-all duration-200",
              isCollapsed && "justify-center px-2",
            )}
            onClick={onLogout}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Content Spacer */}
      <div className={cn("transition-all duration-300 ease-in-out md:block hidden", isCollapsed ? "w-16" : "w-64")} />
    </>
  );
}
