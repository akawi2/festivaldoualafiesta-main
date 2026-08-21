import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import logoFdf from "@/assets/logo-fdf.png";
import festivalText from "@/assets/festival-douala-fiesta-text.png";
import patternBg from "@/assets/pattern-background.png";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#accueil");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reserveDropdownOpen, setReserveDropdownOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  // Sections that stay on the home page as scroll anchors.
  const anchorItems = [
    { name: t('nav.home'), href: "#accueil" },
    { name: t('nav.about'), href: "#apropos" },
  ];

  // Sections that now live on their own dedicated pages, to keep the home page lighter.
  const routeItems = [
    { name: t('nav.program'), path: "/programme" },
    { name: t('nav.media'), path: "/mediatheque" },
    { name: t('nav.contacts'), path: "/contact" },
  ];

  const activitiesSubItems = [
    { name: t('nav.missContest'), path: "/miss-election" },
    { name: t('nav.herosKwatt'), path: "/heros-kwatt" },
  ];

  const scrollToSection = (href: string) => {
    setActiveSection(href);
    const element = document.querySelector(href);
    if (element) {
      const yOffset = -100; // Offset pour la navbar fixe
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const goToStandForm = () => {
    navigate("/contact", { state: { highlight: "reserver-stand" } });
    setIsOpen(false);
    setReserveDropdownOpen(false);
  };

  const goToMissRegistration = () => {
    navigate("/miss-election", { state: { openRegistration: true } });
    setIsOpen(false);
    setReserveDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <img
                src={logoFdf}
                alt="Festival Douala Fiesta Logo"
                className="h-12 w-auto group-hover:scale-105 transition-transform"
              />
              <img
                src={festivalText}
                alt="Festival Douala Fiesta"
                className="h-8 w-auto group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {anchorItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="relative text-foreground hover:!text-gold transition-colors font-medium group"
                >
                  {item.name}
                  {activeSection === item.href && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/5 h-0.5 bg-gold rounded-full transition-all duration-300" />
                  )}
                </button>
              ))}

              {/* Activités dropdown */}
              <div className="relative group">
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  onMouseEnter={() => setDropdownOpen(true)}
                  className="relative text-foreground hover:!text-gold transition-colors font-medium flex items-center gap-1"
                >
                  {t('nav.activities')}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="py-2">
                      {activitiesSubItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          onClick={() => setDropdownOpen(false)}
                          className="block w-full text-left px-4 py-3 text-foreground hover:bg-accent hover:text-gold transition-colors font-medium"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zone invisible pour maintenir le menu ouvert */}
                {dropdownOpen && (
                  <div
                    className="absolute top-full left-0 w-72 h-2 bg-transparent"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  />
                )}
              </div>

              {routeItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative text-foreground hover:!text-gold transition-colors font-medium"
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/5 h-0.5 bg-gold rounded-full transition-all duration-300" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button & Language Selector */}
          <div className="hidden md:flex items-center gap-2">
            <div
              className="relative"
              onMouseEnter={() => setReserveDropdownOpen(true)}
              onMouseLeave={() => setReserveDropdownOpen(false)}
            >
              <Button
                className="relative overflow-hidden text-white font-semibold hover:scale-105 transition-transform shadow-gold border border-gold/30"
                style={{
                  backgroundImage: `url(${patternBg})`,
                  backgroundSize: '20px 20px',
                  backgroundRepeat: 'repeat'
                }}
              >
                {t('nav.reserve')}
              </Button>

              {/* Sous-menu ancré sous le bouton : les 2 options se séparent gauche/droite */}
              <button
                onClick={goToMissRegistration}
                tabIndex={reserveDropdownOpen ? 0 : -1}
                className={`absolute top-full mt-2 right-1/2 mr-1 whitespace-nowrap rounded-lg text-sm font-semibold border border-gold/30 bg-background text-foreground hover:text-gold hover:bg-accent shadow-lg transition-all duration-300 ease-out px-4 py-2.5 ${
                  reserveDropdownOpen ? "opacity-100 -translate-x-4" : "opacity-0 translate-x-0 pointer-events-none"
                }`}
              >
                {t('nav.registerAsMiss')}
              </button>

              <button
                onClick={goToStandForm}
                tabIndex={reserveDropdownOpen ? 0 : -1}
                className={`absolute top-full mt-2 left-1/2 ml-1 whitespace-nowrap rounded-lg text-sm font-semibold border border-gold/30 bg-background text-foreground hover:text-gold hover:bg-accent shadow-lg transition-all duration-300 ease-out px-4 py-2.5 ${
                  reserveDropdownOpen ? "opacity-100 translate-x-4" : "opacity-0 translate-x-0 pointer-events-none"
                }`}
              >
                {t('nav.reserveStand')}
              </button>

              {/* Zone invisible pour maintenir le survol entre le bouton et le sous-menu */}
              {reserveDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-full h-2" />
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-foreground hover:text-gold"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase">{i18n.language}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border">
                <DropdownMenuItem
                  onClick={() => changeLanguage('fr')}
                  className={`cursor-pointer ${i18n.language === 'fr' ? 'bg-accent text-gold font-semibold' : ''}`}
                >
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage('en')}
                  className={`cursor-pointer ${i18n.language === 'en' ? 'bg-accent text-gold font-semibold' : ''}`}
                >
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {anchorItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="relative block w-full text-left px-3 py-2 text-foreground hover:!text-gold transition-colors font-medium"
                >
                  {item.name}
                  {activeSection === item.href && (
                    <div className="absolute bottom-0 left-3 w-1/5 h-0.5 bg-gold rounded-full transition-all duration-300" />
                  )}
                </button>
              ))}

              {/* Activités group */}
              <div className="px-3 py-2">
                <span className="block text-sm font-semibold text-muted-foreground mb-1">
                  {t('nav.activities')}
                </span>
                <div className="pl-2 space-y-1">
                  {activitiesSubItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      to={subItem.path}
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-left py-1 text-foreground hover:!text-gold transition-colors font-medium"
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              </div>

              {routeItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="relative block w-full text-left px-3 py-2 text-foreground hover:!text-gold transition-colors font-medium"
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-3 w-1/5 h-0.5 bg-gold rounded-full transition-all duration-300" />
                  )}
                </Link>
              ))}

              <div className="pt-4 space-y-2">
                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-muted-foreground px-1">
                    {t('nav.reserve')}
                  </span>
                  <Button
                    onClick={goToMissRegistration}
                    variant="outline"
                    className="w-full font-semibold border-gold/30"
                  >
                    {t('nav.registerAsMiss')}
                  </Button>
                  <Button
                    onClick={goToStandForm}
                    className="w-full relative overflow-hidden text-white font-semibold border border-gold/30"
                    style={{
                      backgroundImage: `url(${patternBg})`,
                      backgroundSize: '20px 20px',
                      backgroundRepeat: 'repeat'
                    }}
                  >
                    {t('nav.reserveStand')}
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="uppercase">{i18n.language}</span>
                      <ChevronDown className="h-3 w-3 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full bg-background border border-border">
                    <DropdownMenuItem
                      onClick={() => changeLanguage('fr')}
                      className={`cursor-pointer ${i18n.language === 'fr' ? 'bg-accent text-gold font-semibold' : ''}`}
                    >
                      🇫🇷 Français
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => changeLanguage('en')}
                      className={`cursor-pointer ${i18n.language === 'en' ? 'bg-accent text-gold font-semibold' : ''}`}
                    >
                      🇬🇧 English
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
