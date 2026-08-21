import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CandidateImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export const CandidateImageCarousel = ({ images, alt, className }: CandidateImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Images */}
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`${alt} - Photo ${index + 1}`}
          className={cn(
            "absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={cn(
                "rounded-full bg-white/80 transition-all duration-300",
                index === currentIndex 
                  ? "w-2 h-2 scale-125 bg-gold shadow-lg" 
                  : "w-1.5 h-1.5"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
