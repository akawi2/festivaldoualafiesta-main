import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const ContactSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    scene: "",
    phone: "",
    quartier: "",
    arrondissement: "",
    participationType: "",
    message: "",
  });

  const [showOtherInput, setShowOtherInput] = useState(false);

  const [standData, setStandData] = useState({
    standType: "",
    standName: "",
    standPhone: "",
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
      type: t("contact.standTypes.social"),
      description: t("contact.standTypes.socialDescript"),
      price: "150 000 FCFA",
      priceValue: 150000,
    },
    {
      type: t("contact.standTypes.business"),
      description: t("contact.standTypes.businessDescript"),
      price: "500 000 FCFA",
      priceValue: 500000,
    },
    {
      type: t("contact.standTypes.partner"),
      description: t("contact.standTypes.patnerDescript"),
      price: "1 000 000 FCFA",
      priceValue: 1000000,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("submit_talent_application", {
        p_name: formData.name,
        p_stage_name: formData.scene,
        p_phone: formData.phone || null,
        p_quartier: formData.quartier || null,
        p_arrondissement: formData.arrondissement || null,
        p_participation_type: formData.participationType,
        p_talent_description: formData.message,
      });

      if (error) {
        console.error("Error submitting talent application:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Candidature envoyée !",
        description:
          "Votre candidature pour vous mettre en lumière a été soumise avec succès. Nous vous recontacterons bientôt.",
      });

      setFormData({
        name: "",
        scene: "",
        phone: "",
        quartier: "",
        arrondissement: "",
        participationType: "",
        message: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "participationType") {
      if (value === "autre") {
        setShowOtherInput(true);
        setFormData({
          ...formData,
          participationType: "",
        });
        return;
      }

      if (showOtherInput) {
        // L'utilisateur saisit dans le champ "Autre" -> on garde le champ visible
        setFormData({
          ...formData,
          participationType: value,
        });
        return;
      }

      // Sélection depuis la liste (valeur différente de "autre")
      setShowOtherInput(false);
      setFormData({
        ...formData,
        participationType: value,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

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

    const priceStand = getSelectedStandPrice();

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
      const { data, error } = await supabase.rpc("submit_stand_reservation", {
        p_stand_type: standData.standType,
        p_stand_name: standData.standName,
        p_stand_phone: standData.standPhone,
        p_quantity: standData.quantity,
        p_price_fcfa: priceStand,
        p_total_price: totalPrice,
      });

      if (error) {
        console.error("Error submitting stand reservation:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      // 3. Le message de toast utilise maintenant la variable totalPrice
      toast({
        title: "Réservation envoyée !",
        description: `Votre demande de réservation pour ${standData.quantity} stand(s) ${standData.standType} (Total: ${totalPrice.toLocaleString("fr-FR")} FCFA) a été envoyée. Nous vous recontacterons rapidement.`,
      });

      setStandData({
        standType: "",
        standName: "",
        standPhone: "",
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.fullName")} *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder={t("contact.yourFullName")}
                      />
                    </div>
                    <div>
                      <label htmlFor="ville" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.stageName")} *
                      </label>
                      <Input
                        id="scene"
                        name="scene"
                        value={formData.scene}
                        onChange={handleInputChange}
                        required
                        placeholder={t("contact.yourStageName")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quartier" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.quartier")}
                      </label>
                      <Input
                        id="quartier"
                        name="quartier"
                        value={formData.quartier}
                        onChange={handleInputChange}
                        placeholder={t("contact.yourNeighbor")}
                      />
                    </div>
                    <div>
                      <label htmlFor="arrondissement" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.arrondissement")}
                      </label>
                      <Input
                        id="arrondissement"
                        name="arrondissement"
                        value={formData.arrondissement}
                        onChange={handleInputChange}
                        placeholder={t("contact.yourdistrict")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.phone")}
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+237 655 55 11 50"
                      />
                    </div>
                    <div>
                      <label htmlFor="participationType" className="block text-sm font-medium text-foreground mb-2">
                        {t("contact.talentCategory")} *
                      </label>
                      {!showOtherInput ? (
                        <select
                          id="participationType"
                          name="participationType"
                          value={formData.participationType}
                          onChange={handleInputChange}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">{t("contact.specifyCategory")}</option>
                          <option value="musique">{t("contact.music")}</option>
                          <option value="peinture">{t("contact.painting")}</option>
                          <option value="beaute">{t("contact.beauty")}</option>
                          <option value="mode">{t("contact.fashion")}</option>
                          <option value="danse">{t("contact.dance")}</option>
                          <option value="autre">{t("contact.other")}</option>
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            id="participationType"
                            name="participationType"
                            value={formData.participationType}
                            onChange={handleInputChange}
                            required
                            placeholder={t("contact.specifyCategory")}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowOtherInput(false);
                              setFormData({ ...formData, participationType: "" });
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground underline"
                          >
                            {t("contact.backToOptions")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.tellUsAboutTalent")} *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder={t("contact.describeTalent")}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-gold text-navy font-semibold text-lg py-3 hover:scale-105 transition-transform shadow-gold"
                  >
                    {t("contact.sendRequest")}
                  </Button>
                </form>
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
              </CardHeader>
              <CardContent>
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
                                <h4 className="font-semibold text-foreground">{stand.type}</h4>
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

                  <Button
                    type="submit"
                    className="w-full bg-gradient-gold text-navy font-semibold text-lg py-3 hover:scale-105 transition-transform shadow-gold"
                  >
                    {t("contact.standTypes.reservation")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
