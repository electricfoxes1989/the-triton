import { useState, useRef, useEffect } from "react";
import {
  sanityImageUrl,
  sanityImageSrcSet,
  sanityPlaceholderUrl,
  isSanityImage,
  IMAGE_PRESETS,
} from "@/lib/sanityImage";

interface SanityImageProps {
  src: string;
  alt: string;
  preset?: keyof typeof IMAGE_PRESETS;
  width?: number;
  height?: number;
  quality?: number;
  fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min";
  className?: string;
  sizes?: string;
  priority?: boolean; // If true, skip lazy loading (above-the-fold images)
  aspectRatio?: string; // e.g. "16/9", "4/3"
}

/**
 * Optimized image component for Sanity CDN images.
 * Features:
 * - Auto WebP/AVIF format conversion
 * - Responsive srcSet generation
 * - Blur-up placeholder animation
 * - Lazy loading for below-fold images
 * - Graceful fallback for non-Sanity URLs
 */
export function SanityImage({
  src,
  alt,
  preset,
  width,
  height,
  quality,
  fit = "crop",
  className = "",
  sizes,
  priority = false,
  aspectRatio,
}: SanityImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Resolve dimensions from preset or explicit props
  const presetConfig = preset ? IMAGE_PRESETS[preset] : null;
  const finalWidth = width || (presetConfig as any)?.width || 800;
  const finalHeight = height || (presetConfig as any)?.height;
  const finalQuality = quality || (presetConfig as any)?.quality || 75;
  const finalFit = fit || (presetConfig as any)?.fit || "crop";

  // Generate optimized URL
  const optimizedSrc = isSanityImage(src)
    ? sanityImageUrl(src, {
        width: finalWidth,
        height: finalHeight,
        quality: finalQuality,
        fit: finalFit,
      })
    : src;

  // Generate srcSet for responsive images
  const srcSet = isSanityImage(src)
    ? sanityImageSrcSet(src, finalWidth, finalQuality, finalFit)
    : undefined;

  // Generate blur-up placeholder
  const placeholderSrc = isSanityImage(src) ? sanityPlaceholderUrl(src) : "";

  // Default sizes attribute based on common layouts
  const defaultSizes =
    sizes ||
    (finalWidth >= 1200
      ? "100vw"
      : finalWidth >= 800
        ? "(max-width: 768px) 100vw, 66vw"
        : finalWidth >= 600
          ? "(max-width: 768px) 100vw, 50vw"
          : "(max-width: 768px) 50vw, 33vw");

  // Check if image is already cached (instant load)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  if (error || !src) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ aspectRatio: aspectRatio || "16/9" }}
      >
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* Blur-up placeholder */}
      {placeholderSrc && !loaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover scale-110 blur-sm"
          style={{ filter: "blur(20px)", transform: "scale(1.1)" }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={defaultSizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default SanityImage;
