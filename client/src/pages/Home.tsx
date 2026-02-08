import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PopularTags from "@/components/PopularTags";
import { SanityImage } from "@/components/SanityImage";
import { ArrowRight } from "lucide-react";
import { getArticles, getFeaturedArticles } from "@/lib/sanity";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

function ArticleCardLarge({ article, priority = false }: { article: any; priority?: boolean }) {
  const slug = article.slug?.current || article.slug || "";
  const image = article.heroImageUrl || article.mainImage?.asset?.url || "";
  const category = article.category?.title || "";
  const date = article.publishedAt ? timeAgo(article.publishedAt) : "";

  return (
    <Link href={`/article/${slug}`}>
      <article className="group cursor-pointer">
        {image && (
          <div className="aspect-[16/10] overflow-hidden mb-4 sm:mb-5">
            <SanityImage
              src={image}
              alt={article.title}
              preset="heroLarge"
              priority={priority}
              className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
          </div>
        )}
        {category && (
          <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2]">
            {category}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mt-1.5 sm:mt-2 mb-2 sm:mb-3 text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors font-serif">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-400 font-sans">
          {article.author?.name && <span>{article.author.name}</span>}
          {article.author?.name && date && <span className="w-1 h-1 bg-gray-300 rounded-full" />}
          {date && <span>{date}</span>}
        </div>
      </article>
    </Link>
  );
}

function ArticleCardSmall({ article }: { article: any }) {
  const slug = article.slug?.current || article.slug || "";
  const image = article.heroImageUrl || article.mainImage?.asset?.url || "";
  const category = article.category?.title || "";
  const date = article.publishedAt ? timeAgo(article.publishedAt) : "";

  return (
    <Link href={`/article/${slug}`}>
      <article className="group cursor-pointer flex gap-4 sm:gap-5">
        {image && (
          <div className="w-24 h-18 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden">
            <SanityImage
              src={image}
              alt={article.title}
              preset="thumbnail"
              className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
              sizes="112px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2]">
              {category}
            </span>
          )}
          <h3 className="text-[13px] sm:text-sm font-semibold leading-snug text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors line-clamp-2 mt-0.5 font-serif">
            {article.title}
          </h3>
          <span className="text-[11px] text-gray-400 mt-1 block font-sans">{date}</span>
        </div>
      </article>
    </Link>
  );
}

function ArticleCardMedium({ article }: { article: any }) {
  const slug = article.slug?.current || article.slug || "";
  const image = article.heroImageUrl || article.mainImage?.asset?.url || "";
  const category = article.category?.title || "";
  const date = article.publishedAt ? timeAgo(article.publishedAt) : "";

  return (
    <Link href={`/article/${slug}`}>
      <article className="group cursor-pointer">
        {image && (
          <div className="aspect-[4/3] overflow-hidden mb-3 sm:mb-4">
            <SanityImage
              src={image}
              alt={article.title}
              preset="card"
              className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        {category && (
          <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2]">
            {category}
          </span>
        )}
        <h3 className="text-base sm:text-lg font-bold leading-snug text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors mt-1.5 mb-2 font-serif">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-2 hidden sm:block">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
          {article.author?.name && <span>{article.author.name}</span>}
          {article.author?.name && date && <span className="w-1 h-1 bg-gray-300 rounded-full" />}
          {date && <span>{date}</span>}
        </div>
      </article>
    </Link>
  );
}

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(18);

  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getArticles(100),
      getFeaturedArticles(5)
    ])
      .then(([allArticles, featured]) => {
        setArticles(allArticles || []);
        setFeaturedArticles(featured || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err);
        setIsLoading(false);
      });
  }, []);

  // Hero: featured or first article
  const heroArticle = useMemo(() => {
    if (featuredArticles && featuredArticles.length > 0) return featuredArticles[0];
    return articles[0] || null;
  }, [articles, featuredArticles]);

  // Secondary featured (next 2)
  const secondaryFeatured = useMemo(() => {
    const pool = featuredArticles && featuredArticles.length > 1
      ? featuredArticles.slice(1, 3)
      : articles.slice(1, 3);
    return pool;
  }, [articles, featuredArticles]);

  // Latest sidebar
  const latestSidebar = useMemo(() => articles.slice(3, 8), [articles]);

  // Category sections
  const crewLifeArticles = useMemo(() => {
    return articles.filter((a: any) => a.category?.slug?.current === "crew-life").slice(0, 3);
  }, [articles]);

  const newsArticles = useMemo(() => {
    return articles.filter((a: any) => a.category?.slug?.current === "news").slice(0, 6);
  }, [articles]);

  // More articles for grid
  const moreArticles = useMemo(() => articles.slice(8), [articles]);
  const visibleMore = moreArticles.slice(0, visibleCount);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A1628] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-sans">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        {heroArticle && (
          <section className="bg-white">
            <div className="container py-6 sm:py-10 md:py-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
                {/* Main hero */}
                <div className="lg:col-span-7">
                  <ArticleCardLarge article={heroArticle} priority />
                </div>

                {/* Right column */}
                <div className="lg:col-span-5">
                  {/* Secondary featured */}
                  <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
                    {secondaryFeatured.map((article: any) => (
                      <ArticleCardSmall key={article._id} article={article} />
                    ))}
                  </div>

                  {/* Divider + Latest */}
                  <div className="border-t border-gray-100 pt-5 sm:pt-6">
                    <h3 className="text-[11px] font-sans font-semibold tracking-widest uppercase text-gray-400 mb-4 sm:mb-5">
                      Latest
                    </h3>
                    <div className="space-y-4 sm:space-y-5">
                      {latestSidebar.map((article: any) => (
                        <Link key={article._id} href={`/article/${article.slug?.current || ""}`}>
                          <div className="group cursor-pointer py-1.5 sm:py-2 border-b border-gray-50 last:border-b-0">
                            <h4 className="text-[13px] sm:text-sm font-medium text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors leading-snug font-serif">
                              {article.title}
                            </h4>
                            <span className="text-[11px] text-gray-400 mt-1 block font-sans">
                              {article.publishedAt ? timeAgo(article.publishedAt) : ""}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Popular Topics */}
                  <div className="border-t border-gray-100 pt-5 sm:pt-6 mt-5 sm:mt-6">
                    <PopularTags variant="sidebar" limit={10} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* News Section */}
        {newsArticles.length > 0 && (
          <section className="bg-[#FAFAFA] py-10 sm:py-14">
            <div className="container">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1628] font-serif">News</h2>
                <Link
                  href="/news"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#0A1628] transition-colors font-sans"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {newsArticles.map((article: any) => (
                  <ArticleCardMedium key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Explore Topics */}
        <section className="bg-white py-10 sm:py-14 border-t border-gray-100">
          <div className="container">
            <PopularTags variant="inline" limit={16} title="Explore Topics" />
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-[#0A1628] py-12 sm:py-16 md:py-20">
          <div className="container text-center px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 font-serif">
              Stay in the Know
            </h2>
            <p className="text-white/50 max-w-lg mx-auto mb-6 sm:mb-8 font-sans text-sm sm:text-base">
              Join 28,000+ captains, crew, and industry leaders who receive our weekly briefing.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 sm:gap-0 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-colors font-sans"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-[#3ECFB2] text-[#0A1628] text-sm font-semibold hover:bg-[#3ECFB2]/90 transition-colors font-sans"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

        {/* Crew Life Section */}
        {crewLifeArticles.length > 0 && (
          <section className="bg-white py-10 sm:py-14">
            <div className="container">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1628] font-serif">Crew Life</h2>
                <Link
                  href="/crew-life"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#0A1628] transition-colors font-sans"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {crewLifeArticles.map((article: any) => (
                  <ArticleCardMedium key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* More Articles Grid */}
        {visibleMore.length > 0 && (
          <section className="bg-[#FAFAFA] py-10 sm:py-14">
            <div className="container">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A1628] mb-6 sm:mb-8 font-serif">More Stories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {visibleMore.map((article: any) => (
                  <ArticleCardMedium key={article._id} article={article} />
                ))}
              </div>

              {/* Load More */}
              {visibleCount < moreArticles.length && (
                <div className="text-center mt-8 sm:mt-12">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 border border-gray-300 text-sm font-medium text-gray-600 hover:text-[#0A1628] hover:border-[#0A1628] transition-colors font-sans"
                  >
                    Load More Stories
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              {[
                { number: "22K", label: "Magazine Distribution", sub: "Printed & digital" },
                { number: "25K+", label: "Boat Show Daily", sub: "Digital subscribers" },
                { number: "28K+", label: "Weekly Newsletter", sub: "Email subscribers" },
                { number: "3M+", label: "Annual Impressions", sub: "Digital & social" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A1628]/10 font-serif">{stat.number}</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#0A1628] mt-2 font-sans">{stat.label}</p>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-1 font-sans">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
