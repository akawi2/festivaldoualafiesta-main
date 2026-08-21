import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, FileText } from "lucide-react";
import { compressImage } from "@/utils/imageCompression";

const searchSchema = z.object({
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  age: z.coerce.number().min(18, "L'âge minimum est 18 ans").max(28, "L'âge maximum est 28 ans"),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface MissingFiles {
  needsPhoto: boolean;
  needsIdCard: boolean;
  needsParentalAuth: boolean;
}

export const CompleteRegistration = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [missingFiles, setMissingFiles] = useState<MissingFiles | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [parentalAuthFile, setParentalAuthFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({
    photo: 0,
    idCard: 0,
    parentalAuth: 0,
  });

  // Nettoyer les URLs de prévisualisation au démontage
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Réinitialiser tout quand le dialogue se ferme
  useEffect(() => {
    if (!open) {
      searchForm.reset();
      setRegistrationId(null);
      setMissingFiles(null);
      setPhotoFile(null);
      setIdCardFile(null);
      setParentalAuthFile(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      setUploadProgress({ photo: 0, idCard: 0, parentalAuth: 0 });
    }
  }, [open]);

  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const onSearch = async (data: SearchFormData) => {
    setIsSearching(true);

    try {
      const { data: registration, error } = await supabase
        .from("miss_registrations")
        .select("*")
        .eq("name", data.lastName)
        .eq("age", data.age)
        .maybeSingle();

      if (error) {
        console.error("Error searching registration:", error);
        toast.error("Erreur lors de la recherche");
        return;
      }

      if (!registration) {
        toast.error("Aucune inscription trouvée avec ce nom et cet âge");
        return;
      }

      // Vérifier quels fichiers sont manquants
      const missing: MissingFiles = {
        needsPhoto: !registration.image_url,
        needsIdCard: !registration.card_url,
        needsParentalAuth: !registration.auth_url && registration.age < 21,
      };

      // Si aucun fichier n'est manquant
      if (!missing.needsPhoto && !missing.needsIdCard && !missing.needsParentalAuth) {
        toast.success("Votre inscription est déjà complète !");
        setOpen(false);
        searchForm.reset();
        return;
      }

      setRegistrationId(registration.id);
      setMissingFiles(missing);
      toast.success("Inscription trouvée ! Veuillez téléverser les fichiers manquants.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur s'est produite");
    } finally {
      setIsSearching(false);
    }
  };

  const validateFile = (file: File, type: 'photo' | 'pdf'): boolean => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    // Vérifier la taille
    if (file.size > MAX_SIZE) {
      toast.error(`Le fichier ${file.name} est trop volumineux. Taille maximale : 5MB`);
      return false;
    }

    if (type === 'photo') {
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const validExtensions = ['.png', '.jpg', '.jpeg'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validImageTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
        toast.error('Format de photo invalide. Formats acceptés : PNG, JPG, JPEG');
        return false;
      }
    } else if (type === 'pdf') {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (file.type !== 'application/pdf' || fileExtension !== '.pdf') {
        toast.error('Format invalide. Seul le format PDF est accepté');
        return false;
      }
    }

    return true;
  };

  const uploadFile = async (
    file: File, 
    path: string, 
    progressKey: 'photo' | 'idCard' | 'parentalAuth'
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Simuler la progression (car Supabase storage ne fournit pas de callback de progression natif)
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 90) {
            setUploadProgress(prev => ({ ...prev, [progressKey]: progress }));
          } else {
            clearInterval(interval);
          }
        }, 100);
        return interval;
      };

      const progressInterval = simulateProgress();

      const { data, error } = await supabase.storage.from("miss-registration-files").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Erreur d'upload: ${error.message}`);
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
        return null;
      }

      const { data: urlData } = supabase.storage.from("miss-registration-files").getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload exception:", error);
      toast.error("Erreur lors de l'upload du fichier");
      setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
      return null;
    }
  };

  const onUploadFiles = async () => {
    if (!registrationId || !missingFiles) return;

    setIsUploading(true);

    try {
      const updates: any = {};

      // Réinitialiser la progression
      setUploadProgress({ photo: 0, idCard: 0, parentalAuth: 0 });

      // Upload photo si manquante
      if (missingFiles.needsPhoto && photoFile) {
        if (!validateFile(photoFile, 'photo')) {
          setIsUploading(false);
          return;
        }
        
        // Compresser l'image avant l'upload
        toast.info("Compression de l'image en cours...");
        const compressedPhoto = await compressImage(photoFile, 1);
        
        // Afficher la taille avant/après compression
        const originalSizeMB = (photoFile.size / (1024 * 1024)).toFixed(2);
        const compressedSizeMB = (compressedPhoto.size / (1024 * 1024)).toFixed(2);
        
        if (compressedPhoto.size < photoFile.size) {
          toast.success(`Image compressée: ${originalSizeMB}MB → ${compressedSizeMB}MB`);
        }
        
        const photoUrl = await uploadFile(compressedPhoto, "photos", "photo");
        if (!photoUrl) {
          toast.error("Erreur lors de l'upload de la photo");
          setIsUploading(false);
          return;
        }
        updates.image_url = photoUrl;
      }

      // Upload CNI si manquante
      if (missingFiles.needsIdCard && idCardFile) {
        if (!validateFile(idCardFile, 'pdf')) {
          setIsUploading(false);
          return;
        }
        const cardUrl = await uploadFile(idCardFile, "photos", "idCard");
        if (!cardUrl) {
          toast.error("Erreur lors de l'upload de la CNI");
          setIsUploading(false);
          return;
        }
        updates.card_url = cardUrl;
      }

      // Upload autorisation parentale si manquante
      if (missingFiles.needsParentalAuth && parentalAuthFile) {
        if (!validateFile(parentalAuthFile, 'pdf')) {
          setIsUploading(false);
          return;
        }
        const authUrl = await uploadFile(parentalAuthFile, "authorizations", "parentalAuth");
        if (!authUrl) {
          toast.error("Erreur lors de l'upload de l'autorisation parentale");
          setIsUploading(false);
          return;
        }
        updates.auth_url = authUrl;
      }

      // Vérifier qu'au moins un fichier a été uploadé
      if (Object.keys(updates).length === 0) {
        toast.error("Veuillez sélectionner au moins un fichier à téléverser");
        setIsUploading(false);
        return;
      }

      // Mettre à jour l'inscription dans la base
      const { error: updateError } = await supabase
        .from("miss_registrations")
        .update(updates)
        .eq("id", registrationId);

      if (updateError) {
        console.error("Update error:", updateError);
        toast.error("Erreur lors de la mise à jour de l'inscription");
        setIsUploading(false);
        return;
      }

      toast.success("Inscription complétée avec succès !");
      
      // Réinitialiser le formulaire
      setOpen(false);
      searchForm.reset();
      setRegistrationId(null);
      setMissingFiles(null);
      setPhotoFile(null);
      setIdCardFile(null);
      setParentalAuthFile(null);
      setUploadProgress({ photo: 0, idCard: 0, parentalAuth: 0 });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur s'est produite");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    searchForm.reset();
    setRegistrationId(null);
    setMissingFiles(null);
    setPhotoFile(null);
    setIdCardFile(null);
    setParentalAuthFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setUploadProgress({ photo: 0, idCard: 0, parentalAuth: 0 });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      setPhotoFile(file);
    }
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const removeIdCard = () => {
    setIdCardFile(null);
  };

  const removeParentalAuth = () => {
    setParentalAuthFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Upload className="h-4 w-4 mr-2" />
          Compléter mon inscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compléter mon inscription</DialogTitle>
          <DialogDescription>
            Entrez votre nom et votre âge pour rechercher votre inscription
          </DialogDescription>
        </DialogHeader>

        {!missingFiles ? (
          // Formulaire de recherche
          <Form {...searchForm}>
            <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4">
              <FormField
                control={searchForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Votre nom de famille" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={searchForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Âge</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Votre âge" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching ? "Recherche..." : "Rechercher mon inscription"}
              </Button>
            </form>
          </Form>
        ) : (
          // Formulaire d'upload de fichiers
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Veuillez téléverser les fichiers manquants pour compléter votre inscription :
            </p>

            {missingFiles.needsPhoto && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Photo d'identité <span className="text-destructive">*</span>
                </label>
                {photoPreview ? (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <img
                        src={photoPreview}
                        alt="Prévisualisation"
                        className="h-20 w-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{photoFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {photoFile ? (photoFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handlePhotoChange}
                    className="cursor-pointer"
                  />
                )}
                <p className="text-xs text-muted-foreground">Format : PNG, JPG ou JPEG (max 5MB)</p>
                {isUploading && uploadProgress.photo > 0 && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress.photo} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">{uploadProgress.photo}%</p>
                  </div>
                )}
              </div>
            )}

            {missingFiles.needsIdCard && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Carte Nationale d'Identité <span className="text-destructive">*</span>
                </label>
                {idCardFile ? (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <div className="flex h-20 w-20 items-center justify-center rounded bg-primary/10">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{idCardFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(idCardFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeIdCard}
                        className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                )}
                <p className="text-xs text-muted-foreground">Format : PDF uniquement (max 5MB)</p>
                {isUploading && uploadProgress.idCard > 0 && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress.idCard} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">{uploadProgress.idCard}%</p>
                  </div>
                )}
              </div>
            )}

            {missingFiles.needsParentalAuth && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Autorisation parentale <span className="text-destructive">*</span>
                </label>
                {parentalAuthFile ? (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <div className="flex h-20 w-20 items-center justify-center rounded bg-primary/10">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{parentalAuthFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(parentalAuthFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeParentalAuth}
                        className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setParentalAuthFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Format : PDF uniquement (max 5MB) - Requis pour les candidates de moins de 21 ans
                </p>
                {isUploading && uploadProgress.parentalAuth > 0 && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress.parentalAuth} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">{uploadProgress.parentalAuth}%</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMissingFiles(null);
                  setRegistrationId(null);
                  setPhotoFile(null);
                  setIdCardFile(null);
                  setParentalAuthFile(null);
                  if (photoPreview) URL.revokeObjectURL(photoPreview);
                  setPhotoPreview(null);
                  setUploadProgress({ photo: 0, idCard: 0, parentalAuth: 0 });
                }}
              >
                Retour
              </Button>
              <Button type="button" className="flex-1" onClick={onUploadFiles} disabled={isUploading}>
                {isUploading ? "Téléversement..." : "Téléverser les fichiers"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
