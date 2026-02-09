import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Calendar, ArrowRight, Award, Anchor, TrendingUp, Users } from "lucide-react";

export default function CaptainsPage() {
  const { data: articles, isLoading } = trpc.articles.byCategory.useQuery({
    categorySlug: "captains",
    limit: 20,
  });

  const { data: featuredVideo } = trpc.videos.byCategory.useQuery({
    category: "captains",
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationNew />

      {/* Hero Section with Video Embed */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-700 text-white">
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 uppercase">
                Captains
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Expert insights, technical guidance, and professional advice from experienced superyacht captains. Navigate complex regulations, operational challenges, and best practices for vessel management.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#articles">
                  <button className="bg-white text-gray-900 px-8 py-3 rounded font-bold hover:bg-gray-100 transition-colors">
                    Read Expert Insights
                  </button>
                </a>
                <a href="#profiles">
                  <button className="border-2 border-white text-white px-8 py-3 rounded font-bold hover:bg-white hover:text-gray-900 transition-colors">
                    View Captain Profiles
                  </button>
                </a>
              </div>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              {featuredVideo?.videoUrl ? (
                <iframe
                  className="w-full h-full"
                  src={featuredVideo.videoUrl}
                  title={featuredVideo.title || "Captain Interview"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
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
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Advertisement</p>
            <div className="h-24 flex items-center justify-center">
              <p className="text-gray-400 text-lg">Marine Equipment & Services Banner (728x90)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Articles Section */}
      <div id="articles" className="bg-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 uppercase">Latest Insights</h2>
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
                    <article className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200">
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
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-2">
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
              <p className="text-gray-500 text-lg">No captain articles yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Captain Profiles Showcase */}
      <div id="profiles" className="bg-gradient-to-br from-gray-100 to-gray-50 py-16">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-900 uppercase mb-8">Featured Captains</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
                  <Anchor className="w-24 h-24 text-white/30" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Captain Profile {i}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    25+ years experience commanding superyachts worldwide. Specialising in Mediterranean and Caribbean operations.
                  </p>
                  <button className="text-primary font-semibold hover:underline flex items-center gap-2">
                    View Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Ad 2 */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-6 md:px-8">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Advertisement</p>
            <div className="h-24 flex items-center justify-center">
              <p className="text-gray-400 text-lg">Insurance & Legal Services Banner (728x90)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Development Resources */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-900 uppercase mb-8">Professional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certifications</h3>
              <p className="text-gray-600 mb-4">
                Stay current with MCA, USCG, and international maritime certification requirements and renewal processes.
              </p>
              <button className="text-primary font-semibold hover:underline flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry Insights</h3>
              <p className="text-gray-600 mb-4">
                Market trends, charter season updates, and operational best practices from industry leaders.
              </p>
              <button className="text-indigo-600 font-semibold hover:underline flex items-center gap-2">
                Explore <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crew Management</h3>
              <p className="text-gray-600 mb-4">
                Leadership strategies, recruitment guidance, and team development resources for effective crew management.
              </p>
              <button className="text-primary font-semibold hover:underline flex items-center gap-2">
                View Resources <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Best Practices Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Anchor className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4 uppercase">Industry Best Practices</h2>
              <p className="text-xl text-gray-300">
                Access comprehensive guides on safety protocols, regulatory compliance, environmental stewardship, and operational excellence.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
                <h3 className="text-lg font-bold mb-2">Safety & Security</h3>
                <p className="text-gray-300 text-sm">
                  ISPS compliance, emergency procedures, and crew safety protocols
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
                <h3 className="text-lg font-bold mb-2">Regulatory Compliance</h3>
                <p className="text-gray-300 text-sm">
                  Flag state requirements, MLC 2006, and international maritime law
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
                <h3 className="text-lg font-bold mb-2">Environmental Standards</h3>
                <p className="text-gray-300 text-sm">
                  MARPOL compliance, waste management, and sustainable operations
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
                <h3 className="text-lg font-bold mb-2">Operational Excellence</h3>
                <p className="text-gray-300 text-sm">
                  Maintenance schedules, budget management, and performance optimisation
                </p>
              </div>
            </div>
            <div className="text-center mt-12">
              <button className="bg-white text-gray-900 px-8 py-3 rounded font-bold hover:bg-gray-100 transition-colors">
                Access Full Resource Library
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
