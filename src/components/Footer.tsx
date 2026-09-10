import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import decoAfrique from "@/assets/deco-afrique.png";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const footerLinks = {
    services: [
      { name: t("nav.home"), href: "#accueil" },
      { name: t("nav.about"), href: "#apropos" },
      { name: t("nav.activities"), href: "/miss-election" },
      { name: t("nav.program"), href: "/programme" },
      { name: t("nav.media"), href: "/mediatheque" },
    ],
    company: [
      "Port Autonaume de Douala",
      "Royal des Jeux",
      "Afriland First Bank",
      "Canal 2 International",
      "PMUC",
      "Dash Média",
      "Spectra",
      "Men Travel",
      "Balafon Média",
      "CRTV",
      "Boissons du Cameroun",
    ],
    legal: [t("footer.expertise")],
  };

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "https://www.facebook.com/share/19NWFSaxqr/", label: "Facebook" },
    {
      icon: <Instagram className="h-5 w-5" />,
      href: "https://www.instagram.com/festivaldoualafiesta?utm_source=qr&igsh=MTl5YW95NTFjdXJjdw==",
      label: "Instagram",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://www.linkedin.com/in/festivaldouala-fiesta-157088389?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app ",
      label: "LinkedIn",
    },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation stricte du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      toast.error(t("footer.invalidEmail") || "Veuillez entrer une adresse email valide");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("emails").insert({ email: trimmedEmail });

      if (error) {
        if (error.code === "23505") {
          toast.info(t("footer.alreadySubscribed") || "Vous êtes déjà inscrit à notre newsletter!");
        } else {
          throw error;
        }
      } else {
        toast.success(t("footer.subscriptionSuccess") || "Merci pour votre inscription!");
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error(t("footer.subscriptionError") || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Lisière décorative africaine */}
      <div
        className="w-full h-10 bg-repeat-x bg-amber-light border-t"
        style={{
          backgroundImage: `url(${decoAfrique})`,
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
        }}
        role="presentation"
        aria-hidden="true"
      />

      <footer id="footer" className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">
                {t("footer.eventName")}
              </h3>
              <p className="text-gray-light mb-6 leading-relaxed">{t("footer.description")}</p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gold flex-shrink-0" />
                  <span className="text-gray-light">
                    KOTTO Baden Baden, 50m après l'Immeuble Las Vegas 15137 Douala, Cameroun
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                  <span className="text-gray-light">+237 655 55 11 50</span>
                  <span className="text-gray-light">+237 652 42 14 14</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                  <span className="text-gray-light">infos@festivaldoualafiesta.cm</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">{t("footer.sections")}</h4>
              <ul className="space-y-3">
                {footerLinks.services.map((service, index) => (
                  <li key={index}>
                    {service.href.startsWith("/") ? (
                      <Link to={service.href} className="text-gray-light hover:text-gold transition-colors text-sm">
                        {service.name}
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollToSection(service.href)}
                        className="text-gray-light hover:text-gold transition-colors text-sm"
                      >
                        {service.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-6">{t("footer.partners")}</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => scrollToSection("#apropos")}
                      className="text-gray-light hover:text-gold transition-colors text-sm"
                    >
                      {item}
                    </button>
                  </li>
                ))}
                {/*
              <li>
                <button 
                  onClick={() => scrollToSection("#contact")}
                  className="text-gray-light hover:text-gold transition-colors text-sm"
                >
                  Contact
                </button>
              </li>
              */}
              </ul>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h4 className="text-lg font-semibold mb-6">{t("footer.followUs")}</h4>
              <p className="text-gray-light text-sm mb-4">{t("footer.stayInformed")}</p>

              {/* Social Links */}
              <div className="flex gap-4 mb-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-navy transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <div className="space-y-3">
                <p className="text-sm font-medium">{t("footer.newsletter")}</p>
                <form onSubmit={handleNewsletterSubmit} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("footer.yourEmail")}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-md text-sm placeholder:text-gray-light focus:outline-none focus:border-gold"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-gold text-navy font-medium rounded-r-md hover:scale-105 transition-transform text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "..." : t("footer.subscribe")}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/10 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-light">
                © {currentYear} {t("footer.eventName")}. {t("footer.allRightsReserved")}
              </p>

              <div className="flex flex-wrap gap-6">
                {footerLinks.legal.map((item, index) => (
                  <button key={index} className="text-sm text-gray-light hover:text-gold transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
