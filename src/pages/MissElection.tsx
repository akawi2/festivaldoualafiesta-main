import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Heart,
  Trophy,
  Crown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  UserPlus,
  Camera,
  Star,
  Users,
  Target,
  Calendar,
  ArrowLeft,
  X,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorIp, getVisitorFingerprint } from "@/utils/visitorIdentity";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { RegistrationForm } from "@/components/RegistrationForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RetrieveRegistration } from "@/components/RetrieveRegistration";
import { CompleteRegistration } from "@/components/CompleteRegistration";
import { useTranslation as useCustomTranslation } from "@/hooks/useTranslation";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SEO } from "@/components/SEO";
import Navigation from "@/components/Navigation";

// Imports des images candidates
import candidate1 from "@/assets/candidate-1.jpg";
import candidate2 from "@/assets/candidate-2.jpg";
import candidate6 from "@/assets/candidate-6.jpg";
import candidate14 from "@/assets/candidate-14.jpg";
import candidate25 from "@/assets/candidate-25.jpg";
import candidate26 from "@/assets/candidate-26.jpg";
import { CandidateImageCarousel } from "@/components/CandidateImageCarousel";

// Imports des images galerie
import missContest1 from "@/assets/miss-contest-1.jpg";
import missContest2 from "@/assets/miss-contest-2.jpg";
import missContest3 from "@/assets/miss-contest-3.jpg";
import missContest4 from "@/assets/miss-contest-4.jpg";
import missContest5 from "@/assets/miss-contest-5.jpg";
import missContest6 from "@/assets/miss-contest-6.jpg";
import missContest7 from "@/assets/miss-contest-7.jpg";
import missContest8 from "@/assets/miss-contest-8.jpg";
import missContest9 from "@/assets/miss-contest-9.jpg";
import missContest10 from "@/assets/miss-contest-10.jpg";
import missContest11 from "@/assets/miss-contest-11.jpg";
import missContest12 from "@/assets/miss-contest-12.jpg";
import missContest13 from "@/assets/miss-contest-13.jpg";
import missContest14 from "@/assets/miss-contest-14.jpg";
import missContest15 from "@/assets/miss-contest-15.jpg";
import missContest16 from "@/assets/miss-contest-16.jpg";
import missContest17 from "@/assets/miss-contest-17.jpg";
import missContest18 from "@/assets/miss-contest-18.jpg";
import missContest19 from "@/assets/miss-contest-19.jpg";
import missContest20 from "@/assets/miss-contest-20.jpg";
import missBannerBg from "@/assets/miss-banner-bg.jpg";
import logoMissDoualaFiesta from "@/assets/logo-miss-douala-fiesta.png";

interface MissCandidate {
  id: string;
  name: string;
  age?: number;
  city?: string;
  description_fr?: string;
  description_en?: string;
  image_url?: string;
  votes_count: number;
  is_active: boolean;
}

interface MissGalleryImage {
  id: string;
  miss_candidate_id: string | null;
  image_url: string;
  is_active: boolean;
  display_order: number;
  category?: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  category?: string;
}

// Helper pour obtenir plusieurs images pour chaque candidate
const getCandidateImages = (imageUrl?: string): string[] => {
  const baseImages = [candidate1, candidate2, candidate6, candidate14, candidate25, candidate26];

  if (!imageUrl) return [baseImages[0]];

  if (imageUrl.includes("candidate-1.jpg")) return [candidate1, candidate2, candidate6];
  if (imageUrl.includes("candidate-2.jpg")) return [candidate2, candidate14, candidate25];
  if (imageUrl.includes("candidate-6.jpg")) return [candidate6, candidate1, candidate26];
  if (imageUrl.includes("candidate-14.jpg")) return [candidate14, candidate2, candidate1];
  if (imageUrl.includes("candidate-25.jpg")) return [candidate25, candidate26, candidate6];
  if (imageUrl.includes("candidate-26.jpg")) return [candidate26, candidate25, candidate14];

  return [imageUrl];
};

const MissElection = () => {
  const { t, i18n } = useTranslation();
  const { t: tCustom } = useCustomTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState<MissCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vote");
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<MissCandidate | null>(null);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [candidateGalleryImages, setCandidateGalleryImages] = useState<Record<string, MissGalleryImage[]>>({});
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>(t("mediatheque.all"));
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    birthDatePlace: "",
    age: "",
    currentAddress: "",
    phone: "",
    email: "",
    professionEducation: "",
    taille: "",
    description_en: "",
    description_fr: "",
    district: "",
    borough: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { votingEnabled, registrationEnabled } = useSiteSettings();

  const autoplay = React.useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const galleryAutoplay = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("miss_candidates")
        .select("*")
        .eq("is_active", true)
        .order("votes_count", { ascending: false });

      if (error) throw error;
      setCandidates(data || []);

      // Charger les images de la galerie pour chaque candidate
      if (data && data.length > 0) {
        const candidateIds = data.map((c) => c.id);
        const { data: imagesData, error: imagesError } = await supabase
          .from("miss_gallery_images")
          .select("*")
          .in("miss_candidate_id", candidateIds)
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (imagesError) {
          console.error("Erreur lors du chargement des images:", imagesError);
        } else if (imagesData) {
          // Organiser les images par candidate
          const imagesByCandidate: Record<string, MissGalleryImage[]> = {};
          imagesData.forEach((img) => {
            if (img.miss_candidate_id) {
              if (!imagesByCandidate[img.miss_candidate_id]) {
                imagesByCandidate[img.miss_candidate_id] = [];
              }
              imagesByCandidate[img.miss_candidate_id].push(img);
            }
          });
          setCandidateGalleryImages(imagesByCandidate);
        }
      }

      // Charger toutes les images de la galerie pour la section galerie
      const { data: allGalleryData, error: galleryError } = await supabase
        .from("miss_gallery_images")
        .select("*")
        /* .eq("is_active", true) */
        .order("display_order", { ascending: true });

      if (galleryError) {
        console.error("Erreur lors du chargement de la galerie:", galleryError);
      } else {
        setGalleryImages(allGalleryData || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des candidates:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if ((location.state as { openRegistration?: boolean } | null)?.openRegistration) {
      setIsRegistrationDialogOpen(true);
    }
  }, [location.state]);

  const handleVote = async (candidateId: string) => {
    setVotingInProgress(candidateId);

    try {
      const [fingerprint, voterIp] = await Promise.all([getVisitorFingerprint(), getVisitorIp()]);

      // Créer la session de vote
      const sessionId = `${fingerprint}-${Date.now()}`;

      // Insérer le vote
      const { error: voteError } = await supabase.from("miss_votes").insert({
        candidate_id: candidateId,
        voter_ip: voterIp,
        voter_fingerprint: fingerprint,
        session_id: sessionId,
        user_agent: navigator.userAgent,
      });

      if (voteError) {
        console.error("Error recording vote:", voteError);
        toast({
          title: "Erreur",
          description: voteError.code === "P0001" ? voteError.message : t("miss.error"),
          variant: "destructive",
        });
        return;
      }

      // Incrémenter le compteur de votes et rafraîchir les données
      const { error: incrementError } = await supabase.rpc("increment_candidate_votes", {
        candidate_uuid: candidateId,
      });

      if (incrementError) {
        console.error("Error incrementing votes:", incrementError);
      }

      // Refetch les candidates pour avoir les données à jour
      await fetchCandidates();

      toast({
        title: "Vote enregistré !",
        description: "Merci pour votre vote",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre vote",
        variant: "destructive",
      });
    } finally {
      setVotingInProgress(null);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse fullName to extract first_name and name
      const nameParts = registrationData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

      const { data, error } = await supabase
        .from("miss_registrations")
        .insert({
          first_name: firstName,
          name: lastName,
          age: registrationData.age ? parseInt(registrationData.age) : null,
          city: registrationData.currentAddress || null,
          phone: registrationData.phone || null,
          "date de naissance": registrationData.birthDatePlace || null,
          profession: registrationData.professionEducation || null,
          district: registrationData.district || null,
          borough: registrationData.borough || "",
          taille: registrationData.taille || null,
        })
        .select();

      if (error) {
        console.error("Error submitting miss registration:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Inscription envoyée !",
        description: "Votre candidature a été soumise avec succès. Nous vous contacterons bientôt.",
      });

      setRegistrationData({
        fullName: "",
        birthDatePlace: "",
        age: "",
        currentAddress: "",
        phone: "",
        email: "",
        professionEducation: "",
        taille: "",
        description_en: "",
        description_fr: "",
        district: "",
        borough: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setRegistrationData((prev) => ({ ...prev, [field]: value }));
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const toggleAutoplay = () => {
    if (isAutoplay) {
      autoplay.current?.stop();
    } else {
      autoplay.current?.play();
    }
    setIsAutoplay(!isAutoplay);
  };

  const openGalleryDialog = (imageId: string) => {
    setSelectedGalleryImage(imageId);
    setIsGalleryDialogOpen(true);
  };

  const closeGalleryDialog = () => {
    setIsGalleryDialogOpen(false);
    setSelectedGalleryImage(null);
  };

  const sortedCandidates = [...candidates].sort((a, b) => b.votes_count - a.votes_count);
  const selectedGalleryImageData = selectedGalleryImage
    ? galleryImages.find((img) => img.id === selectedGalleryImage)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Miss Douala Fiesta 2025 - Élection de Miss Cameroun"
        description="Participez à l'élection Miss Douala Fiesta 2025. Découvrez les candidates, votez pour votre favorite et suivez cette compétition prestigieuse de beauté au Cameroun."
        keywords="Miss Douala Fiesta, Miss Cameroun, élection miss, concours beauté, candidates, vote miss, Douala 2025"
        canonicalUrl="https://festivaldoualafiesta.cm/miss-election"
        ogImage="https://lovable.dev/opengraph-image-p98pqg.png"
        ogTitle="Miss Douala Fiesta 2025 - Votez pour votre candidate favorite"
        ogDescription="Découvrez les candidates de Miss Douala Fiesta 2025 et votez pour votre favorite dans cette compétition prestigieuse."
      />
      <Navigation />
      {/* Header avec image de fond */}
      <div
        className="relative py-24 pt-40 overflow-hidden"
        style={{
          backgroundImage: `url(${missBannerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay gradient pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-between items-start mb-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("miss.backToHome")}
            </Button>
            {registrationEnabled && <LanguageSwitcher />}
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src={logoMissDoualaFiesta}
                alt="Miss Douala Fiesta Logo"
                className="h-32 md:h-40 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4 drop-shadow-lg">
              <Crown className="h-12 w-12 text-gold drop-shadow-lg" />
              Miss Douala Fiesta 2025
              <Crown className="h-12 w-12 text-gold drop-shadow-lg" />
            </h1>
            <p className="text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md mb-6">
              {t("miss.prestigiousElection")}
            </p>

            {registrationEnabled && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        onClick={() => setIsRegistrationDialogOpen(true)}
                        className="bg-gold hover:bg-gold/90 text-primary font-bold px-8 py-6 text-lg shadow-xl"
                      >
                        <UserPlus className="h-5 w-5 mr-2" />
                        {t("miss.register")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-sm p-4">
                      <p className="text-sm mb-2">{t("miss.caution")}</p>
                      <a
                        href="https://mpjnfyppuaurbffhtocw.supabase.co/storage/v1/object/public/miss-registration-files/authorizations/u9gznmwreg.pdf"
                        download
                        className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        {t("miss.authorize")}
                      </a>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {registrationEnabled && <CompleteRegistration />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog d'inscription */}
      <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-gold" />
              {tCustom("formTitle")}
            </DialogTitle>
            <DialogDescription className="text-center">{tCustom("formSubtitle")}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto gap-1">
              <TabsTrigger value="register" className="whitespace-normal text-xs sm:text-sm py-2 h-auto leading-tight">
                {t("miss.register")}
              </TabsTrigger>
              <TabsTrigger value="retrieve" className="whitespace-normal text-xs sm:text-sm py-2 h-auto leading-tight">
                {tCustom("retrieveRegistrationTitle")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-6">
              <RegistrationForm />
            </TabsContent>

            <TabsContent value="retrieve" className="mt-6">
              <RetrieveRegistration />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4">
            <TabsTrigger value="vote" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t("miss.vote")}
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("miss.profiles")}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              {t("miss.results")}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t("miss.gallery")}
            </TabsTrigger>
          </TabsList>

          {/* Onglet Vote */}
          <TabsContent value="vote" className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">{t("miss.voteFor")}</h2>
              <p className="text-muted-foreground text-lg">{t("miss.everyVoteCounts")}</p>
            </div>

            <div className="relative">
              <div className="flex justify-center items-center gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={toggleAutoplay} className="flex items-center gap-2">
                  {isAutoplay ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
                <Badge variant="secondary" className="text-sm">
                  {candidates.length} Candidates
                </Badge>
              </div>
              {/*
              <Carousel
                plugins={[autoplay.current]}
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                  slidesToScroll: 1,
                }}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {sortedCandidates.map((candidate, index) => (
                    <CarouselItem key={candidate.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="group hover:shadow-2xl transition-all duration-500 border-4 border-gold/40 hover:border-gold/70 rounded-2xl relative aspect-[3/4] overflow-hidden bg-white scale-90 hover:scale-95">
                        {candidate.image_url ? (
                          <div className="absolute inset-0 overflow-hidden rounded-xl m-1 h-3/5">
                            <CandidateImageCarousel
                              images={getCandidateImages(candidate.image_url)}
                              alt={candidate.name}
                              className="group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 m-1 h-3/5 bg-gradient-to-br from-gold/20 to-navy/20 rounded-xl flex items-center justify-center">
                            <Crown className="h-16 w-16 text-gold" />
                          </div>
                        )}

                        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                          {getRankIcon(index)}
                          <Badge className="bg-white/95 text-navy shadow-lg text-xs px-2 py-1 rounded-full font-bold border border-gold/30">
                            #{index + 1}
                          </Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-2/5 p-4 bg-white rounded-t-xl border-t border-gray-100">
                          <div className="mb-2">
                            <h3 className="text-base font-bold text-navy group-hover:text-gold transition-colors duration-300 mb-1 leading-tight">
                              {candidate.name}
                            </h3>

                            {(candidate.age || candidate.city) && (
                              <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
                                <span className="w-1 h-1 bg-gold rounded-full"></span>
                                {candidate.age && (
                                  <span>
                                    {candidate.age} {t("miss.age")}
                                  </span>
                                )}
                                {candidate.age && candidate.city && <span>•</span>}
                                {candidate.city && <span>{candidate.city}</span>}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Heart
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.min(5, Math.floor(candidate.votes_count / 50) + 1)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600 font-medium ml-1">
                              {Math.min(5, Math.floor(candidate.votes_count / 50) + 1)}.0
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="text-2xl font-bold text-navy">{candidate.votes_count}</div>
                              <div className="text-xs text-gray-500 -mt-1">votes</div>
                            </div>

                            <Button
                              onClick={() => handleVote(candidate.id)}
                              disabled={votingInProgress === candidate.id}
                              className="bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-gold-light"
                              size="sm"
                            >
                              {votingInProgress === candidate.id ? (
                                "Vote..."
                              ) : (
                                <>
                                  <Heart className="h-4 w-4 mr-1" />
                                  Voter
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-4 bg-white/90 hover:bg-white shadow-lg border-gold/20" />
                <CarouselNext className="right-4 bg-white/90 hover:bg-white shadow-lg border-gold/20" />
              </Carousel>
            */}
              {/**/}
              <Carousel
                plugins={[autoplay.current]}
                className="w-full"
                opts={{
                  align: "center",
                  loop: true,
                  slidesToScroll: 1,
                }}
              >
                <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
                  {candidates.map((candidate, index) => (
                    <CarouselItem
                      key={candidate.id}
                      className="pl-1 sm:pl-2 md:pl-4 basis-full sm:basis-3/5 md:basis-1/2 lg:basis-1/3"
                    >
                      <Card className="group hover:shadow-2xl transition-all duration-500 border-2 sm:border-4 border-gold/40 hover:border-gold/70 rounded-xl sm:rounded-2xl relative overflow-hidden bg-white scale-95 sm:scale-90 hover:scale-100 sm:hover:scale-95 h-auto min-h-[500px]">
                        {/* Image principale */}
                        {candidate.image_url ? (
                          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl">
                            <img
                              src={
                                candidate.image_url.includes("/src/assets/candidate-1.jpg")
                                  ? candidate1
                                  : candidate.image_url.includes("/src/assets/candidate-2.jpg")
                                    ? candidate2
                                    : candidate.image_url.includes("/src/assets/candidate-6.jpg")
                                      ? candidate6
                                      : candidate.image_url.includes("/src/assets/candidate-14.jpg")
                                        ? candidate14
                                        : candidate.image_url.includes("/src/assets/candidate-25.jpg")
                                          ? candidate25
                                          : candidate.image_url.includes("/src/assets/candidate-26.jpg")
                                            ? candidate26
                                            : candidate.image_url
                              }
                              alt={candidate.name}
                              className="absolute top-0 left-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ) : (
                          <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-gold/20 to-navy/20 rounded-xl">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Crown className="h-16 w-16 text-gold" />
                            </div>
                          </div>
                        )}

                        {/* Badge de rang */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                          {getRankIcon(index)}
                          <Badge className="bg-white/95 text-navy shadow-lg text-xs px-2 py-1 rounded-full font-bold border border-gold/30">
                            #{index + 1}
                          </Badge>
                        </div>

                        {/* Contenu en bas inspiré de l'image de référence */}
                        <div className="relative p-4 bg-white rounded-b-xl border-t border-gray-100">
                          {/* Nom et titre */}
                          <div className="mb-2">
                            <h3 className="text-base font-bold text-navy group-hover:text-gold transition-colors duration-300 mb-1 leading-tight">
                              {candidate.name}
                            </h3>

                            {(candidate.age || candidate.city) && (
                              <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
                                <span className="w-1 h-1 bg-gold rounded-full"></span>
                                {candidate.age && (
                                  <span>
                                    {candidate.age} {t("miss.age")}
                                  </span>
                                )}
                                {candidate.age && candidate.city && <span>•</span>}
                                {candidate.city && <span>{candidate.city}</span>}
                              </div>
                            )}
                          </div>

                          {/* Rating avec cœurs — masqué pour le moment, pas une feature obligatoire
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Heart
                                  key={i}
                                  className={`h-3 w-3 ${i < Math.min(5, Math.floor(candidate.votes_count / 5) + 1) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600 font-medium ml-1">
                              {Math.min(5, Math.floor(candidate.votes_count / 5) + 1)}.0
                            </span>
                          </div>
                          */}

                          {/* Votes et boutons */}
                          <div className="space-y-3">
                            <div className="text-left">
                              <div className="text-2xl font-bold text-navy">{candidate.votes_count}</div>
                              <div className="text-xs text-gray-500 -mt-1">votes</div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => setSelectedCandidate(candidate)}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-gold/40 text-navy hover:bg-gold/10 font-semibold rounded-lg text-sm"
                              >
                                {t("miss.viewProfile")}
                              </Button>

                              <Button
                                onClick={() => handleVote(candidate.id)}
                                disabled={votingInProgress === candidate.id || !votingEnabled}
                                className="flex-1 bg-gold hover:bg-gold-dark text-white font-semibold py-2 rounded-lg text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-gold-light"
                                size="sm"
                              >
                                {votingInProgress === candidate.id ? "Vote..." : <>{t("miss.vote")}</>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Contrôles de navigation */}
                <CarouselPrevious className="left-4 bg-white/90 hover:bg-white shadow-lg border-gold/20" />
                <CarouselNext className="right-4 bg-white/90 hover:bg-white shadow-lg border-gold/20" />
              </Carousel>
              {/**/}
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">{t("miss.liveRanking")}</span>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Profils */}
          <TabsContent value="profiles" className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">{t("miss.candidate")}</h2>
              <p className="text-muted-foreground text-lg">{t("miss.profileTitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCandidates.map((candidate, index) => {
                const candidateImages = candidateGalleryImages[candidate.id] || [];
                const displayImages =
                  candidateImages.length > 0
                    ? candidateImages.map((img) => img.image_url)
                    : getCandidateImages(candidate.image_url);

                return (
                  <Card
                    key={candidate.id}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                      {displayImages.length > 0 ? (
                        <CandidateImageCarousel images={displayImages} alt={candidate.name} className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold/20 to-navy/20 flex items-center justify-center">
                          <Crown className="h-16 w-16 text-gold" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">{getRankIcon(index)}</div>
                      {candidateImages.length > 0 && (
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 text-navy backdrop-blur-sm">
                            <Camera className="h-3 w-3 mr-1" />
                            {candidateImages.length} photos
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold text-navy mb-2">{candidate.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        {candidate.age && (
                          <span>
                            {candidate.age} {t("miss.age")}
                          </span>
                        )}
                        {candidate.age && candidate.city && <span>•</span>}
                        {candidate.city && <span>{candidate.city}</span>}
                      </div>
                      {(() => {
                        const description =
                          i18n.language === "en" ? candidate.description_en : candidate.description_fr;
                        const isExpanded = expandedDescriptions.has(candidate.id);
                        const shouldTruncate = description && description.length > 100;

                        return (
                          <div>
                            <p
                              className={`text-sm text-muted-foreground ${!isExpanded && shouldTruncate ? "line-clamp-2" : ""}`}
                            >
                              {description}
                            </p>
                            {shouldTruncate && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedDescriptions((prev) => {
                                    const newSet = new Set(prev);
                                    if (isExpanded) {
                                      newSet.delete(candidate.id);
                                    } else {
                                      newSet.add(candidate.id);
                                    }
                                    return newSet;
                                  });
                                }}
                                className="text-xs text-coral font-medium mt-1 hover:underline"
                              >
                                {isExpanded ? t("miss.readLess") || "Lire moins" : t("miss.readMore") || "Lire plus"}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-navy">{candidate.votes_count} votes</span>
                        <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Onglet Résultats */}
          <TabsContent value="results" className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">{t("miss.liveRanking")}</h2>
              <p className="text-muted-foreground text-lg">{t("miss.resultTitle")}</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {sortedCandidates.map((candidate, index) => (
                <Card key={candidate.id} className={`mb-4 ${index < 3 ? "border-gold" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <div className="text-2xl font-bold text-navy">#{index + 1}</div>
                      </div>

                      {candidate.image_url && (
                        <img
                          src={candidate.image_url}
                          alt={candidate.name}
                          className="w-16 h-16 object-cover object-[center_20%] rounded-full"
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-navy">{candidate.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {candidate.age && (
                            <span>
                              {candidate.age} {t("miss.age")}
                            </span>
                          )}
                          {candidate.age && candidate.city && <span>•</span>}
                          {candidate.city && <span>{candidate.city}</span>}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-navy">{candidate.votes_count}</div>
                        <div className="text-sm text-muted-foreground">votes</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gold h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(candidate.votes_count / Math.max(...candidates.map((c) => c.votes_count))) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Galerie */}
          <TabsContent value="gallery" className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">{t("miss.competitionGallery")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("miss.highlights")}</p>
            </div>

            {/* Filtre par catégorie */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {[
                t("mediatheque.all"),
                ...Array.from(new Set(galleryImages.map((img) => img.category).filter(Boolean))),
              ].map((category) => (
                <Button
                  key={category}
                  variant={selectedGalleryCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedGalleryCategory(category || t("mediatheque.all"))}
                  className={selectedGalleryCategory === category ? "bg-gradient-gold text-white" : "hover:bg-gold/10"}
                >
                  {category}
                </Button>
              ))}
            </div>

            <Carousel
              key={selectedGalleryCategory}
              plugins={[galleryAutoplay.current]}
              opts={{ align: "start", loop: true }}
              className="w-full px-4 sm:px-8 lg:px-12"
            >
              <CarouselContent className="-ml-4">
                {(selectedGalleryCategory === t("mediatheque.all")
                  ? galleryImages
                  : galleryImages.filter((img) => img.category === selectedGalleryCategory)
                ).map((image) => (
                  <CarouselItem key={image.id} className="pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <Card
                      className="overflow-hidden hover:shadow-xl transition-all duration-500 group border-0 bg-white/50 backdrop-blur-sm cursor-pointer"
                      onClick={() => openGalleryDialog(image.id)}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={image.image_url}
                          alt="Miss Douala Fiesta Gallery"
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Icône camera au survol */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>

            {/* Section statistiques de la galerie */}
            <div className="mt-12 text-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-gold" />
                  <span className="text-sm font-semibold text-navy">{galleryImages.length} Photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <span className="text-sm font-semibold text-navy">{t("miss.edition")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  <span className="text-sm font-semibold text-navy">{t("miss.moment")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  <span className="text-sm font-semibold text-navy">{t("miss.prestige")}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Gallery Image Dialog */}
      <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              {selectedGalleryImageData?.category || "Miss Douala Fiesta"}
              <Button variant="ghost" size="sm" onClick={closeGalleryDialog} className="hover:bg-gray-100">
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedGalleryImageData && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden">
                <img
                  src={selectedGalleryImageData.image_url}
                  alt="Miss Douala Fiesta Gallery"
                  className="w-full h-full object-contain"
                />
              </div>
              {selectedGalleryImageData.category && (
                <div className="p-6 pt-0">
                  <div className="flex items-center gap-3">
                    <span className="bg-gradient-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedGalleryImageData.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Candidate Profile Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {selectedCandidate &&
            (() => {
              const candidateImages = candidateGalleryImages[selectedCandidate.id] || [];
              const displayImages =
                candidateImages.length > 0
                  ? candidateImages.map((img) => img.image_url)
                  : getCandidateImages(selectedCandidate.image_url);
              const rank = sortedCandidates.findIndex((c) => c.id === selectedCandidate.id);
              const description =
                i18n.language === "en" ? selectedCandidate.description_en : selectedCandidate.description_fr;

              return (
                <div className="flex flex-col">
                  <div className="relative h-80 sm:h-[28rem] md:h-[32rem] overflow-hidden bg-navy shrink-0">
                    <CandidateImageCarousel
                      images={displayImages}
                      alt={selectedCandidate.name}
                      className="w-full h-full"
                      showControls
                      objectFit="contain"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                      {getRankIcon(rank)}
                      <Badge className="bg-white/95 text-navy shadow-lg text-xs px-2 py-1 rounded-full font-bold border border-gold/30">
                        #{rank + 1}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCandidate(null)}
                      aria-label="Fermer"
                      className="absolute top-3 left-3 bg-white/90 hover:bg-white rounded-full h-8 w-8 z-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-navy">{selectedCandidate.name}</DialogTitle>
                      {(selectedCandidate.age || selectedCandidate.city) && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                          {selectedCandidate.age && (
                            <span>
                              {selectedCandidate.age} {t("miss.age")}
                            </span>
                          )}
                          {selectedCandidate.age && selectedCandidate.city && <span>•</span>}
                          {selectedCandidate.city && <span>{selectedCandidate.city}</span>}
                        </div>
                      )}
                    </div>

                    {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <div className="text-3xl font-bold text-navy">{selectedCandidate.votes_count}</div>
                        <div className="text-xs text-muted-foreground">votes</div>
                      </div>
                      <Button
                        onClick={() => handleVote(selectedCandidate.id)}
                        disabled={votingInProgress === selectedCandidate.id || !votingEnabled}
                        className="bg-gold hover:bg-gold-dark text-white font-semibold px-6"
                      >
                        {votingInProgress === selectedCandidate.id ? (
                          "Vote..."
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-2" />
                            {t("miss.vote")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MissElection;
