import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Trophy } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import lanceGauche from "@/assets/lance-gauche.png";
import lanceDroite from "@/assets/lance-droite.png";
import { SEO } from "@/components/SEO";

interface Hero {
  id: string;
  name: string;
  category: string;
  description_fr?: string;
  description_en?: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  likes_count: number;
}

const HerosKwatt = () => {
  const { t, i18n } = useTranslation();
  const [heros, setHeros] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [likingInProgress, setLikingInProgress] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const highlightedHeroId = searchParams.get("hero");
  const { toast } = useToast();
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHeros();
  }, []);

  const fetchHeros = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("kwatt_heroes")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("likes_count", { ascending: false });

      if (error) throw error;
      setHeros(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des héros:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les héros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Générer les catégories dynamiquement depuis les données
  const categories = ["Tous", ...Array.from(new Set(heros.map((h) => h.category)))];

  const filteredHeros =
    selectedCategory === "Tous" ? heros : heros.filter((hero) => hero.category === selectedCategory);

  const featuredHero = heros.find((h) => h.is_featured) || heros[0];

  const handleLike = async (heroId: string) => {
    setLikingInProgress(heroId);
    try {
      const fingerprint = await generateFingerprint();
      const voterIp = "unknown";
      const sessionId = `${fingerprint}-${Date.now()}`;

      // Enregistrer le like
      const { error: likeError } = await supabase.from("kwatt_hero_likes").insert({
        hero_id: heroId,
        voter_ip: voterIp,
        voter_fingerprint: fingerprint,
        session_id: sessionId,
        user_agent: navigator.userAgent,
      });

      if (likeError) {
        console.error("Error recording like:", likeError);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre like",
          variant: "destructive",
        });
        return;
      }

      // Incrémenter le compteur
      const { error: incrementError } = await supabase.rpc("increment_hero_likes", {
        hero_uuid: heroId,
      });

      if (incrementError) {
        console.error("Error incrementing likes:", incrementError);
      }

      // Refetch pour avoir les données à jour
      await fetchHeros();

      toast({
        title: "Like enregistré !",
        description: "Merci pour votre soutien",
      });
    } catch (error) {
      console.error("Erreur lors du like:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre like",
        variant: "destructive",
      });
    } finally {
      setLikingInProgress(null);
    }
  };

  const generateFingerprint = async (): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx?.fillText("fingerprint", 2, 2);
    const canvasFingerprint = canvas.toDataURL();
    const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}-${canvasFingerprint}`;
    return btoa(fingerprint).substring(0, 32);
  };

  // Effet pour scroller vers le héros mis en évidence
  useEffect(() => {
    if (highlightedHeroId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`hero-${highlightedHeroId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightedHeroId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">Chargement des héros...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Héros du Kwatt - Festival Douala Fiesta | Talents Locaux"
        description="Découvrez les héros du Kwatt, les talents locaux qui font la fierté de Douala. Votez et soutenez les artistes, entrepreneurs et personnalités inspirantes de notre communauté."
        keywords="Héros Kwatt, talents Douala, artistes locaux, personnalités Cameroun, vote talents, culture locale Douala"
        canonicalUrl="https://festivaldoualafiesta.cm/heros-kwatt"
        ogImage="https://lovable.dev/opengraph-image-p98pqg.png"
        ogTitle="Héros du Kwatt - Découvrez et votez pour les talents locaux de Douala"
        ogDescription="Soutenez les héros du Kwatt, ces talents qui font rayonner Douala. Artistes, entrepreneurs, et personnalités inspirantes à découvrir."
      />
      {/* Header avec navigation retour */}
      <div className="bg-gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="h-4 w-4" />
              {t("herosKwatt.backToHome")}
            </Button>
          </Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">{t("herosKwatt.title")}</h1>
          <p className="text-xl text-gray-light max-w-3xl">{t("herosKwatt.description")}</p>
        </div>
      </div>

      {/* Section Héros du Jour */}
      {featuredHero && (
        <div className="bg-gradient-to-r from-primary/5 to-gold/5 border-y border-gold/20">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("herosKwatt.heroOfThe")}{" "}
                <span className="bg-gradient-gold bg-clip-text text-transparent">{t("herosKwatt.day")}</span>
              </h2>
              <p className="text-muted-foreground text-lg">{t("herosKwatt.hero")}</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-gold/60 rounded-xl overflow-hidden bg-white">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image du héros du jour */}
                  <div className="relative overflow-hidden h-80 md:h-auto">
                    <img
                      src={featuredHero.image_url || "/placeholder.svg"}
                      alt={featuredHero.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                        <Trophy className="h-4 w-4 mr-2" />
                        {t("herosKwatt.heroOfThe")} {t("herosKwatt.day")}
                      </Badge>
                    </div>
                  </div>

                  {/* Contenu */}
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="mb-4">
                      <Badge variant="outline" className="mb-4 border-gold/40 text-gold">
                        {featuredHero.category}
                      </Badge>
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-gold transition-colors duration-300">
                        {featuredHero.name}
                      </h3>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {(i18n.language === 'en' ? featuredHero.description_en : featuredHero.description_fr) || "Un talent exceptionnel qui fait rayonner notre communauté."}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {featuredHero.likes_count} {t("herosKwatt.likes")}
                      </div>
                      <Button
                        variant="default"
                        onClick={() => handleLike(featuredHero.id)}
                        disabled={likingInProgress === featuredHero.id}
                        className="bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-white font-semibold transition-all duration-300 hover:scale-105"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        {likingInProgress === featuredHero.id ? "..." : t("herosKwatt.like")}
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Grille des héros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHeros.map((hero) => {
            const isHighlighted = highlightedHeroId === hero.id;
            return (
              <Card
                key={hero.id}
                id={`hero-${hero.id}`}
                className={`group hover:shadow-2xl transition-all duration-500 border-2 hover:border-gold/70 rounded-xl overflow-hidden bg-white hover:scale-105 ${
                  isHighlighted
                    ? "border-gold ring-4 ring-gold/50 shadow-2xl scale-105 bg-gradient-to-br from-gold/5 to-gold/10"
                    : "border-gold/40"
                }`}
              >
                {/* Image du héros */}
                <div className="relative overflow-hidden">
                  <img
                    src={hero.image_url || "/placeholder.svg"}
                    alt={hero.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/95 text-navy px-3 py-1 rounded-full text-sm font-semibold border border-gold/30">
                      {hero.category}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Nom */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-gold transition-colors duration-300">
                      {hero.name}
                    </h3>
                  </div>

                  {/* Description */}
                  {(() => {
                    const description = (i18n.language === 'en' ? hero.description_en : hero.description_fr) ||
                      "Un talent exceptionnel qui contribue au développement culturel de notre région.";
                    const isExpanded = expandedDescriptions.has(hero.id);
                    const shouldTruncate = description.length > 150;

                    return (
                      <div className="mb-6">
                        <p className={`text-muted-foreground text-sm leading-relaxed ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
                          {description}
                        </p>
                        {shouldTruncate && (
                          <button
                            onClick={() => {
                              setExpandedDescriptions(prev => {
                                const newSet = new Set(prev);
                                if (isExpanded) {
                                  newSet.delete(hero.id);
                                } else {
                                  newSet.add(hero.id);
                                }
                                return newSet;
                              });
                            }}
                            className="text-xs text-gold font-medium mt-1 hover:underline"
                          >
                            {isExpanded ? t("herosKwatt.readLess") || "Lire moins" : t("herosKwatt.readMore") || "Lire plus"}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Compteur de likes et bouton */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {hero.likes_count} {t("herosKwatt.likes")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLike(hero.id)}
                      disabled={likingInProgress === hero.id}
                      className="bg-gradient-to-r from-gold/10 to-gold/20 border-gold/40 hover:border-gold/60 text-foreground font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {likingInProgress === hero.id ? "..." : t("herosKwatt.like")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredHeros.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t("herosKwatt.noHeroFound")}</p>
          </div>
        )}

        {/* Statistiques en bas */}
        {heros.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold mb-2">{heros.length}</div>
              <div className="text-muted-foreground">{t("herosKwatt.heroesListed")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold mb-2">{categories.length - 1}</div>
              <div className="text-muted-foreground">{t("herosKwatt.artisticCategories")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold mb-2">
                {heros.reduce((total, hero) => total + hero.likes_count, 0)}
              </div>
              <div className="text-muted-foreground">{t("herosKwatt.totalLikes")}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HerosKwatt;
