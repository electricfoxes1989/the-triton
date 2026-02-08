import { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { getArticlesByCategory, getArticles } from "@/lib/sanity";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SanityImage } from "@/components/SanityImage";
import { ArrowRight, Loader2 } from "lucide-react";

function timeAgo(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const categoryMap: Record<string, { name: string; sanitySlug: string; description: string }> = {
  "/news": {
    name: "News",
    sanitySlug: "news",
    description: "The latest from the yachting industry — business updates, regulations, and maritime events.",
  },
  "/crew-life": {
    name: "Crew Life",
    sanitySlug: "crew-life",
    description: "Stories, advice, and resources for yacht crew members navigating life at sea.",
  },
  "/magazines": {
    name: "Magazines",
    sanitySlug: "magazines",
    description: "Browse our archive of The Triton magazine issues featuring in-depth articles and features.",
  },
  "/destinations": {
    name: "Destinations",
    sanitySlug: "destinations",
    description: "Explore the world's best cruising grounds, marinas, and yacht-friendly destinations.",
  },
  "/yachts-for-sale": {
    name: "Yachts For Sale",
    sanitySlug: "yachts-for-sale",
    description: "Browse listings of yachts available for purchase from trusted brokers worldwide.",
  },
};

export default function Category() {
  const [location] = useLocation();
  const [visibleCount, setVisibleCount] = useState(12);

  const category = categoryMap[location] || categoryMap["/news"];

  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getArticlesByCategory(category.sanitySlug, 100)
      .then(results => {
        if (results && results.length > 0) {
          setArticles(results);
        } else {
          // Fallback: fetch all and filter client-side
          return getArticles(100).then(all => {
            const filtered = all.filter((a: any) =>
              a.category?.slug?.current === category.sanitySlug ||
              a.category?.slug === category.sanitySlug
            );
            setArticles(filtered);
          });
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch category articles:', err);
        setIsLoading(false);
      });
  }, [category.sanitySlug]);

  const displayArticles = useMemo(() => {
    return articles.filter((a: any) =>
      a.category?.slug?.current === category.sanitySlug ||
      a.category?.slug === category.sanitySlug
    );
  }, [articles, category.sanitySlug]);

  const visibleArticles = displayArticles.slice(0, visibleCount);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navigation />

      <main className="flex-1">
        {/* Category Header */}
        <section className="bg-white border-b border-gray-100">
          <div className="container py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-4 font-serif">
              {category.name}
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl font-sans">
              {category.description}
            </p>
          </div>
        </section>

        {/* Articles */}
        <section className="py-12">
          <div className="container">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : visibleArticles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-sans">No articles found in this category.</p>
                <Link href="/" className="text-sm text-[#0A1628] hover:underline mt-4 inline-block font-sans">
                  Browse all articles
                </Link>
              </div>
            ) : (
              <>
                {/* Featured first article */}
                {visibleArticles[0] && (
                  <Link href={`/article/${visibleArticles[0].slug?.current || ""}`}>
                    <article className="group cursor-pointer grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pb-12 border-b border-gray-200">
                      {visibleArticles[0].heroImageUrl && (
                        <div className="aspect-[16/10] overflow-hidden">
                          <SanityImage
                            src={visibleArticles[0].heroImageUrl}
                            alt={visibleArticles[0].title}
                            preset="categoryHero"
                            priority
                            className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      )}
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2] mb-3">
                          {category.name}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors leading-tight mb-4 font-serif">
                          {visibleArticles[0].title}
                        </h2>
                        {visibleArticles[0].excerpt && (
                          <p className="text-gray-500 leading-relaxed line-clamp-3 mb-4 font-sans">
                            {visibleArticles[0].excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-sans">
                          {visibleArticles[0].author?.name && <span>{visibleArticles[0].author.name}</span>}
                          {visibleArticles[0].publishedAt && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span>{timeAgo(visibleArticles[0].publishedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                )}

                {/* Grid of remaining articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {visibleArticles.slice(1).map((article: any) => {
                    const slug = article.slug?.current || "";
                    return (
                      <Link key={article._id} href={`/article/${slug}`}>
                        <article className="group cursor-pointer">
                          {article.heroImageUrl && (
                            <div className="aspect-[4/3] overflow-hidden mb-4">
                              <SanityImage
                                src={article.heroImageUrl}
                                alt={article.title}
                                preset="categoryCard"
                                className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>
                          )}
                          <h3 className="text-lg font-bold text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors leading-snug mb-2 font-serif">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-2 font-sans">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
                            {article.author?.name && <span>{article.author.name}</span>}
                            {article.publishedAt && (
                              <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>{timeAgo(article.publishedAt)}</span>
                              </>
                            )}
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>

                {/* Load More */}
                {visibleCount < displayArticles.length && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="inline-flex items-center gap-2 px-8 py-3 border border-gray-300 text-sm font-medium text-gray-600 hover:text-[#0A1628] hover:border-[#0A1628] transition-colors font-sans"
                    >
                      Load More
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
