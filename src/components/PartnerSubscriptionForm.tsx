import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorIp, getVisitorFingerprint } from "@/utils/visitorIdentity";

interface CatalogItem {
  key: string;
  category: string | null;
  label_fr: string;
  label_en: string;
  price_fcfa: number | null;
  display_order: number;
}

interface PartnerSubscriptionFormProps {
  kind: "sponsoring" | "visibility";
}

const emptyForm = {
  organization: "",
  representative: "",
  position: "",
  sector: "",
  phone: "",
  email: "",
  contributionType: "financial",
  contributionDetails: "",
};

export const PartnerSubscriptionForm = ({ kind }: PartnerSubscriptionFormProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("partner_catalog")
      .select("key, category, label_fr, label_en, price_fcfa, display_order")
      .eq("kind", kind)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Error loading catalog:", error);
        setCatalog(data || []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const label = (item: CatalogItem) => (i18n.language === "en" ? item.label_en : item.label_fr);
  const formatPrice = (price: number | null) =>
    price === null ? t("contact.spaces.onQuote") : `${price.toLocaleString("fr-FR")} FCFA`;

  const total = useMemo(
    () => catalog.filter((c) => selected.includes(c.key)).reduce((sum, c) => sum + (c.price_fcfa ?? 0), 0),
    [catalog, selected],
  );

  const groups = useMemo(() => {
    if (kind === "sponsoring") return [{ id: "sponsoring", items: catalog }];
    const order = ["media", "digital", "spots", "other"];
    return order
      .map((id) => ({ id, items: catalog.filter((c) => c.category === id) }))
      .filter((g) => g.items.length > 0);
  }, [catalog, kind]);

  const update = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggle = (key: string) => {
    if (kind === "sponsoring") {
      setSelected([key]);
      return;
    }
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selected.length === 0) {
      toast({ title: t("activities.forms.errorTitle"), description: t("contact.spaces.pickOne"), variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const [ip, fingerprint] = await Promise.all([getVisitorIp(), getVisitorFingerprint()]);

      const { error } = await supabase.rpc("submit_partner_subscription", {
        p_kind: kind,
        p_organization_name: form.organization.trim(),
        p_representative_name: form.representative.trim(),
        p_representative_position: form.position.trim() || null,
        p_activity_sector: form.sector.trim() || null,
        p_phone: form.phone.trim(),
        p_email: form.email.trim(),
        p_item_keys: selected,
        p_contribution_type: kind === "sponsoring" ? form.contributionType : null,
        p_contribution_details: kind === "sponsoring" ? form.contributionDetails.trim() || null : null,
        p_ip: ip,
        p_fingerprint: fingerprint,
      });

      if (error) {
        toast({
          title: t("activities.forms.errorTitle"),
          description: error.code === "P0001" ? error.message : t("contact.spaces.errorText"),
          variant: "destructive",
        });
        return;
      }

      toast({ title: t("contact.spaces.successTitle"), description: t("contact.spaces.successText") });

      setForm(emptyForm);
      setSelected([]);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: t("activities.forms.errorTitle"),
        description: t("contact.spaces.errorText"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass = "block text-sm font-medium text-foreground mb-2";
  const inputType = kind === "sponsoring" ? "radio" : "checkbox";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          {kind === "sponsoring" ? t("contact.spaces.sponsoringTitle") : t("contact.spaces.visibilityTitle")} *
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("contact.spaces.loading")}</p>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.id} className="space-y-2">
                {kind === "visibility" && (
                  <h4 className="text-sm font-semibold text-gold">{t(`contact.spaces.groups.${group.id}`)}</h4>
                )}
                {group.items.map((item) => {
                  const checked = selected.includes(item.key);
                  return (
                    <label
                      key={item.key}
                      className={`flex items-center justify-between gap-3 min-h-[44px] p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        checked ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type={inputType}
                          name={kind === "sponsoring" ? "pack" : undefined}
                          checked={checked}
                          onChange={() => toggle(item.key)}
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                        />
                        <span className="text-sm font-medium text-foreground">{label(item)}</span>
                      </span>
                      <span className="text-sm font-bold bg-gradient-gold bg-clip-text text-transparent whitespace-nowrap">
                        {formatPrice(item.price_fcfa)}
                      </span>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">{t("contact.spaces.total")}: </span>
            <span className="font-bold text-gold">{total.toLocaleString("fr-FR")} FCFA</span>
          </p>
        )}
      </div>

      {kind === "sponsoring" && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground mb-2">{t("contact.spaces.contribution")}</legend>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "financial", label: t("contact.spaces.financial") },
              { value: "in_kind", label: t("contact.spaces.inKind") },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 min-h-[44px] cursor-pointer text-sm">
                <input
                  type="radio"
                  name="contributionType"
                  value={opt.value}
                  checked={form.contributionType === opt.value}
                  onChange={update("contributionType")}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <div>
            <label htmlFor={`${kind}-details`} className={labelClass}>
              {t("contact.spaces.contributionDetails")}
            </label>
            <Input id={`${kind}-details`} value={form.contributionDetails} onChange={update("contributionDetails")} maxLength={300} />
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor={`${kind}-org`} className={labelClass}>
          {t("contact.spaces.organization")} *
        </label>
        <Input id={`${kind}-org`} required maxLength={150} value={form.organization} onChange={update("organization")} />
      </div>

      <div>
        <label htmlFor={`${kind}-rep`} className={labelClass}>
          {t("contact.spaces.representative")} *
        </label>
        <Input id={`${kind}-rep`} required maxLength={120} value={form.representative} onChange={update("representative")} autoComplete="name" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${kind}-pos`} className={labelClass}>
            {t("contact.spaces.position")}
          </label>
          <Input id={`${kind}-pos`} maxLength={120} value={form.position} onChange={update("position")} />
        </div>
        <div>
          <label htmlFor={`${kind}-sector`} className={labelClass}>
            {t("contact.spaces.sector")}
          </label>
          <Input id={`${kind}-sector`} maxLength={120} value={form.sector} onChange={update("sector")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${kind}-phone`} className={labelClass}>
            {t("contact.spaces.phone")} *
          </label>
          <Input id={`${kind}-phone`} type="tel" required maxLength={30} placeholder="+237 655 55 11 50" value={form.phone} onChange={update("phone")} autoComplete="tel" />
        </div>
        <div>
          <label htmlFor={`${kind}-email`} className={labelClass}>
            {t("contact.spaces.email")} *
          </label>
          <Input id={`${kind}-email`} type="email" required maxLength={150} value={form.email} onChange={update("email")} autoComplete="email" />
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting || loading}
        className="w-full bg-gradient-gold text-navy font-semibold text-lg py-3 hover:scale-105 transition-transform shadow-gold"
      >
        {submitting
          ? t("contact.spaces.sending")
          : kind === "sponsoring"
            ? t("contact.spaces.submitSponsoring")
            : t("contact.spaces.submitVisibility")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("contact.standTypes.invoiceNote")}</p>
    </form>
  );
};

export default PartnerSubscriptionForm;
