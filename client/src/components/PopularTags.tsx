import { useState, useEffect } from "react";
import { Link } from "wouter";
import { getPopularTags } from "@/lib/sanity";
import { TrendingUp } from "lucide-react";

interface Topic {
  _id: string;
  title: string;
  slug: { current: string };
  articleCount: number;
  kind: "tag" | "category";
}

interface PopularTagsProps {
  /** Render as a compact sidebar widget or a wider inline section */
  variant?: "sidebar" | "inline";
  /** Maximum number of topics to display */
  limit?: number;
  /** Optional title override */
  title?: string;
}

export default function PopularTags({
  variant = "sidebar",
  limit = 12,
  title = "Topics",
}: PopularTagsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPopularTags(limit)
      .then(results => {
        const formatted = results.map((tag: any) => ({
          _id: tag._id,
          title: tag.name,
          slug: { current: tag.slug.current || tag.slug },
          articleCount: tag.articleCount || 0,
          kind: 'tag' as const,
        }));
        setTopics(formatted);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch popular tags:', err);
        setIsLoading(false);
      });
  }, [limit]);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!topics || topics.length === 0) return null;

  const displayed = (topics as Topic[]).slice(0, limit);

  // Find max article count for relative sizing
  const maxCount = Math.max(...displayed.map((t) => t.articleCount), 1);

  if (variant === "inline") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-5 sm:mb-6">
          <TrendingUp className="h-4 w-4 text-[#3ECFB2]" />
          <h3 className="text-[11px] font-sans font-semibold tracking-widest uppercase text-gray-400">
            {title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {displayed.map((topic) => {
            const href = topic.kind === "category"
              ? `/category/${topic.slug.current}`
              : `/tag/${topic.slug.current}`;

            // Scale opacity based on popularity
            const intensity = 0.4 + (topic.articleCount / maxCount) * 0.6;

            return (
              <Link
                key={topic._id}
                href={href}
                className="group inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 hover:border-[#0A1628] transition-all duration-200 rounded-sm"
              >
                <span
                  className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-[#0A1628] transition-colors font-sans"
                  style={{ opacity: intensity }}
                >
                  {topic.title}
                </span>
                {topic.articleCount > 0 && (
                  <span className="text-[10px] text-gray-300 font-sans tabular-nums">
                    {topic.articleCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Sidebar variant — compact, vertical-friendly
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <TrendingUp className="h-3.5 w-3.5 text-[#3ECFB2]" />
        <h3 className="text-[11px] font-sans font-semibold tracking-widest uppercase text-gray-400">
          {title}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {displayed.map((topic) => {
          const href = topic.kind === "category"
            ? `/category/${topic.slug.current}`
            : `/tag/${topic.slug.current}`;

          const isPopular = topic.articleCount >= maxCount * 0.5;

          return (
            <Link
              key={topic._id}
              href={href}
              className={`group inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 transition-all duration-200 rounded-sm ${
                isPopular
                  ? "bg-[#0A1628]/5 border border-[#0A1628]/10 hover:bg-[#0A1628]/10 hover:border-[#0A1628]/20"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`text-xs font-medium transition-colors font-sans ${
                  isPopular
                    ? "text-[#0A1628] group-hover:text-[#0A1628]"
                    : "text-gray-500 group-hover:text-[#0A1628]"
                }`}
              >
                {topic.title}
              </span>
              {topic.articleCount > 0 && (
                <span className="text-[10px] text-gray-300 font-sans tabular-nums">
                  {topic.articleCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
