import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateRegistrationPDF } from "@/utils/pdfGenerator";

const retrieveSchema = z.object({
  lastName: z.string().min(2),
  firstName: z.string().min(2),
  birthDate: z.date(),
  height: z.string().min(1),
});

type RetrieveFormData = z.infer<typeof retrieveSchema>;

export const RetrieveRegistration = () => {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<RetrieveFormData>({
    resolver: zodResolver(retrieveSchema),
  });

  const onSubmit = async (data: RetrieveFormData) => {
    setIsSearching(true);

    try {
      const formattedDate = format(data.birthDate, "yyyy-MM-dd");

      const { data: registration, error } = await supabase
        .from("miss_registrations")
        .select("*")
        .eq("name", data.lastName)
        .eq("first_name", data.firstName)
        .eq("date de naissance", formattedDate)
        .eq("taille", data.height)
        .maybeSingle();

      if (error) {
        console.error("Error searching registration:", error);
        toast.error(t("retrieveError"));
        return;
      }

      if (!registration) {
        toast.error(t("registrationNotFound"));
        return;
      }

      toast.success(t("registrationFound"));

      // Prepare data for PDF generation
      const pdfData = {
        lastName: registration.name,
        firstName: registration.first_name,
        birthDate: new Date(registration["date de naissance"]),
        birthPlace: registration.city || "",
        neighborhood: registration.borough || "",
        district: registration.district || "",
        phone: registration.phone || "",
        occupation: registration.profession || "",
        height: registration.taille || "",
        age: registration.age || 0,
        nationalityCamerounaise: true,
        residenceDouala: true,
        ageRange: true,
        celibataire: true,
        disponibilite: true,
        representation: true,
        hasIdPhoto: !!registration.image_url,
        hasIdCard: !!registration.card_url,
        hasParentalAuth: !!registration.auth_url,
      };

      await generateRegistrationPDF(pdfData, language);

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error retrieving registration:", error);
      toast.error(t("retrieveError"));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          {t("retrieveRegistration")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("retrieveRegistrationTitle")}</DialogTitle>
          <DialogDescription>{t("retrieveRegistrationSubtitle")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("lastName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("firstName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => {
                const currentDate = field.value || new Date();
                const day = currentDate.getDate();
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();

                const updateDate = (newDay: number, newMonth: number, newYear: number) => {
                  const date = new Date(newYear, newMonth, newDay);
                  field.onChange(date);
                };

                const months = [
                  { value: "0", label: t("janvier") },
                  { value: "1", label: t("fevrier") },
                  { value: "2", label: t("Mars") },
                  { value: "3", label: t("avril") },
                  { value: "4", label: t("mai") },
                  { value: "5", label: t("juin") },
                  { value: "6", label: t("juillet") },
                  { value: "7", label: t("août") },
                  { value: "8", label: t("septembre") },
                  { value: "9", label: t("octobre") },
                  { value: "10", label: t("novembre") },
                  { value: "11", label: t("décembre") },
                ];

                const years = Array.from({ length: 125 }, (_, i) => new Date().getFullYear() - i);
                const days = Array.from({ length: 31 }, (_, i) => i + 1);

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("birthDate")}</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        value={day.toString()}
                        onValueChange={(value) => updateDate(parseInt(value), month, year)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Jour" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((d) => (
                            <SelectItem key={d} value={d.toString()}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={month.toString()}
                        onValueChange={(value) => updateDate(day, parseInt(value), year)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mois" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={year.toString()}
                        onValueChange={(value) => updateDate(day, month, parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Année" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("height")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 170" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSearching}>
              {isSearching ? "..." : t("searchRegistration")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
