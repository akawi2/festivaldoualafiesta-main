import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateRegistrationPDF } from "@/utils/pdfGenerator";
import { useTranslation } from "@/hooks/useTranslation";

type FormValues = {
  firstName: string;
  lastName: string;
  birthDate: Date;
  age: number;
  height: string;
  birthPlace: string;
  neighborhood: string;
  district: string;
  phone: string;
  occupation: string;
  idPhoto?: any;
  idCard?: any;
  parentalAuth?: any;
  nationalityCamerounaise: boolean;
  residenceDouala: boolean;
  ageRange: boolean;
  celibataire: boolean;
  disponibilite: boolean;
  representation: boolean;
};

export function RegistrationForm() {
  const [step, setStep] = useState(1);
  const { t, language } = useTranslation();

  const formSchema = z.object({
    firstName: z.string().min(2, t("firstNameMinError")).max(50),
    lastName: z.string().min(2, t("lastNameMinError")).max(50),
    birthDate: z.date({
      required_error: t("birthDateRequired"),
    }),
    age: z.number().min(18, t("ageMinError")).max(28, t("ageMaxError")),
    height: z.string().regex(/^\d{1,3}$/, t("heightInvalid")),
    birthPlace: z.string().min(2, t("birthPlaceRequired")).max(100),
    neighborhood: z.string().min(2, t("neighborhoodRequired")).max(100),
    district: z.string().min(1, t("districtRequired")).max(50),
    phone: z
      .string()
      .regex(/^[+]?[\d\s()-]+$/, t("phoneInvalid"))
      .min(8)
      .max(20),
    occupation: z.string().min(2, t("occupationRequired")).max(100),
    idPhoto: z
      .any()
      .optional()
      .refine((file) => {
        if (!file || !(file instanceof File)) return true;
        const validTypes = ["image/png", "image/jpg", "image/jpeg"];
        return validTypes.includes(file.type);
      }, t("invalidPhotoFormat"))
      .refine((file) => {
        if (!file || !(file instanceof File)) return true;
        return file.size <= 5 * 1024 * 1024; // 5MB
      }, t("fileTooLarge")),

    idCard: z
      .any()
      .optional()
      .refine((file) => {
        if (!file || !(file instanceof File)) return true;
        const validTypes = ["application/pdf"];
        return validTypes.includes(file.type);
      }, t("invalidPhotoFormat"))
      .refine((file) => {
        if (!file || !(file instanceof File)) return true;
        return file.size <= 5 * 1024 * 1024; // 5MB
      }, t("fileTooLarge")),
    parentalAuth: z
      .any()
      .optional()
      .refine((file) => {
        if (!file || !(file instanceof File)) return true;
        const validTypes = ["application/pdf"];
        return validTypes.includes(file.type);
      }, t("invalidPhotoFormat"))
      .refine((file) => {
        if (!file || !(file instanceof File)) return true;
        return file.size <= 5 * 1024 * 1024; // 5MB
      }, t("fileTooLarge")),
    nationalityCamerounaise: z.boolean().refine((val) => val === true, {
      message: t("nationalityCamerounaiseError"),
    }),
    residenceDouala: z.boolean().refine((val) => val === true, {
      message: t("residenceDoualaError"),
    }),
    ageRange: z.boolean().refine((val) => val === true, {
      message: t("ageRangeError"),
    }),
    celibataire: z.boolean().refine((val) => val === true, {
      message: t("celibataireError"),
    }),
    disponibilite: z.boolean().refine((val) => val === true, {
      message: t("disponibiliteError"),
    }),
    representation: z.boolean().refine((val) => val === true, {
      message: t("representationError"),
    }),
  }).superRefine((data, ctx) => {
    // Photo d'identité toujours obligatoire
    if (!data.idPhoto || !(data.idPhoto instanceof File)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("requiredFileMissing"),
        path: ["idPhoto"],
      });
    }

    // CNI toujours obligatoire
    if (!data.idCard || !(data.idCard instanceof File)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("requiredFileMissing"),
        path: ["idCard"],
      });
    }

    // Autorisation parentale obligatoire seulement si âge < 21 ans
    if (data.age < 21) {
      if (!data.parentalAuth || !(data.parentalAuth instanceof File)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("requiredFileMissing"),
          path: ["parentalAuth"],
        });
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      height: "",
      birthPlace: "",
      neighborhood: "",
      district: "",
      phone: "",
      occupation: "",
      nationalityCamerounaise: false,
      residenceDouala: false,
      ageRange: false,
      celibataire: false,
      disponibilite: false,
      representation: false,
    },
  });

  const age = form.watch("age");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function uploadFile(file: File, path: string): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      console.log("Uploading file:", { filePath, fileSize: file.size, fileType: file.type });

      const { data, error } = await supabase.storage.from("miss-registration-files").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Erreur d'upload: ${error.message}`);
        return null;
      }

      console.log("Upload successful:", data);

      const { data: urlData } = supabase.storage.from("miss-registration-files").getPublicUrl(filePath);

      console.log("Public URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload exception:", error);
      toast.error("Erreur lors de l'upload du fichier");
      return null;
    }
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    console.log("Starting form submission...", { firstName: values.firstName, lastName: values.lastName });

    try {
      // Upload files
      let imageUrl: string | null = null;
      let cardUrl: string | null = null;
      let authUrl: string | null = null;

      // Upload photo if provided
      if (values.idPhoto instanceof File) {
        console.log("Uploading photo...");
        imageUrl = await uploadFile(values.idPhoto, "photos");
        if (!imageUrl) {
          console.error("Photo upload failed");
          toast.error(t("uploadPhotoError"));
          setIsSubmitting(false);
          return;
        }
        console.log("Photo uploaded:", imageUrl);
      }

      // Upload ID card (required)
      if (values.idCard instanceof File) {
        console.log("Uploading ID card...");
        cardUrl = await uploadFile(values.idCard, "photos");
        if (!cardUrl) {
          console.error("ID card upload failed");
          toast.error(t("uploadCardError"));
          setIsSubmitting(false);
          return;
        }
        console.log("ID card uploaded:", cardUrl);
      }

      // Upload parental authorization if provided
      if (values.parentalAuth instanceof File) {
        console.log("Uploading parental authorization...");
        authUrl = await uploadFile(values.parentalAuth, "authorizations");
        if (!authUrl) {
          console.error("Parental authorization upload failed");
          toast.error(t("uploadAuthError"));
          setIsSubmitting(false);
          return;
        }
        console.log("Parental authorization uploaded:", authUrl);
      }

      console.log("All files uploaded successfully. Inserting into database...");

      // Insert into database with all uploaded URLs
      const registrationData = {
        first_name: values.firstName,
        name: values.lastName,
        "date de naissance": format(values.birthDate, "yyyy-MM-dd"),
        age: values.age,
        taille: values.height,
        city: values.birthPlace,
        borough: values.neighborhood,
        district: values.district,
        phone: values.phone,
        profession: values.occupation,
        image_url: imageUrl,
        card_url: cardUrl,
        auth_url: authUrl,
      };

      console.log("Registration data to insert:", registrationData);

      const { data, error } = await supabase.from("miss_registrations").insert(registrationData).select();

      if (error) {
        console.error("Database insertion error:", error);
        toast.error(`${t("registrationError")}: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      console.log("Database insertion successful:", data);

      // Generate PDF
      try {
        console.log("Generating PDF...");
        await generateRegistrationPDF(
          {
            firstName: values.firstName,
            lastName: values.lastName,
            birthDate: values.birthDate,
            age: values.age,
            height: values.height,
            birthPlace: values.birthPlace,
            neighborhood: values.neighborhood,
            district: values.district,
            phone: values.phone,
            occupation: values.occupation,
            nationalityCamerounaise: values.nationalityCamerounaise,
            residenceDouala: values.residenceDouala,
            ageRange: values.ageRange,
            celibataire: values.celibataire,
            disponibilite: values.disponibilite,
            representation: values.representation,
            hasIdPhoto: values.idPhoto instanceof File,
            hasIdCard: values.idCard instanceof File,
            hasParentalAuth: values.parentalAuth instanceof File,
          },
          language,
        );

        console.log("PDF generated successfully");
        toast.success(t("registrationSuccess"), {
          description: `${t("thankYou")} ${values.firstName} ${values.lastName}. ${t("registrationSuccessDescription")}`,
        });
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        // Don't fail the whole process if PDF generation fails
        toast.success(t("registrationSuccess"), {
          description: `${t("thankYou")} ${values.firstName} ${values.lastName}. ${t("registrationSuccessDescriptionAlt")}`,
        });
      }

      // Reset form and return to step 1
      form.reset();
      setStep(1);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(t("generalError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const nextStep = async () => {
    const fieldsToValidate = [
      "firstName",
      "lastName",
      "birthDate",
      "age",
      "height",
      "birthPlace",
      "neighborhood",
      "district",
      "phone",
      "occupation",
    ] as const;

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#5D4037] mb-2">{t("formTitle")}</h2>
          <p className="text-[#8D6E63]">{t("formSubtitle")}</p>
        </div>
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("firstName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("firstNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("lastName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("lastNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  const years = Array.from({ length: 35 }, (_, i) => 2007 - i);
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
                name="age"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("age")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("agePlaceholder")}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value ? parseInt(value) : 0);
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("height")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("heightPlaceholder")} {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("birthPlace")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("birthPlacePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("neighborhood")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("neighborhoodPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("district")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("districtPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("phonePlaceholder")} {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("occupation")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("occupationPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={nextStep}
              className="w-full bg-gradient-to-r from-[#6D4C41] to-[#D4A574] hover:from-[#5D4037] hover:to-[#C49563] text-white"
            >
              {t("next")}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#5D4037]">{t("documentsRequired")}</h3>

              <FormField
                control={form.control}
                name="idPhoto"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t("idPhoto")} <span className="text-sm text-muted-foreground">{t("maxFileSize")}</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idCard"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t("idCard")} <span className="text-sm text-muted-foreground">{t("maxFileSize")}</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files?.[0])} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {age && age < 21 && (
                <FormField
                  control={form.control}
                  name="parentalAuth"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t("parentalAuth")} <span className="text-sm text-muted-foreground">{t("maxFileSize")}</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files?.[0])} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-semibold text-[#5D4037]">{t("conditions")}</h3>

                <FormField
                  control={form.control}
                  name="nationalityCamerounaise"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("nationalityCamerounaise")}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residenceDouala"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("residenceDouala")}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("ageRange")}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="celibataire"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("celibataire")}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disponibilite"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("disponibilite")}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="representation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("representation")}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full bg-[#FCE4EC] border-[#5D4037]/30 text-[#5D4037] hover:bg-[#F8BBD0]"
              >
                {t("back")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#6D4C41] to-[#D4A574] hover:from-[#5D4037] hover:to-[#C49563] text-white"
              >
                {isSubmitting ? t("submitting") : t("submit")}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
