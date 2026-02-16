import { Link } from "wouter";
import { useTrendingArticles } from "@/lib/sanityHooks";
import { TrendingUp, Eye } from "lucide-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase();
}

function formatViews(views: number | undefined): string {
  if (!views) return "0";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

interface TrendingArticlesProps {
  limit?: number;
  className?: string;
}

export default function TrendingArticles({ limit = 5, className = "" }: TrendingArticlesProps) {
  const { data: trendingArticles, isLoading } = useTrendingArticles(limit);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="p-2 bg-[#0A2342] text-white rounded">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            Trending Now
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!trendingArticles || trendingArticles.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="p-2 bg-[#0A2342] text-white rounded">
          <TrendingUp size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
          Trending Now
        </h3>
      </div>

      {/* Trending Articles List */}
      <div className="space-y-5">
        {trendingArticles.map((article, index) => {
          const slug = typeof article.slug === "string" ? article.slug : article.slug.current;
          
          return (
            <Link key={article._id} href={`/article/${slug}`}>
              <article className="group cursor-pointer">
                <div className="flex gap-4">
                  {/* Rank Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                      index === 0 
                        ? "bg-[#00BCD4] text-white" 
                        : index === 1
                        ? "bg-[#0A2342] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    {article.category && (
                      <span className="text-xs font-semibold text-[#00BCD4] uppercase tracking-wider mb-1 block">
                        {article.category.title}
                      </span>
                    )}
                    
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors leading-tight mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span className="font-medium">{formatViews(article.views)}</span>
                      </div>
                      <span>•</span>
                      <span className="uppercase">{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Divider (except for last item) */}
                {index < trendingArticles.length - 1 && (
                  <div className="mt-5 border-b border-gray-100"></div>
                )}
              </article>
            </Link>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Based on reader views over the past 30 days
        </p>
      </div>
    </div>
  );
}
