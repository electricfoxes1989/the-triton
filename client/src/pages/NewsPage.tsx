import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import BannerAd from "@/components/BannerAd";
import TrendingArticles from "@/components/TrendingArticles";
import { trpc } from "@/lib/trpc";
import { Newspaper, TrendingUp, Ship, Calendar, Users, ArrowRight } from "lucide-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

interface ArticleCardProps {
  article: any;
  featured?: boolean;
}

function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const slug = typeof article.slug === "string" ? article.slug : article.slug.current;
  
  if (featured) {
    return (
      <Link href={`/article/${slug}`}>
        <article className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-gray-100">
              {article.heroImageUrl ? (
                <img
                  src={article.heroImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0A2342] to-[#00BCD4]"></div>
              )}
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-[#00BCD4] text-white text-xs font-bold uppercase tracking-wider rounded">
                  Featured
                </span>
                {article.category && (
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {article.category.title}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {article.title}
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium uppercase tracking-wide">
                  BY {article.author?.name || 'TRITON STAFF'}
                </span>
                <span>•</span>
                <span className="uppercase">{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/article/${slug}`}>
      <article className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-full flex flex-col">
        <div className="aspect-video overflow-hidden bg-gray-100">
          {article.heroImageUrl ? (
            <img
              src={article.heroImageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0A2342] to-[#00BCD4]"></div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          {article.category && (
            <span className="text-xs font-semibold text-[#00BCD4] uppercase tracking-wider mb-2">
              {article.category.title}
            </span>
          )}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors mb-3 line-clamp-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            {article.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
            <span className="uppercase tracking-wide font-medium">
              BY {article.author?.name || 'TRITON STAFF'}
            </span>
            <span>•</span>
            <span className="uppercase">{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  viewAllLink?: string;
}

function SectionHeader({ icon, title, description, viewAllLink }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#0A2342] text-white rounded-lg">
          {icon}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl">
            {description}
          </p>
        </div>
      </div>
      {viewAllLink && (
        <Link href={viewAllLink}>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0A2342] hover:text-[#00BCD4] transition-colors group">
            View All
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      )}
    </div>
  );
}

export default function NewsPage() {
  // Fetch all news articles
  const { data: allArticles = [], isLoading } = trpc.articles.list.useQuery({ limit: 50 });

  // Filter articles by category (assuming categories are set in Sanity)
  const latestNews = allArticles.slice(0, 7); // Top 7 for featured + grid
  const industryInsights = allArticles.filter(a => 
    a.category?.title?.toLowerCase().includes('industry') || 
    a.category?.title?.toLowerCase().includes('business')
  ).slice(0, 3);
  const yachtReviews = allArticles.filter(a => 
    a.category?.title?.toLowerCase().includes('yacht') || 
    a.category?.title?.toLowerCase().includes('review')
  ).slice(0, 3);
  const eventsNews = allArticles.filter(a => 
    a.category?.title?.toLowerCase().includes('event') || 
    a.category?.title?.toLowerCase().includes('show')
  ).slice(0, 3);
  const crewLife = allArticles.filter(a => 
    a.category?.title?.toLowerCase().includes('crew')
  ).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavigationNew />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading news...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationNew />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#0A2342] to-[#00BCD4] py-16">
          <div className="container mx-auto px-6 md:px-8">
            <div className="flex items-center gap-4 mb-4">
              <Newspaper size={48} className="text-white" />
              <h1 className="text-4xl md:text-5xl font-bold text-white uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                News
              </h1>
            </div>
            <p className="text-white/90 text-lg max-w-3xl leading-relaxed">
              Latest breaking news and updates from the superyacht industry. Stay informed with comprehensive coverage of maritime regulations, industry developments, and yacht operations worldwide.
            </p>
          </div>
        </section>

        {/* Banner Ad */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 md:px-8 py-4">
            <BannerAd 
              page="news" 
              position="content-top" 
              className="w-full h-24 rounded-lg"
            />
          </div>
        </div>

        {/* Featured Article */}
        {latestNews[0] && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-6 md:px-8">
              <ArticleCard article={latestNews[0]} featured={true} />
            </div>
          </section>
        )}

        {/* Latest News Grid with Sidebar */}
        {latestNews.length > 1 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6 md:px-8">
              <SectionHeader
                icon={<Newspaper size={24} />}
                title="Latest News"
                description="Breaking stories and recent developments from across the superyacht sector"
                viewAllLink="/category/news"
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content - Articles Grid */}
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {latestNews.slice(1, 7).map((article) => (
                      <ArticleCard key={article._id} article={article} />
                    ))}
                  </div>
                </div>
                
                {/* Sidebar - Trending Articles */}
                <div className="lg:col-span-4">
                  <div className="lg:sticky lg:top-8">
                    <TrendingArticles limit={5} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Industry Insights */}
        {industryInsights.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6 md:px-8">
              <SectionHeader
                icon={<TrendingUp size={24} />}
                title="Industry Insights"
                description="In-depth analysis, market trends, and expert perspectives on the yachting business"
                viewAllLink="/category/industry"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {industryInsights.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Banner Ad */}
        <div className="bg-gray-50 border-y border-gray-200">
          <div className="container mx-auto px-6 md:px-8 py-6">
            <BannerAd 
              page="news" 
              position="content-middle" 
              className="w-full h-24 rounded-lg"
            />
          </div>
        </div>

        {/* Yacht Reviews */}
        {yachtReviews.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6 md:px-8">
              <SectionHeader
                icon={<Ship size={24} />}
                title="Yacht Reviews"
                description="Detailed reviews, specifications, and insights on the world's finest superyachts"
                viewAllLink="/category/yacht"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {yachtReviews.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Events & Shows */}
        {eventsNews.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6 md:px-8">
              <SectionHeader
                icon={<Calendar size={24} />}
                title="Events & Shows"
                description="Coverage of yacht shows, industry events, and maritime exhibitions worldwide"
                viewAllLink="/events"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {eventsNews.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Crew Life */}
        {crewLife.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6 md:px-8">
              <SectionHeader
                icon={<Users size={24} />}
                title="Crew Life"
                description="Stories, advice, and updates for superyacht crew members and maritime professionals"
                viewAllLink="/crew-life"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {crewLife.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-[#0A2342] to-[#00BCD4]">
          <div className="container mx-auto px-6 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Stay Updated
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest superyacht news, industry insights, and exclusive content delivered directly to your inbox.
            </p>
            <Link href="/advertise">
              <button className="px-8 py-4 bg-white text-[#0A2342] font-bold uppercase tracking-wide rounded-lg hover:bg-gray-100 transition-colors">
                Subscribe to Newsletter
              </button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
