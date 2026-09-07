import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import lanceGauche from "@/assets/lance-gauche.png";
import lanceDroite from "@/assets/lance-droite.png";

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  category: string;
}

const RANDOM_PHOTO_COUNT = 20;

const HomeGallerySection = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  useEffect(() => {
    const fetchRandomImages = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, title, image_url, category")
        .eq("is_active", true)
        .neq("category", "Vidéo");

      if (error) {
        console.error("Error fetching gallery images:", error);
        return;
      }

      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      setImages(shuffled.slice(0, RANDOM_PHOTO_COUNT));
    };

    fetchRandomImages();
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-subtle overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <img src={lanceGauche} alt="" className="h-8 sm:h-10 lg:h-12 w-auto opacity-80" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              {t("homeGallery.title")}{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">{t("homeGallery.titleSpan")}</span>
            </h2>
            <img src={lanceDroite} alt="" className="h-8 sm:h-10 lg:h-12 w-auto opacity-80" />
          </div>
        </div>

        <div className="relative px-4 sm:px-8 lg:px-12">
          <Carousel
            plugins={[autoplay.current]}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {images.map((image) => (
                <CarouselItem key={image.id} className="pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                  <div className="aspect-square overflow-hidden rounded-xl shadow-elegant">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>

        <div className="text-center mt-10">
          <Button asChild size="lg" className="bg-gradient-gold text-navy font-semibold hover:scale-105 transition-transform">
            <Link to="/mediatheque">
              {t("homeGallery.viewAll")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeGallerySection;
