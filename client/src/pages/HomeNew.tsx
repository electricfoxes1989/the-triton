import { useState, useEffect } from "react";
import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import StatisticsSection from "@/components/StatisticsSection";
import { useArticles } from "@/lib/sanityHooks";
import { ChevronLeft, ChevronRight } from "lucide-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

export default function HomeNew() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Fetch articles directly from Sanity
  const { data: articles = [], isLoading } = useArticles(50);
  
  // Auto-rotation effect
  useEffect(() => {
    if (isPaused || articles.length === 0) return;
    
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(articles.length, 5));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPaused, articles.length]);

  const heroArticle = articles[heroIndex] || null;
  const latestArticles = articles.slice(1, 8); // 7 articles total
  const trendingArticles = articles.slice(0, 5); // 5 trending items
  const spotlightArticles = articles.slice(8, 10);
  const crewLifeArticles = articles.slice(10, 14);

  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % Math.min(articles.length, 5));
  };

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + Math.min(articles.length, 5)) % Math.min(articles.length, 5));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavigationNew />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationNew />

      <main className="flex-1">
        {/* Hero Carousel Section */}
        {heroArticle && (
          <section 
            className="relative h-[600px] bg-gray-900"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: heroArticle.heroImageUrl ? `url(${heroArticle.heroImageUrl})` : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>

            {/* Hero Content */}
            <div className="relative container mx-auto px-6 md:px-8 h-full flex flex-col justify-end pb-20 md:pb-24">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-[#00BCD4] text-white text-xs font-bold uppercase tracking-widest mb-3">
                  NEWS
                </span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {heroArticle.title}
                </h1>
                <div className="flex items-center gap-3 text-white/90 text-xs mb-4">
                  <span className="uppercase tracking-wide">
                    BY {heroArticle.author?.name || 'TRITON STAFF'}
                  </span>
                  <span>•</span>
                  <span className="uppercase">{formatDate(heroArticle.publishedAt)}</span>
                </div>
                <Link href={`/article/${typeof heroArticle.slug === "string" ? heroArticle.slug : heroArticle.slug.current}`}>
                  <button className="px-6 py-2 bg-white text-primary font-semibold rounded hover:bg-gray-100 hover-scale transition-colors uppercase tracking-wide text-xs">
                    Read More
                  </button>
                </Link>
              </div>
            </div>

            {/* Carousel Navigation */}
            <div className="absolute bottom-8 right-6 md:right-8 flex items-center gap-4 z-10">
                <button
                  onClick={prevHero}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                
                {/* Dots */}
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(articles.length, 5) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i === heroIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextHero}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>
          </section>
        )}

        {/* The Latest News + Trending Now */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Latest News - Left 2/3 */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-8">
                  The Latest News
                  <div className="h-1 w-24 bg-primary mt-2"></div>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  {/* First Article - Full Width */}
                  {latestArticles[0] && (
                    <div className="md:col-span-2">
                      <Link href={`/article/${typeof latestArticles[0].slug === "string" ? latestArticles[0].slug : latestArticles[0].slug.current}`}>
                        <article className="group cursor-pointer hover-card">
                          <div className="aspect-video overflow-hidden mb-4 rounded">
                            <img
                              src={latestArticles[0].heroImageUrl || '/placeholder.jpg'}
                              alt={latestArticles[0].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-[var(--triton-aqua)] transition-colors mb-3 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                            {latestArticles[0].title}
                          </h3>
                          <p className="text-lg text-gray-700 mb-4 line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
                            {latestArticles[0].excerpt}
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                            By {latestArticles[0].author?.name || 'Triton Staff'}
                          </p>
                        </article>
                      </Link>
                    </div>
                  )}

                  {/* Remaining Articles - Grid */}
                  {latestArticles.slice(1).map((article: any) => (
                    <Link
                      key={article._id}
                      href={`/article/${typeof article.slug === "string" ? article.slug : article.slug.current}`}
                    >
                      <article className="group cursor-pointer hover-card">
                        <div className="aspect-video overflow-hidden mb-3 rounded">
                          <img
                            src={article.heroImageUrl || '/placeholder.jpg'}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[var(--triton-aqua)] transition-colors mb-3 line-clamp-3 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                          {article.title}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                          By {article.author?.name || 'Triton Staff'}
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Now - Right 1/3 */}
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  Trending Now
                  <div className="h-1 w-24 bg-[#00BCD4] mt-2"></div>
                </h2>

                <div className="space-y-6">
                  {trendingArticles.map((article: any, index: number) => (
                    <Link
                      key={article._id}
                      href={`/article/${typeof article.slug === "string" ? article.slug : article.slug.current}`}
                    >
                      <article className="group cursor-pointer flex gap-4">
                        <span className="text-5xl font-bold text-accent/30 leading-none">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--triton-aqua)] transition-colors mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">
                            {formatDate(article.publishedAt)}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Triton Spotlight */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-8">
            <h2 className="text-3xl font-bold mb-8">
              Triton Spotlight
              <div className="h-1 w-24 bg-primary mt-2"></div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {spotlightArticles.map((article: any) => (
                <Link
                  key={article._id}
                  href={`/article/${typeof article.slug === "string" ? article.slug : article.slug.current}`}
                >
                  <article className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.heroImageUrl || '/placeholder.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        Triton Spotlight
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[var(--triton-aqua)] transition-colors mt-2 mb-3">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* Statistics Section */}
        <StatisticsSection />

        {/* Media Kit Banner */}
        <section className="py-0 bg-gradient-to-r from-primary via-primary to-[#00BCD4]">
          <div className="container mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[400px]">
              <div className="text-white py-12">
                <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-white/80">
                  Advertise with Triton
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  REACH THE YACHTING INDUSTRY
                </h2>
                <p className="text-lg mb-8 text-white/90 leading-relaxed">
                  For two decades, Triton has been the voice of the people who keep the yachting industry moving. 
                  Position your brand alongside the go-to source for technical expertise, regulatory information, 
                  and career advice trusted by 22,000 captains and crew worldwide.
                </p>
                <a href="/TRITON-MediaKit-2026.pdf" download className="inline-block px-8 py-4 bg-[#00BCD4] text-white font-semibold rounded hover:bg-[#00ACC1] transition-colors uppercase tracking-wide">
                  Download Media Kit 2026
                </a>
              </div>
              <div className="hidden md:flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-80 h-80 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white/50 text-sm">Media Kit Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="relative py-12 md:py-16 bg-gradient-to-br from-primary via-[#1e4a7f] to-[#00BCD4] overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="container mx-auto px-6 md:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-block mb-4">
                  <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold uppercase tracking-widest text-white">
                    Stay Informed
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                  Never Miss a Story
                </h2>
                <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Join <span className="font-bold text-white">27,000+ industry professionals</span> receiving weekly insights on yachting news, crew life, and maritime careers.
                </p>
              </div>

              {/* Form */}
              <form className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-2xl">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCD4] text-base font-medium"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-[#00BCD4] text-white font-bold rounded-lg hover:bg-[#00ACC1] transition-all duration-300 uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
                  >
                    Subscribe Now
                  </button>
                </div>
                <p className="text-center text-white/70 text-sm mt-4">
                  Free weekly newsletter • Unsubscribe anytime • No spam, ever
                </p>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">27k+</div>
                  <div className="text-xs md:text-sm text-white/70 uppercase tracking-wide">Subscribers</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">Weekly</div>
                  <div className="text-xs md:text-sm text-white/70 uppercase tracking-wide">Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">20+ Years</div>
                  <div className="text-xs md:text-sm text-white/70 uppercase tracking-wide">Publishing</div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Crew Life Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-8">
            <h2 className="text-3xl font-bold mb-8">
              Crew Life
              <div className="h-1 w-24 bg-primary mt-2"></div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {crewLifeArticles.slice(0, 3).map((article: any) => (
                <Link
                  key={article._id}
                  href={`/article/${typeof article.slug === "string" ? article.slug : article.slug.current}`}
                >
                  <article className="group cursor-pointer hover-card">
                    <div className="aspect-video overflow-hidden mb-4 rounded">
                      <img
                        src={article.heroImageUrl || '/placeholder.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--triton-aqua)] transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {formatDate(article.publishedAt)}
                    </p>
                  </article>
                </Link>
              ))}
              
              {/* Advertisement Card */}
              <a 
                href="https://amesolutions.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group cursor-pointer hover-card block"
              >
                <div className="aspect-video overflow-hidden mb-4 rounded bg-gray-900 flex items-center justify-center">
                  <img 
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663300921591/iiNXMBiFuXVYMGIh.png" 
                    alt="AME Solutions - Driveline Failure? We're here for you when SHIP HAPPENS"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--triton-aqua)] transition-colors mb-2">
                  AME Solutions
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Driveline solutions when ship happens
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Sponsored
                </p>
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
