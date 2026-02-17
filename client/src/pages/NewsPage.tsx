import { useState } from "react";
import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import BannerAd from "@/components/BannerAd";
import TrendingArticles from "@/components/TrendingArticles";
import { useArticlesByCategory } from "@/lib/sanityHooks";
import { ArrowRight } from "lucide-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

function ArticleCard({ article }: { article: any }) {
  const slug = typeof article.slug === "string" ? article.slug : article.slug.current;

  return (
    <Link href={`/article/${slug}`}>
      <article className="group cursor-pointer border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
        <div className="flex gap-6">
          {/* Image */}
          <div className="w-[200px] h-[140px] flex-shrink-0 overflow-hidden bg-gray-100">
            {article.heroImageUrl ? (
              <img
                src={article.heroImageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            {article.category && (
              <span className="text-xs font-bold text-[#00BCD4] uppercase tracking-wider">
                {article.category.title}
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors mt-1 mb-2 leading-tight line-clamp-2">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-2">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatDate(article.publishedAt)}</span>
              {article.author?.name && (
                <>
                  <span>•</span>
                  <span>By {article.author.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedCard({ article }: { article: any }) {
  const slug = typeof article.slug === "string" ? article.slug : article.slug.current;

  return (
    <Link href={`/article/${slug}`}>
      <article className="group cursor-pointer mb-8">
        <div className="overflow-hidden bg-gray-100 mb-4">
          {article.heroImageUrl ? (
            <img
              src={article.heroImageUrl}
              alt={article.title}
              className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-[300px] bg-gray-200"></div>
          )}
        </div>
        {article.category && (
          <span className="text-xs font-bold text-[#00BCD4] uppercase tracking-wider">
            {article.category.title}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors mt-1 mb-3 leading-tight">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-gray-600 leading-relaxed mb-3 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatDate(article.publishedAt)}</span>
          {article.author?.name && (
            <>
              <span>•</span>
              <span>By {article.author.name}</span>
            </>
          )}
        </div>
      </article>
    </Link>
  );
}

export default function NewsPage() {
  const { data: allArticles = [], isLoading } = useArticlesByCategory('news', 50);
  const [showCount, setShowCount] = useState(10);

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

  const featured = allArticles[0];
  const rest = allArticles.slice(1, showCount);
  const hasMore = allArticles.length > showCount;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationNew />

      <main className="flex-1">
        {/* Simple page header — matching original Triton */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-6 md:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#00BCD4]">Home</Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">News</span>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="container mx-auto px-6 md:px-8 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-[#0A2342] border-b-2 border-[#0A2342] pb-3 inline-block">
            News
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Breaking news and updates from the superyacht and yachting industry worldwide.
          </p>
        </div>

        {/* Banner Ad */}
        <div className="container mx-auto px-6 md:px-8 py-4">
          <BannerAd 
            page="news" 
            position="content-top" 
            className="w-full h-24"
          />
        </div>

        {/* Main content: Articles + Sidebar */}
        <div className="container mx-auto px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Column */}
            <div className="lg:col-span-2">
              {/* Featured Article */}
              {featured && <FeaturedCard article={featured} />}

              {/* Article List */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-[#0A2342] uppercase tracking-wide mb-6">Recent Headlines</h2>
                {rest.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
                {hasMore && (
                  <div className="text-center pt-8">
                    <button
                      onClick={() => setShowCount(prev => prev + 10)}
                      className="px-8 py-3 bg-[#0A2342] text-white font-semibold uppercase tracking-wide text-sm hover:bg-[#00BCD4] transition-colors"
                    >
                      Load More Articles
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Trending */}
              <TrendingArticles limit={5} />

              {/* Events Calendar placeholder */}
              <div className="border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-[#0A2342] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                  Events Calendar
                </h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>

              {/* Banner Ad */}
              <BannerAd 
                page="news" 
                position="sidebar" 
                className="w-full"
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
