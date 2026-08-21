import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, RefreshCw, Settings } from "lucide-react";
import { useAutoSave } from "@/hooks/useAutoSave";

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  category: string;
  updated_at: string;
}

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Auto-save hook
  const { debouncedSave, forceSave } = useAutoSave({
    delay: 3000, // Save after 3 seconds of inactivity
    onSave: async (data) => {
      await handleSaveInternal(data, true); // true indicates auto-save
    },
    onSuccess: () => {
      // Success handled in handleSave
    },
    onError: (error) => {
      console.error("Auto-save error:", error);
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").order("category", { ascending: true });

      if (error) throw error;

      setSettings(data || []);

      // Initialize form data
      const initialFormData: Record<string, string> = {};
      data?.forEach((setting) => {
        initialFormData[setting.key] =
          typeof setting.value === "string"
            ? setting.value.replace(/^"|"$/g, "") // Remove quotes
            : JSON.stringify(setting.value);
      });
      setFormData(initialFormData);
    } catch (error) {
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInternal = async (dataToSave?: any, isAutoSave = false) => {
    setSaving(true);
    try {
      const saveData = dataToSave || formData;

      // Update each setting
      for (const setting of settings) {
        const newValue = saveData[setting.key];
        if (newValue !== undefined) {
          const { error } = await supabase
            .from("site_settings")
            .update({
              value: JSON.stringify(newValue),
              updated_at: new Date().toISOString(),
            })
            .eq("key", setting.key);

          if (error) throw error;
        }
      }

      if (!isAutoSave) {
        toast.success("Paramètres sauvegardés avec succès");
      }
      fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      if (!isAutoSave) {
        toast.error("Erreur lors de la sauvegarde des paramètres");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => forceSave(formData);

  const handleInputChange = (key: string, value: string) => {
    const newFormData = {
      ...formData,
      [key]: value,
    };
    setFormData(newFormData);

    // Trigger auto-save
    debouncedSave(newFormData);
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter((setting) => setting.category === category);
  };

  const renderSettingInput = (setting: SiteSetting) => {
    const value = formData[setting.key] || "";

    if (setting.key.includes("description") || setting.key.includes("hero_")) {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleInputChange(setting.key, e.target.value)}
          className="bg-white border-admin-border"
          rows={3}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => handleInputChange(setting.key, e.target.value)}
        className="bg-white border-admin-border"
      />
    );
  };

  if (loading) {
    return <div className="text-admin-accent text-center">Chargement...</div>;
  }

  const categories = [...new Set(settings.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-admin-accent/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-admin-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-admin-accent">Paramètres du site</h2>
            <p className="text-gray-600 text-sm">Configuration générale de Douala Fiesta</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={fetchSettings}
            variant="outline"
            className="border-admin-border hover:bg-admin-card-secondary"
            disabled={saving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleSave} className="bg-admin-accent text-white hover:opacity-90" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder maintenant"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={categories[0]} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border-admin-border">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="text-gray-700 data-[state=active]:bg-admin-accent data-[state=active]:text-white"
            >
              {category === "general" && "Paramètres généraux"}
              {category === "homepage" && "Page d'accueil"}
              {category === "contact" && "Contact"}
              {category === "social" && "Réseaux sociaux"}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <Card className="bg-white border-admin-border">
              <CardHeader>
                <CardTitle className="text-admin-accent">
                  {category === "general" && "Paramètres généraux"}
                  {category === "homepage" && "Page d'accueil"}
                  {category === "contact" && "Informations de contact"}
                  {category === "social" && "Réseaux sociaux"}
                </CardTitle>
                <CardDescription className="text-gray-600">Configurez les paramètres de cette section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory(category).map((setting) => (
                  <div key={setting.id} className="space-y-3 p-4 rounded-lg bg-admin-card-secondary border border-admin-border">
                    <Label htmlFor={setting.key} className="text-sm font-medium text-gray-700">
                      {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                    {renderSettingInput(setting)}
                    <p className="text-xs text-gray-500">Clé: {setting.key}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
