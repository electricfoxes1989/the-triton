import { useEffect } from "react";
import { useBannerAd } from "@/lib/sanityHooks";

import { ExternalLink } from "lucide-react";

interface BannerAdProps {
  page: string;
  position: string;
  className?: string;
  fallbackContent?: React.ReactNode;
}

export default function BannerAd({ page, position, className = "", fallbackContent }: BannerAdProps) {
  const { data: banner, isLoading } = useBannerAd(page, position);
  
  const trackImpression = { mutate: () => {} };
  const trackClick = { mutate: () => {} };

  // Track impression when banner is loaded
  useEffect(() => {
    if (banner?._id) {
      trackImpression.mutate({ adId: banner._id });
    }
  }, [banner?._id]);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
        <div className="w-full h-full"></div>
      </div>
    );
  }

  if (!banner) {
    return fallbackContent ? <>{fallbackContent}</> : null;
  }

  const handleClick = () => {
    if (banner?._id) {
      trackClick.mutate({ adId: banner._id });
    }
  };

  return (
    <a
      href={banner.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block group relative overflow-hidden ${className}`}
      title={banner.advertiser || banner.title}
      onClick={handleClick}
    >
      <img
        src={banner.imageUrl}
        alt={banner.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Optional overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
        <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
      </div>

      {/* Advertiser label (optional) */}
      {banner.advertiser && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-white text-xs font-medium">{banner.advertiser}</p>
        </div>
      )}
    </a>
  );
}
