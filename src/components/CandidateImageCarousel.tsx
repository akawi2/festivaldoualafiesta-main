import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showControls?: boolean;
}

const AUTOPLAY_DELAY = 3000;

export const CandidateImageCarousel = ({ images, alt, className, showControls = false }: CandidateImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, AUTOPLAY_DELAY);

    return () => clearInterval(interval);
  }, [images.length, currentIndex]);

  const showPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length],
  );

  const showNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length],
  );

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

      {/* Prev/next controls */}
      {showControls && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrev}
            aria-label="Photo précédente"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-navy shadow-lg transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Photo suivante"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-navy shadow-lg transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

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
