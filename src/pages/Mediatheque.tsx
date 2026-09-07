import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import Footer from "@/components/Footer";

interface GalleryImage {
  id: string;
  title: string;
  description_fr?: string;
  description_en?: string;
  image_url: string;
  category: string;
}

const Mediatheque = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(t("mediatheque.all"));
  const [isAutoplay, setIsAutoplay] = useState(true);
  const autoplay = React.useRef(
    Autoplay({
      delay: 3500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const toggleAutoplay = () => {
    if (isAutoplay) {
      autoplay.current?.stop();
    } else {
      autoplay.current?.play();
    }
    setIsAutoplay(!isAutoplay);
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gallery images:", error);
        return;
      }

      setGalleryImages(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [t("mediatheque.all"), ...Array.from(new Set(galleryImages.map((img) => img.category)))];

  const filteredImages =
    selectedCategory === t("mediatheque.all")
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  const openViewer = (index: number) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);
  const showPrev = () =>
    setViewerIndex((i) => (i === null ? null : (i - 1 + filteredImages.length) % filteredImages.length));
  const showNext = () => setViewerIndex((i) => (i === null ? null : (i + 1) % filteredImages.length));

  const viewerImage = viewerIndex !== null ? filteredImages[viewerIndex] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("mediatheque.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Médiathèque - Festival Douala Fiesta | Photos et Vidéos"
        description="Explorez la galerie photos et vidéos du Festival Douala Fiesta. Revivez les meilleurs moments de nos événements culturels, concerts, spectacles et célébrations."
        keywords="galerie photos, vidéos festival, médiathèque Douala Fiesta, photos événements, concerts Douala, culture camerounaise"
        canonicalUrl="https://festivaldoualafiesta.cm/mediatheque"
        ogImage="https://lovable.dev/opengraph-image-p98pqg.png"
        ogTitle="Médiathèque Festival Douala Fiesta - Photos et Vidéos des événements"
        ogDescription="Découvrez les photos et vidéos des plus beaux moments du Festival Douala Fiesta. Culture, musique, danse et art africain."
      />
      {/* Header */}
      <div className="bg-gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("mediatheque.backToHome")}
          </Button>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">{t("mediatheque.title")}</h1>
          <p className="text-xl text-gray-light max-w-3xl">{t("mediatheque.description")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-gradient-coral text-white" : "hover:bg-coral/10"}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Slider */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t("mediatheque.noImages")}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex justify-center items-center gap-2 mb-6">
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
                {filteredImages.length} élément{filteredImages.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <Carousel
              key={selectedCategory}
              plugins={[autoplay.current]}
              className="w-full px-4 sm:px-8 lg:px-12"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-4">
                {filteredImages.map((image, index) => (
                  <CarouselItem key={image.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Card
                      className="group overflow-hidden shadow-elegant hover:shadow-coral transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                      onClick={() => openViewer(index)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {image.category === "Vidéo" ? (
                          <>
                            <video
                              src={image.image_url}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              preload="metadata"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                <div className="w-0 h-0 border-l-[20px] border-l-primary border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <img
                              src={image.image_url}
                              alt={image.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                                <Camera className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}
      </div>

      {/* Visionneuse : défile toutes les photos de la catégorie affichée */}
      <Dialog open={viewerIndex !== null} onOpenChange={(open) => !open && closeViewer()}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-0">
          {viewerImage && (
            <div className="relative flex items-center justify-center bg-black" style={{ height: "85vh" }}>
              {viewerImage.category === "Vidéo" ? (
                <video
                  key={viewerImage.id}
                  src={viewerImage.image_url}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={viewerImage.image_url}
                  alt={viewerImage.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={closeViewer}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>

              {filteredImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={showPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-3 py-1 rounded-full">
                    {(viewerIndex ?? 0) + 1} / {filteredImages.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Mediatheque;
