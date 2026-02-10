import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import BannerAd from "@/components/BannerAd";
import { trpc } from "@/lib/trpc";
import { Calendar, ArrowRight, Briefcase, BookOpen, MapPin } from "lucide-react";

export default function CrewLifePage() {
  const { data: articles, isLoading } = trpc.articles.byCategory.useQuery({
    categorySlug: "crew-life",
    limit: 20,
  });

  const { data: featuredVideo } = trpc.videos.byCategory.useQuery({
    category: "crew-life",
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationNew />

      {/* Hero Section with Video Embed */}
      <div className="relative bg-gradient-to-r from-[#0A2342] to-[#00BCD4] text-white">
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 uppercase">
                Crew Life
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Discover the lifestyle, opportunities, and experiences of working at sea. From career advice to destination guides, we cover everything that matters to yacht crew.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#articles">
                  <button className="bg-white text-cyan-600 px-8 py-3 rounded font-bold hover:bg-gray-100 transition-colors">
                    Read Latest Stories
                  </button>
                </a>
                <a href="#opportunities">
                  <button className="border-2 border-white text-white px-8 py-3 rounded font-bold hover:bg-white hover:text-cyan-600 transition-colors">
                    View Opportunities
                  </button>
                </a>
              </div>
            </div>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              {featuredVideo?.videoUrl ? (
                <iframe
                  className="w-full h-full"
                  src={featuredVideo.videoUrl}
                  title={featuredVideo.title || "Crew Life Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <p className="text-white/60">No featured video available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Ad 1 */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-6 md:px-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 text-center">Advertisement</p>
          <BannerAd 
            page="crew-life" 
            position="content-top"
            className="h-24 w-full rounded-lg overflow-hidden"
            fallbackContent={
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-8 text-center h-24 flex items-center justify-center">
                <p className="text-gray-400 text-lg">Crew Training & Certification Banner</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Featured Articles Section */}
      <div id="articles" className="bg-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 uppercase">Latest Stories</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => {
                const articleSlug = typeof article.slug === 'string' ? article.slug : article.slug.current;
                return (
                  <Link key={article._id} href={`/article/${articleSlug}`}>
                    <article className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                      {article.heroImageUrl && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={article.heroImageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <time dateTime={article.publishedAt}>
                              {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </time>
                          </div>
                          {article.author && (
                            <span className="font-medium">By {article.author.name}</span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No crew life articles yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Life at Sea Photo Gallery */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-900 uppercase mb-8">Life at Sea</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-300 rounded-lg overflow-hidden group cursor-pointer">
                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Ad 2 */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-6 md:px-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 text-center">Advertisement</p>
          <BannerAd 
            page="crew-life" 
            position="content-middle"
            className="h-24 w-full rounded-lg overflow-hidden"
            fallbackContent={
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-8 text-center h-24 flex items-center justify-center">
                <p className="text-gray-400 text-lg">Crew Recruitment Agency Banner</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Crew Resources Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-900 uppercase mb-8">Crew Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Training Guides</h3>
              <p className="text-gray-600 mb-4">
                Essential certifications, courses, and training programmes for advancing your yachting career.
              </p>
              <button className="text-cyan-600 font-semibold hover:underline flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Job Opportunities</h3>
              <p className="text-gray-600 mb-4">
                Browse current crew positions on superyachts worldwide. Find your next adventure.
              </p>
              <button className="text-blue-600 font-semibold hover:underline flex items-center gap-2">
                View Jobs <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Destination Guides</h3>
              <p className="text-gray-600 mb-4">
                Insider tips on the best ports, marinas, and crew-friendly destinations around the globe.
              </p>
              <button className="text-cyan-600 font-semibold hover:underline flex items-center gap-2">
                Explore <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Widget */}
      <div id="opportunities" className="bg-gradient-to-r from-[#0A2342] to-[#00BCD4] text-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Briefcase className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4 uppercase">Ready for Your Next Role?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with leading yacht crew recruitment agencies and find opportunities on the world's finest superyachts.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-cyan-600 text-white px-8 py-3 rounded font-bold hover:bg-cyan-700 transition-colors">
                Browse Crew Positions
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded font-bold hover:bg-white hover:text-gray-900 transition-colors">
                Post Your CV
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
