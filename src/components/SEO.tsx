import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  keywords?: string;
  canonicalUrl?: string;
}

export const SEO = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage = "https://festivaldoualafiesta.cm/og-image.jpg",
  twitterCard = "summary_large_image",
  keywords,
  canonicalUrl,
}: SEOProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, attribute: "name" | "property" = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (element) {
        element.setAttribute("content", content);
      } else {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        element.setAttribute("content", content);
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    updateMetaTag("description", description);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Open Graph tags
    updateMetaTag("og:title", ogTitle || title, "property");
    updateMetaTag("og:description", ogDescription || description, "property");
    updateMetaTag("og:image", ogImage, "property");
    updateMetaTag("og:type", "website", "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", twitterCard);
    updateMetaTag("twitter:title", ogTitle || title);
    updateMetaTag("twitter:description", ogDescription || description);
    updateMetaTag("twitter:image", ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (linkElement) {
        linkElement.setAttribute("href", canonicalUrl);
      } else {
        linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "canonical");
        linkElement.setAttribute("href", canonicalUrl);
        document.head.appendChild(linkElement);
      }
    }
  }, [title, description, ogTitle, ogDescription, ogImage, twitterCard, keywords, canonicalUrl]);

  return null;
};
