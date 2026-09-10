import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import lanceGauche from "@/assets/lance-gauche.png";
import lanceDroite from "@/assets/lance-droite.png";

interface GalleryImage {
  id: string;
  title: string;
  description_fr?: string;
  description_en?: string;
  image_url: string;
  category: string;
}

const CARD_COUNT = 6; // 3 colonnes x 2 lignes sur desktop

const HomeGallerySection = () => {
  const { t, i18n } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const fetchRandomImages = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, title, description_fr, description_en, image_url, category")
        .eq("is_active", true)
        .neq("category", "Vidéo");

      if (error) {
        console.error("Error fetching gallery images:", error);
        return;
      }

      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      setImages(shuffled.slice(0, CARD_COUNT));
    };

    fetchRandomImages();
  }, []);

  if (images.length === 0) return null;

  const descriptionFor = (image: GalleryImage) =>
    (i18n.language === "en" ? image.description_en : image.description_fr) ||
    image.description_fr ||
    image.description_en ||
    "";

  return (
    <section className="py-16 bg-white">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image) => (
            <Link
              key={image.id}
              to="/mediatheque"
              state={{ openImageId: image.id, category: image.category }}
              className="group block overflow-hidden rounded-xl border border-border bg-background shadow-elegant hover:shadow-coral transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={image.image_url}
                  alt={image.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-gradient-coral text-white border-0">
                  {image.category}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">{image.title}</h3>
                {descriptionFor(image) && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{descriptionFor(image)}</p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold group-hover:gap-2 transition-all">
                  {t("mediatheque.readMore")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
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
