import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Building2, ExternalLink, Camera } from "lucide-react";
import { useState } from "react";

export default function ExposPage() {
  const [displayCount, setDisplayCount] = useState(6);
  // Fetch expo articles from Sanity
  const { data: expos, isLoading } = trpc.articles.byCategory.useQuery({ 
    categorySlug: "expos",
    limit: 20 
  });

  // Separate upcoming and past expos (placeholder logic - would need status field in Sanity)
  const upcomingExpos = expos?.filter((expo: any) => 
    new Date(expo.publishedAt) > new Date()
  ) || [];
  const allPastExpos = expos?.filter((expo: any) => 
    new Date(expo.publishedAt) <= new Date()
  ) || [];
  const pastExpos = allPastExpos.slice(0, displayCount);
  const hasMore = displayCount < allPastExpos.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNew />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0A2342] to-[#00BCD4] text-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">TRITON EXPOS</h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Join us for networking, industry exhibitions, competitions, and entertainment
            at The Triton's premier yachting events throughout the year.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 md:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#00BCD4] rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading expos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Upcoming Expo Section */}
            {upcomingExpos.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <Calendar className="w-8 h-8 text-[#00BCD4]" />
                  <h2 className="text-3xl font-bold text-gray-900">UPCOMING EXPO</h2>
                </div>

                {upcomingExpos.map((expo: any) => (
                  <Card key={expo._id} className="p-8 bg-gradient-to-br from-white to-gray-50 border-2 border-[#00BCD4]">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Expo Image */}
                      {expo.mainImage && (
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <img
                            src={expo.mainImage}
                            alt={expo.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Expo Details */}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {expo.title}
                        </h3>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-start gap-3 text-gray-700">
                            <Calendar className="w-5 h-5 text-[#00BCD4] mt-0.5" />
                            <div>
                              <p className="font-semibold">
                                {new Date(expo.publishedAt).toLocaleDateString("en-GB", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-gray-600">5:00 PM – 8:00 PM</p>
                            </div>
                          </div>

                          {expo.excerpt && (
                            <div className="flex items-start gap-3 text-gray-700">
                              <MapPin className="w-5 h-5 text-[#00BCD4] mt-0.5" />
                              <p>{expo.excerpt}</p>
                            </div>
                          )}
                        </div>

                        <div className="prose prose-sm max-w-none mb-6">
                          <p className="text-gray-700">
                            Join us for an incredible evening of networking, drinks, games, and
                            outstanding entertainment with the best of the marine industry.
                          </p>
                        </div>

                        <Button size="lg" className="w-full md:w-auto" asChild>
                          <a href={`/article/${expo.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            RSVP Now
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Past Expos Section */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-8 h-8 text-[#00BCD4]" />
                <h2 className="text-3xl font-bold text-gray-900">PAST EXPOS</h2>
              </div>

              {pastExpos.length > 0 ? (
                <>
                <div className="space-y-8">
                  {pastExpos.map((expo: any, index: number) => (
                    <Card key={expo._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Expo Image */}
                        {expo.mainImage && (
                          <div className="md:col-span-1">
                            <a href={`/article/${expo.slug}`} className="block">
                              <div className="aspect-video md:aspect-square overflow-hidden">
                                <img
                                  src={expo.mainImage}
                                  alt={expo.title}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </a>
                          </div>
                        )}

                        {/* Expo Content */}
                        <div className="md:col-span-2 p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-block px-3 py-1 bg-[#00BCD4] text-white text-xs font-semibold rounded-full uppercase">
                              Expo
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(expo.publishedAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <a href={`/article/${expo.slug}`}>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-[#00BCD4] transition-colors">
                              {expo.title}
                            </h3>
                          </a>

                          {expo.excerpt && (
                            <p className="text-gray-700 mb-4 line-clamp-3">
                              {expo.excerpt}
                            </p>
                          )}

                          {/* Stats (placeholder - would need custom fields in Sanity) */}
                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#00BCD4]" />
                              <span>View Details</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#00BCD4]" />
                              <span>Industry Vendors</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Camera className="w-4 h-4 text-[#00BCD4]" />
                              <a href="/galleries" className="hover:text-[#00BCD4] transition-colors">
                                View Photos
                              </a>
                            </div>
                          </div>

                          <Button variant="outline" asChild>
                            <a href={`/article/${expo.slug}`}>
                              Read Full Recap →
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <div className="mb-4 text-sm text-gray-600">
                      Showing {displayCount} of {allPastExpos.length} past expos
                    </div>
                    <Button
                      onClick={loadMore}
                      size="lg"
                      className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white px-8"
                    >
                      Load More Expos
                    </Button>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-20">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Past Expos Yet
                  </h3>
                  <p className="text-gray-600">
                    Check back soon for recaps from previous Triton Expo events.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
