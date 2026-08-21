import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import cudLogo from "@/assets/cud-transparent.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useIsMobile } from "@/hooks/use-mobile";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  partner_type: string;
  website_url: string | null;
  is_active: boolean;
  display_order: number;
}

const PartnersSection = () => {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cardsPerPage, setCardsPerPage] = useState(8);
  const isMobile = useIsMobile();

  useEffect(() => {
    const updateCardsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCardsPerPage(4); // Mobile
      } else if (width < 1024) {
        setCardsPerPage(6); // Tablet
      } else {
        setCardsPerPage(8); // Desktop
      }
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching partners:", error);
      return;
    }

    if (data) {
      // Sort to ensure CUD is always first
      const sortedPartners = [...data].sort((a, b) => {
        const isCUD_A = a.name.toLowerCase().includes("communauté urbaine");
        const isCUD_B = b.name.toLowerCase().includes("communauté urbaine");

        if (isCUD_A) return -1;
        if (isCUD_B) return 1;
        return a.display_order - b.display_order;
      });

      setPartners(sortedPartners);
    }
  };

  const renderPartnerCard = (partner: Partner) => (
    <a
      key={partner.id}
      href={partner.website_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="text-center shadow-elegant hover:shadow-gold transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm h-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center mb-4 h-16">
            <img
              src={partner.logo_url || cudLogo}
              alt={`Logo ${partner.name}`}
              className="max-h-full max-w-full object-contain filter brightness-50 hover:brightness-100 transition-all duration-300"
            />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">{partner.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{partner.partner_type}</p>
          {partner.website_url && (
            <p className="text-xs text-gold hover:text-gold-light transition-colors">
              {t("partners.facebook")}
            </p>
          )}
        </CardContent>
      </Card>
    </a>
  );

  const partnersInGroups = [];
  for (let i = 0; i < partners.length; i += cardsPerPage) {
    partnersInGroups.push(partners.slice(i, i + cardsPerPage));
  }

  return (
    <section id="partenaires" className="py-16 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16"></div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-hero rounded-2xl p-12 text-white mb-12 py-[20px]">
          <h3 className="text-3xl font-bold mb-4">{t("partners.joinUs")}</h3>
          <p className="text-xl mb-8 text-gray-light">{t("partners.experience")}</p>
        </div>

        {partners.length <= cardsPerPage ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {partners.map((partner) => renderPartnerCard(partner))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              axis: "y",
            }}
            plugins={
              isMobile
                ? [
                    Autoplay({
                      delay: 3000,
                    }),
                  ]
                : []
            }
            className="w-full"
          >
            <CarouselContent className="h-[500px]">
              {partnersInGroups.map((group, groupIndex) => (
                <CarouselItem key={groupIndex}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {group.map((partner) => renderPartnerCard(partner))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {!isMobile && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        )}

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            {t("partners.wantToBePartner")}{" "}
            <button
              onClick={() => {
                const contactSection = document.getElementById("footer");
                if (contactSection) {
                  contactSection.scrollIntoView({
                    behavior: "smooth",
                  });
                }
              }}
              className="text-gold hover:text-gold-light font-semibold underline-offset-4 hover:underline transition-colors"
            >
              {t("partners.contactUs")}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
export default PartnersSection;
