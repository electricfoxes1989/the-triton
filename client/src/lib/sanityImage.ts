/**
 * Sanity Image Transformation Utility
 *
 * Appends Sanity CDN query parameters to image URLs for:
 * - Responsive sizing (w, h, fit)
 * - Auto format conversion (WebP/AVIF when supported)
 * - Quality optimization
 * - Blur-up placeholders (low-quality image previews)
 */

const SANITY_CDN_PREFIX = "cdn.sanity.io/images";

/**
 * Check if a URL is a Sanity CDN image
 */
export function isSanityImage(url: string): boolean {
  return url.includes(SANITY_CDN_PREFIX);
}

/**
 * Append transformation parameters to a Sanity image URL.
 * Non-Sanity URLs are returned unchanged.
 */
export function sanityImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min";
    auto?: "format";
    blur?: number;
    dpr?: number;
  } = {}
): string {
  if (!url || !isSanityImage(url)) return url;

  const params = new URLSearchParams();

  if (options.width) params.set("w", String(options.width));
  if (options.height) params.set("h", String(options.height));
  if (options.quality) params.set("q", String(options.quality));
  if (options.fit) params.set("fit", options.fit);
  if (options.blur) params.set("blur", String(options.blur));
  if (options.dpr) params.set("dpr", String(options.dpr));

  // Always auto-format for WebP/AVIF support
  params.set("auto", "format");

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.toString()}`;
}

/**
 * Preset sizes for common image contexts
 */
export const IMAGE_PRESETS = {
  /** Hero image on homepage — large, high quality */
  heroLarge: { width: 1200, quality: 80, fit: "crop" as const },
  /** Hero image on article page — full width */
  heroArticle: { width: 1400, quality: 85, fit: "crop" as const },
  /** Sidebar thumbnail — small */
  thumbnail: { width: 400, height: 300, quality: 75, fit: "crop" as const },
  /** News grid card — medium */
  card: { width: 600, height: 400, quality: 75, fit: "crop" as const },
  /** Related article card */
  related: { width: 400, height: 260, quality: 75, fit: "crop" as const },
  /** Category listing — featured first article */
  categoryHero: { width: 800, height: 500, quality: 80, fit: "crop" as const },
  /** Category listing — grid items */
  categoryCard: { width: 600, height: 400, quality: 75, fit: "crop" as const },
  /** Blur-up placeholder — tiny, heavily blurred */
  placeholder: { width: 40, quality: 20, blur: 50 },
  /** OG / social sharing image */
  ogImage: { width: 1200, height: 630, quality: 80, fit: "crop" as const },
} as const;

/**
 * Generate a srcSet string for responsive images.
 * Provides 1x, 1.5x, and 2x versions.
 */
export function sanityImageSrcSet(
  url: string,
  baseWidth: number,
  quality: number = 75,
  fit: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min" = "crop"
): string {
  if (!url || !isSanityImage(url)) return "";

  const widths = [baseWidth, Math.round(baseWidth * 1.5), baseWidth * 2];

  return widths
    .map((w) => {
      const transformed = sanityImageUrl(url, { width: w, quality, fit });
      return `${transformed} ${w}w`;
    })
    .join(", ");
}

/**
 * Get a blur-up placeholder URL for a Sanity image.
 * Returns a tiny, blurred version for instant loading.
 */
export function sanityPlaceholderUrl(url: string): string {
  if (!url || !isSanityImage(url)) return "";
  return sanityImageUrl(url, IMAGE_PRESETS.placeholder);
}

/**
 * Apply a preset to a Sanity image URL.
 */
export function sanityPreset(
  url: string,
  preset: keyof typeof IMAGE_PRESETS
): string {
  return sanityImageUrl(url, IMAGE_PRESETS[preset]);
}
