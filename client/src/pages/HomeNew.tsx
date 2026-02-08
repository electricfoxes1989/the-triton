import { useState, useEffect } from "react";
import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { getArticles } from "@/lib/sanity";
import { ChevronLeft, ChevronRight } from "lucide-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

export default function HomeNew() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    getArticles(50)
      .then(results => {
        setArticles(results || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err);
        setIsLoading(false);
      });
  }, []);

  const heroArticle = articles[heroIndex] || null;
  const latestArticles = articles.slice(1, 7);
  const trendingArticles = articles.slice(0, 3);
  const spotlightArticles = articles.slice(7, 9);
  const crewLifeArticles = articles.slice(9, 13);

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
          <section className="relative h-[600px] bg-gray-900">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroArticle.heroImageUrl || heroArticle.mainImage?.asset?.url || '/placeholder-hero.jpg'})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Hero Content */}
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-16">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {heroArticle.title}
                </h1>
                <div className="flex items-center gap-4 text-white/90 text-sm mb-6">
                  <span className="uppercase tracking-wide">
                    BY {heroArticle.author?.name || 'TRITON STAFF'}
                  </span>
                  <span>•</span>
                  <span className="uppercase">{formatDate(heroArticle.publishedAt)}</span>
                </div>
                <Link href={`/article/${heroArticle.slug.current || heroArticle.slug}`}>
                  <button className="px-8 py-3 bg-white text-primary font-semibold rounded hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm">
                    Read More
                  </button>
                </Link>
              </div>

              {/* Carousel Navigation */}
              <div className="absolute bottom-8 right-8 flex items-center gap-4">
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
            </div>
          </section>
        )}

        {/* The Latest News + Trending Now */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Latest News - Left 2/3 */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-8 border-b-4 border-primary pb-2 inline-block">
                  The Latest News
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  {/* First Article - Full Width */}
                  {latestArticles[0] && (
                    <div className="md:col-span-2">
                      <Link href={`/article/${latestArticles[0].slug.current || latestArticles[0].slug}`}>
                        <article className="group cursor-pointer">
                          <div className="aspect-video overflow-hidden mb-4 rounded">
                            <img
                              src={latestArticles[0].heroImageUrl || latestArticles[0].mainImage?.asset?.url || '/placeholder.jpg'}
                              alt={latestArticles[0].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                            {latestArticles[0].title}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {latestArticles[0].excerpt}
                          </p>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">
                            {formatDate(latestArticles[0].publishedAt)}
                          </p>
                        </article>
                      </Link>
                    </div>
                  )}

                  {/* Remaining Articles - Grid */}
                  {latestArticles.slice(1).map((article: any) => (
                    <Link
                      key={article._id}
                      href={`/article/${article.slug.current || article.slug}`}
                    >
                      <article className="group cursor-pointer">
                        <div className="aspect-video overflow-hidden mb-3 rounded">
                          <img
                            src={article.heroImageUrl || article.mainImage?.asset?.url || '/placeholder.jpg'}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">
                          {formatDate(article.publishedAt)}
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Now - Right 1/3 */}
              <div>
                <h2 className="text-2xl font-bold mb-6 border-b-4 border-accent pb-2 inline-block">
                  Trending Now
                </h2>

                <div className="space-y-6 mt-8">
                  {trendingArticles.map((article: any, index: number) => (
                    <Link
                      key={article._id}
                      href={`/article/${article.slug.current || article.slug}`}
                    >
                      <article className="group cursor-pointer flex gap-4">
                        <span className="text-5xl font-bold text-accent/30 leading-none">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
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
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Triton Spotlight</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {spotlightArticles.map((article: any) => (
                <Link
                  key={article._id}
                  href={`/article/${article.slug.current || article.slug}`}
                >
                  <article className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.heroImageUrl || article.mainImage?.asset?.url || '/placeholder.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        Triton Spotlight
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mt-2 mb-3">
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

        {/* Newsletter Signup - Turquoise */}
        <section className="py-16 bg-[#00BCD4] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sign Up to the Triton Newsletter for our Latest Updates
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Join 28K+ captains, crew, and industry leaders for weekly updates.
            </p>

            <form className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-wide"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

        {/* Crew Life Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Crew Life</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {crewLifeArticles.map((article: any) => (
                <Link
                  key={article._id}
                  href={`/article/${article.slug.current || article.slug}`}
                >
                  <article className="group cursor-pointer">
                    <div className="aspect-video overflow-hidden mb-4 rounded">
                      <img
                        src={article.heroImageUrl || article.mainImage?.asset?.url || '/placeholder.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
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
            </div>

            {/* Ad Space */}
            <div className="mt-12 bg-gray-100 h-32 flex items-center justify-center text-gray-400 rounded">
              Advertisement Space
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-gray-300 mb-2">22k</div>
                <div className="text-sm font-semibold text-gray-700 uppercase">Bi-monthly<br />Magazine</div>
                <div className="text-xs text-gray-500 mt-1">Printed and digital<br />distribution</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-gray-300 mb-2">25k+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase">Boat Show Daily</div>
                <div className="text-xs text-gray-500 mt-1">Digital Subscribers.<br />Distributed at FLIBS and<br />Palm Beach boat shows</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-gray-300 mb-2">22k+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase">Weekly News Brief</div>
                <div className="text-xs text-gray-500 mt-1">Email Subscribers</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-gray-300 mb-2">3M+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase">Digital and Social<br />Media</div>
                <div className="text-xs text-gray-500 mt-1">Annual Impressions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Media Kit Banner */}
        <section className="py-0 bg-gradient-to-r from-primary via-primary to-[#00BCD4]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[400px]">
              <div className="text-white py-12">
                <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-white/80">
                  Commitment to Excellence
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  OUR MEDIA KIT
                </h2>
                <p className="text-lg mb-8 text-white/90 leading-relaxed">
                  Find out more about who we are and what we stand for. From our services,
                  mission, vision, and company values to our commitment to customers and
                  testimonials, we present you Bluestar Marine.
                </p>
                <button className="px-8 py-4 bg-[#00BCD4] text-white font-semibold rounded hover:bg-[#00ACC1] transition-colors uppercase tracking-wide">
                  Download Media Kit
                </button>
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
      </main>

      <Footer />
    </div>
  );
}
