import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Phone, Mail, Clock, Plus, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorIp, getVisitorFingerprint } from "@/utils/visitorIdentity";
import { buildWhatsAppUrl, redirectToWhatsApp } from "@/utils/whatsapp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerSubscriptionForm from "@/components/PartnerSubscriptionForm";
import TalentApplicationForm from "@/components/TalentApplicationForm";

const ContactSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [standData, setStandData] = useState({
    standType: "",
    standName: "",
    standPhone: "",
    representative: "",
    position: "",
    sector: "",
    email: "",
    quantity: 1,
  });

  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    eventSite: "",
    festivalDay: "",
  });

  const standTypes = [
    {
      type: "Emplacement mutuel",
      label: t("contact.standTypes.shared"),
      description: t("contact.standTypes.sharedDescript"),
      price: "15 000 FCFA",
      priceValue: 15000,
    },
    {
      type: "Stand Social",
      label: t("contact.standTypes.social"),
      description: t("contact.standTypes.socialDescript"),
      price: "100 000 FCFA",
      priceValue: 100000,
    },
    {
      type: "Stand Business",
      label: t("contact.standTypes.business"),
      description: t("contact.standTypes.businessDescript"),
      price: "250 000 FCFA",
      priceValue: 250000,
    },
    {
      type: "Stand Partenaire",
      label: t("contact.standTypes.partner"),
      description: t("contact.standTypes.patnerDescript"),
      price: "500 000 FCFA",
      priceValue: 500000,
    },
  ];

  // Fonction utilitaire pour le prix du stand (déjà présente, conservée pour le calcul)
  const getSelectedStandPrice = () => {
    const selectedStand = standTypes.find((s) => s.type === standData.standType);
    return selectedStand ? selectedStand.priceValue : 0;
  };

  // Fonction utilitaire pour le prix total (déjà présente, conservée pour le calcul)
  const getTotalPrice = () => {
    return getSelectedStandPrice() * standData.quantity;
  };

  // =========================================================================
  // FONCTION handleStandSubmit MODIFIÉE POUR INCLURE LE PRIX TOTAL
  // =========================================================================
  const handleStandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Calcul du prix total
    const totalPrice = getTotalPrice();

    // Vérification basique
    if (!standData.standType || totalPrice === 0) {
      toast({
        title: "Erreur de sélection",
        description: "Veuillez choisir un type de stand valide et une quantité supérieure à zéro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const [submitterIp, submitterFingerprint] = await Promise.all([getVisitorIp(), getVisitorFingerprint()]);

      const { data, error } = await supabase.rpc("submit_stand_reservation", {
        p_stand_type: standData.standType,
        p_stand_name: standData.standName,
        p_stand_phone: standData.standPhone,
        p_quantity: standData.quantity,
        p_ip: submitterIp,
        p_fingerprint: submitterFingerprint,
        p_representative_name: standData.representative,
        p_representative_position: standData.position || null,
        p_activity_sector: standData.sector,
        p_email: standData.email,
      });

      if (error) {
        console.error("Error submitting stand reservation:", error);
        toast({
          title: "Erreur",
          description: error.code === "P0001" ? error.message : "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      // 3. Le message de toast utilise maintenant la variable totalPrice
      toast({
        title: "Réservation envoyée !",
        description: `Votre demande de réservation pour ${standData.quantity} stand(s) ${standData.standType} (Total: ${totalPrice.toLocaleString("fr-FR")} FCFA) a été envoyée. Nous vous recontacterons rapidement.`,
      });

      redirectToWhatsApp(
        buildWhatsAppUrl(
          `Bonjour, je viens de réserver un stand pour le Festival Douala Fiesta.\n` +
            `Type de stand : ${standData.standType}\n` +
            `Nom/Entreprise : ${standData.standName}\n` +
            `Représentant : ${standData.representative}\n` +
            `Téléphone : ${standData.standPhone}\n` +
            `Quantité : ${standData.quantity}\n` +
            `Montant total : ${totalPrice.toLocaleString("fr-FR")} FCFA`,
        ),
      );

      setStandData({
        standType: "",
        standName: "",
        standPhone: "",
        representative: "",
        position: "",
        sector: "",
        email: "",
        quantity: 1,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  // =========================================================================
  // FIN DE LA MODIFICATION
  // =========================================================================

  const handleStandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "standType") {
      // Reset quantity when changing stand type
      setStandData({
        ...standData,
        [name]: value,
        quantity: 1,
      });
    } else {
      setStandData({
        ...standData,
        [name]: value,
      });
    }
  };

  const incrementQuantity = () => {
    if (standData.standType) {
      setStandData({
        ...standData,
        quantity: standData.quantity + 1,
      });
    }
  };

  // ... (Fonctions handleBookingSubmit et handleBookingInputChange non modifiées)
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("submit_spot_booking", {
        p_first_name: bookingData.firstName,
        p_last_name: bookingData.lastName,
        p_phone: bookingData.phone,
        p_event_site: bookingData.eventSite,
        p_festival_day: bookingData.festivalDay,
      });

      if (error) {
        console.error("Error submitting spot booking:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Inscription confirmée !",
        description: `Votre place a été réservée pour ${bookingData.festivalDay} sur le ${bookingData.eventSite}.`,
      });

      setBookingData({
        firstName: "",
        lastName: "",
        phone: "",
        eventSite: "",
        festivalDay: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleBookingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
    <section id="contact" className="py-12 bg-background scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Contact Form */}
            <Card className="shadow-elegant transition-all duration-500" data-highlight-form="mettre-en-lumiere">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">{t("contact.highlight")}</CardTitle>
              </CardHeader>
              <CardContent>
                <TalentApplicationForm idPrefix="contact-talent" />
              </CardContent>
            </Card>

            {/* Book ta place Form (commented out) */}
            {/* ... */}

            <Card className="bg-gradient-hero text-white shadow-elegant">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-4">{t("contact.infoTitle")}</h4>
                <ul className="space-y-2 text-gray-light">
                  <li>• {t("contact.info1")}</li>
                  <li>• {t("contact.info2")}</li>
                  <li>• {t("contact.info3")}</li>
                </ul>
                <div className="flex items-center gap-2 text-gold font-medium mt-4">
                  <Phone className="h-4 w-4" />
                  <span>+ 237 652 42 14 14</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stand Reservation Form */}
          <div className="space-y-6">
            <Card className="shadow-elegant transition-all duration-500" data-highlight-form="reserver-stand">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {t("contact.standTypes.reserveStand")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t("contact.standTypes.periodNote")}</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="exhibition" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto gap-1 mb-6">
                    <TabsTrigger value="exhibition" className="whitespace-normal text-xs sm:text-sm py-2 h-auto leading-tight">
                      {t("contact.spaces.tabExhibition")}
                    </TabsTrigger>
                    <TabsTrigger value="sponsoring" className="whitespace-normal text-xs sm:text-sm py-2 h-auto leading-tight">
                      {t("contact.spaces.tabSponsoring")}
                    </TabsTrigger>
                    <TabsTrigger value="visibility" className="whitespace-normal text-xs sm:text-sm py-2 h-auto leading-tight">
                      {t("contact.spaces.tabVisibility")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="exhibition">
                <form onSubmit={handleStandSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {t("contact.standTypes.typeOfstand")} *
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {standTypes.map((stand) => (
                        <label key={stand.type} className="relative">
                          <input
                            type="radio"
                            name="standType"
                            value={stand.type}
                            checked={standData.standType === stand.type}
                            onChange={handleStandInputChange}
                            className="sr-only"
                            required
                          />
                          <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              standData.standType === stand.type
                                ? "border-primary bg-primary/5"
                                : "border-input hover:border-primary/50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{stand.label}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{stand.description}</p>
                                <div className="mt-2">
                                  <span className="text-lg font-bold bg-gradient-gold bg-clip-text text-transparent">
                                    {stand.price}
                                  </span>
                                  {standData.standType === stand.type && (
                                    <div className="mt-2 flex items-center gap-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          {t("contact.standTypes.quantity")}:
                                        </span>
                                        <span className="font-semibold text-foreground">{standData.quantity}</span>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8 rounded-full"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            incrementQuantity();
                                          }}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Total: </span>
                                        <span className="font-bold text-gold">
                                          {getTotalPrice().toLocaleString("fr-FR")} FCFA
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="standName" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.standTypes.exposant")} *
                    </label>
                    <Input
                      id="standName"
                      name="standName"
                      value={standData.standName}
                      onChange={handleStandInputChange}
                      required
                      placeholder={t("contact.standTypes.placeholderName")}
                    />
                  </div>

                  <div>
                    <label htmlFor="representative" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.standTypes.representative")} *
                    </label>
                    <Input
                      id="representative"
                      name="representative"
                      value={standData.representative}
                      onChange={handleStandInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.standTypes.position")}
                      </label>
                      <Input id="position" name="position" value={standData.position} onChange={handleStandInputChange} />
                    </div>
                    <div>
                      <label htmlFor="sector" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.standTypes.sector")} *
                      </label>
                      <Input id="sector" name="sector" value={standData.sector} onChange={handleStandInputChange} required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="standPhone" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.standTypes.expoPhone")} *
                    </label>
                    <Input
                      id="standPhone"
                      name="standPhone"
                      type="tel"
                      value={standData.standPhone}
                      onChange={handleStandInputChange}
                      required
                      placeholder="+237 655 55 11 50"
                    />
                  </div>

                  <div>
                    <label htmlFor="standEmail" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.standTypes.email")} *
                    </label>
                    <Input
                      id="standEmail"
                      name="email"
                      type="email"
                      value={standData.email}
                      onChange={handleStandInputChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground mb-2">{t("contact.standTypes.benefitsTitle")}</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {(t("contact.standTypes.benefits", { returnObjects: true }) as string[]).map((b) => (
                        <li key={b}>• {b}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-gold text-navy font-semibold text-lg py-3 hover:scale-105 transition-transform shadow-gold"
                  >
                    {t("contact.standTypes.reservation")}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t("contact.standTypes.invoiceNote")}</p>
                </form>
                  </TabsContent>

                  <TabsContent value="sponsoring">
                    <PartnerSubscriptionForm kind="sponsoring" />
                  </TabsContent>
                  <TabsContent value="visibility">
                    <PartnerSubscriptionForm kind="visibility" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>

    {/* Redirection WhatsApp désormais automatique après l'inscription : cette fenêtre avec bouton n'est plus utilisée.
    <Dialog open={!!whatsappUrl} onOpenChange={(open) => !open && setWhatsappUrl(null)}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-center">Réservation envoyée !</DialogTitle>
          <DialogDescription className="text-center">
            Vous pouvez continuer la conversation sur WhatsApp pour la suite de votre réservation.
          </DialogDescription>
        </DialogHeader>
        <Button
          className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white"
          onClick={() => {
            if (whatsappUrl) window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            setWhatsappUrl(null);
          }}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Continuer sur WhatsApp
        </Button>
      </DialogContent>
    </Dialog>
    */}
    </>
  );
};

export default ContactSection;
