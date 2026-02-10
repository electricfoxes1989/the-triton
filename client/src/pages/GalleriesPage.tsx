import { useState } from "react";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Calendar, User } from "lucide-react";
import Lightbox from "@/components/Lightbox";

type EventType = "all" | "boat-show" | "expo" | "networking" | "competition" | "industry-event";

export default function GalleriesPage() {
  const [selectedType, setSelectedType] = useState<EventType>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (imageUrl: string, allImages: string[]) => {
    setLightboxImages(allImages);
    setLightboxIndex(allImages.indexOf(imageUrl));
    setLightboxOpen(true);
  };

  // Fetch galleries from Sanity (placeholder - will need to add to Sanity schema)
  const { data: galleries, isLoading } = trpc.articles.byCategory.useQuery({ 
    categorySlug: "galleries",
    limit: 50 
  });

  const eventTypes = [
    { value: "all" as const, label: "All Galleries" },
    { value: "boat-show" as const, label: "Boat Shows" },
    { value: "expo" as const, label: "Triton Expos" },
    { value: "networking" as const, label: "Networking Events" },
    { value: "competition" as const, label: "Competitions" },
    { value: "industry-event" as const, label: "Industry Events" },
  ];

  // Filter galleries by type (placeholder logic)
  const filteredGalleries = galleries || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNew />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0A2342] to-[#00BCD4] text-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">PHOTO GALLERIES</h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Explore moments from boat shows, Triton Expos, networking events, and
            industry gatherings captured by our photographers.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 md:px-8 py-12">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {eventTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              onClick={() => setSelectedType(type.value)}
              className="rounded-full"
            >
              {type.label}
            </Button>
          ))}
        </div>

        {/* Galleries Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#00BCD4] rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading galleries...</p>
            </div>
          </div>
        ) : filteredGalleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGalleries.map((gallery: any) => (
              <a
                key={gallery._id}
                href={`/article/${gallery.slug}`}
                className="group block"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Gallery Image */}
                  {gallery.mainImage && (
                    <div className="aspect-video overflow-hidden bg-gray-200">
                      <img
                        src={gallery.mainImage}
                        alt={gallery.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Gallery Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-3 py-1 bg-[#00BCD4] text-white text-xs font-semibold rounded-full uppercase">
                        Gallery
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(gallery.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00BCD4] transition-colors line-clamp-2">
                      {gallery.title}
                    </h3>

                    {gallery.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {gallery.excerpt}
                      </p>
                    )}

                    {/* Photo Count & Photographer */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        <span>View Gallery</span>
                      </div>
                      {gallery.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>By {gallery.author.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Galleries Yet
            </h3>
            <p className="text-gray-600">
              Check back soon for photo galleries from boat shows, expos, and industry
              events.
            </p>
          </div>
        )}
      </div>

      <Footer />
      
      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
