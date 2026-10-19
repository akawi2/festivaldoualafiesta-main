import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorIp, getVisitorFingerprint } from "@/utils/visitorIdentity";

export type ActivityDiscipline = "mami_makala" | "papa_beignet" | "besua";

interface ActivityRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disciplines: ActivityDiscipline[];
  title: string;
}

const emptyForm = {
  discipline: "" as ActivityDiscipline | "",
  fullName: "",
  age: "",
  commercialName: "",
  district: "",
  experience: "",
  phone: "",
  weight: "",
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const ActivityRegistrationDialog = ({ open, onOpenChange, disciplines, title }: ActivityRegistrationDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...emptyForm, discipline: disciplines.length === 1 ? disciplines[0] : "" });
  const [submitting, setSubmitting] = useState(false);

  const discipline = (form.discipline || (disciplines.length === 1 ? disciplines[0] : "")) as ActivityDiscipline | "";
  const isBesua = discipline === "besua";

  const update = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discipline) return;

    setSubmitting(true);
    try {
      const [ip, fingerprint] = await Promise.all([getVisitorIp(), getVisitorFingerprint()]);

      const { error } = await supabase.rpc("submit_activity_registration", {
        p_discipline: discipline,
        p_full_name: form.fullName.trim(),
        p_age: Number(form.age),
        p_commercial_name: form.commercialName.trim(),
        p_district: form.district.trim(),
        p_experience_years: Number(form.experience),
        p_phone: form.phone.trim(),
        p_weight_category: isBesua ? form.weight : null,
        p_ip: ip,
        p_fingerprint: fingerprint,
      });

      if (error) {
        toast({
          title: t("activities.forms.errorTitle"),
          description: error.code === "P0001" ? error.message : t("activities.forms.errorText"),
          variant: "destructive",
        });
        return;
      }

      toast({ title: t("activities.forms.successTitle"), description: t("activities.forms.successText") });
      setForm({ ...emptyForm, discipline: disciplines.length === 1 ? disciplines[0] : "" });
      onOpenChange(false);
    } catch {
      toast({
        title: t("activities.forms.errorTitle"),
        description: t("activities.forms.errorText"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const label = "block text-sm font-medium text-foreground mb-2";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{t("activities.forms.for")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {disciplines.length > 1 && (
            <div>
              <label htmlFor="ar-discipline" className={label}>
                {t("activities.forms.discipline")} *
              </label>
              <select id="ar-discipline" required value={form.discipline} onChange={update("discipline")} className={selectClass}>
                <option value="">{t("activities.forms.choose")}</option>
                {disciplines.map((d) => (
                  <option key={d} value={d}>
                    {t(`activities.forms.${d}`)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="ar-name" className={label}>
              {t("activities.forms.fullName")} *
            </label>
            <Input id="ar-name" required maxLength={120} value={form.fullName} onChange={update("fullName")} autoComplete="name" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ar-age" className={label}>
                {t("activities.forms.age")} *
              </label>
              <Input id="ar-age" type="number" inputMode="numeric" required min={10} max={99} value={form.age} onChange={update("age")} />
            </div>
            <div>
              <label htmlFor="ar-exp" className={label}>
                {t("activities.forms.experience")} *
              </label>
              <Input id="ar-exp" type="number" inputMode="numeric" required min={0} max={80} value={form.experience} onChange={update("experience")} />
            </div>
          </div>

          <div>
            <label htmlFor="ar-commercial" className={label}>
              {isBesua ? t("activities.forms.commercialNameBesua") : t("activities.forms.commercialName")} *
            </label>
            <Input id="ar-commercial" required maxLength={120} value={form.commercialName} onChange={update("commercialName")} />
          </div>

          <div>
            <label htmlFor="ar-district" className={label}>
              {t("activities.forms.district")} *
            </label>
            <Input id="ar-district" required maxLength={120} value={form.district} onChange={update("district")} />
          </div>

          <div>
            <label htmlFor="ar-phone" className={label}>
              {t("activities.forms.phone")} *
            </label>
            <Input id="ar-phone" type="tel" required maxLength={30} placeholder="+237 6XX XX XX XX" value={form.phone} onChange={update("phone")} autoComplete="tel" />
          </div>

          {isBesua && (
            <div>
              <label htmlFor="ar-weight" className={label}>
                {t("activities.forms.weight")} *
              </label>
              <select id="ar-weight" required value={form.weight} onChange={update("weight")} className={selectClass}>
                <option value="">{t("activities.forms.choose")}</option>
                <option value="light">{t("activities.forms.light")}</option>
                <option value="heavy">{t("activities.forms.heavy")}</option>
              </select>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-gold text-navy font-semibold text-lg py-3 hover:scale-105 transition-transform shadow-gold"
          >
            {submitting ? t("activities.forms.sending") : t("activities.forms.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityRegistrationDialog;
