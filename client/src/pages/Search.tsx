import { useState, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SanityImage } from "@/components/SanityImage";
import { searchArticles } from "@/lib/sanity";
import { Loader2, Search as SearchIcon } from "lucide-react";

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

export default function Search() {
  const searchParams = new URLSearchParams(useSearch());
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [, navigate] = useLocation();

  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery.length > 0) {
      setIsLoading(true);
      searchArticles(initialQuery)
        .then(results => {
          setArticles(results || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Search error:', err);
          setArticles([]);
          setIsLoading(false);
        });
    } else {
      setArticles([]);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navigation />

      <main className="flex-1">
        {/* Search Header */}
        <section className="bg-white border-b border-gray-100">
          <div className="container py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-6 font-serif">
              Search
            </h1>
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="flex items-center gap-3 border-b-2 border-[#0A1628] pb-3">
                <SearchIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-xl bg-transparent border-0 outline-none placeholder-gray-300 text-[#0A1628] font-sans"
                  autoFocus
                />
              </div>
            </form>
            {initialQuery && !isLoading && (
              <p className="mt-4 text-sm text-gray-400 font-sans">
                {articles.length} result{articles.length !== 1 ? "s" : ""} for "{initialQuery}"
              </p>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="py-10">
          <div className="container">
            {!initialQuery ? (
              <div className="text-center py-20">
                <SearchIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-sans">Enter a search term to find articles</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : articles.length > 0 ? (
              <div className="space-y-0">
                {articles.map((article: any) => {
                  const slug = article.slug?.current || article.slug || "";
                  const image = article.heroImageUrl || "";
                  const date = article.publishedAt ? timeAgo(article.publishedAt) : "";
                  const category = article.category?.title || "";

                  return (
                    <Link key={article._id || article.id} href={`/article/${slug}`}>
                      <article className="group cursor-pointer flex gap-6 py-6 border-b border-gray-100">
                        {image && (
                          <div className="flex-shrink-0 w-40 h-28 overflow-hidden">
                            <SanityImage
                              src={image}
                              alt={article.title}
                              preset="thumbnail"
                              className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                              sizes="160px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {category && (
                            <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2]">
                              {category}
                            </span>
                          )}
                          <h2 className="text-lg font-bold text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors leading-snug mt-1 mb-2 font-serif">
                            {article.title}
                          </h2>
                          {article.excerpt && (
                            <p className="text-gray-500 text-sm line-clamp-2 mb-2 font-sans">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
                            {article.author?.name && <span>{article.author.name}</span>}
                            {date && (
                              <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>{date}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-sans">No articles found for "{initialQuery}"</p>
                <p className="text-gray-300 text-sm mt-2 font-sans">Try different keywords or check your spelling</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
