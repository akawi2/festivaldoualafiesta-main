import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TalentApplicationFormProps {
  idPrefix?: string;
  onSuccess?: () => void;
}

const emptyForm = {
  name: "",
  scene: "",
  age: "",
  phone: "",
  quartier: "",
  arrondissement: "",
  participationType: "",
  message: "",
};

const label = "block text-sm font-medium text-foreground mb-2";

export const TalentApplicationForm = ({ idPrefix = "talent", onSuccess }: TalentApplicationFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "participationType" && value === "autre" && !showOtherInput) {
      setShowOtherInput(true);
      setFormData((prev) => ({ ...prev, participationType: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.rpc("submit_talent_application", {
        p_name: formData.name.trim(),
        p_stage_name: formData.scene.trim(),
        p_age: Number(formData.age),
        p_phone: formData.phone || null,
        p_quartier: formData.quartier || null,
        p_arrondissement: formData.arrondissement || null,
        p_participation_type: formData.participationType,
        p_talent_description: formData.message,
      });

      if (error) {
        console.error("Error submitting talent application:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Candidature envoyée !",
        description:
          "Votre candidature pour vous mettre en lumière a été soumise avec succès. Nous vous recontacterons bientôt.",
      });

      setFormData(emptyForm);
      setShowOtherInput(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id("name")} className={label}>
            {t("contact.fullName")} *
          </label>
          <Input
            id={id("name")}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            maxLength={120}
            autoComplete="name"
            placeholder={t("contact.yourFullName")}
          />
        </div>
        <div>
          <label htmlFor={id("scene")} className={label}>
            {t("contact.stageName")} *
          </label>
          <Input
            id={id("scene")}
            name="scene"
            value={formData.scene}
            onChange={handleInputChange}
            required
            maxLength={120}
            placeholder={t("contact.yourStageName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id("age")} className={label}>
            {t("contact.age")} *
          </label>
          <Input
            id={id("age")}
            name="age"
            type="number"
            inputMode="numeric"
            min={5}
            max={99}
            value={formData.age}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor={id("phone")} className={label}>
            {t("contact.phone")}
          </label>
          <Input
            id={id("phone")}
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            autoComplete="tel"
            placeholder="+237 655 55 11 50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id("quartier")} className={label}>
            {t("contact.quartier")}
          </label>
          <Input
            id={id("quartier")}
            name="quartier"
            value={formData.quartier}
            onChange={handleInputChange}
            placeholder={t("contact.yourNeighbor")}
          />
        </div>
        <div>
          <label htmlFor={id("arrondissement")} className={label}>
            {t("contact.arrondissement")}
          </label>
          <Input
            id={id("arrondissement")}
            name="arrondissement"
            value={formData.arrondissement}
            onChange={handleInputChange}
            placeholder={t("contact.yourdistrict")}
          />
        </div>
      </div>

      <div>
        <label htmlFor={id("participationType")} className={label}>
          {t("contact.talentCategory")} *
        </label>
        {!showOtherInput ? (
          <select
            id={id("participationType")}
            name="participationType"
            value={formData.participationType}
            onChange={handleInputChange}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{t("contact.specifyCategory")}</option>
            <option value="musique">{t("contact.music")}</option>
            <option value="peinture">{t("contact.painting")}</option>
            <option value="beaute">{t("contact.beauty")}</option>
            <option value="mode">{t("contact.fashion")}</option>
            <option value="danse">{t("contact.dance")}</option>
            <option value="autre">{t("contact.other")}</option>
          </select>
        ) : (
          <div className="space-y-2">
            <Input
              id={id("participationType")}
              name="participationType"
              value={formData.participationType}
              onChange={handleInputChange}
              required
              placeholder={t("contact.specifyCategory")}
            />
            <button
              type="button"
              onClick={() => {
                setShowOtherInput(false);
                setFormData((prev) => ({ ...prev, participationType: "" }));
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {t("contact.backToOptions")}
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor={id("message")} className={label}>
          {t("contact.tellUsAboutTalent")} *
        </label>
        <Textarea
          id={id("message")}
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={5}
          placeholder={t("contact.describeTalent")}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-gold text-navy font-semibold text-lg py-3 hover:scale-105 transition-transform shadow-gold"
      >
        {t("contact.sendRequest")}
      </Button>
    </form>
  );
};

export default TalentApplicationForm;
