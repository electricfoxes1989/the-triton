import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useSearchArticles } from "@/lib/sanityHooks";
import { Search, X, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch search results
  const { data: results, isLoading } = useSearchArticles(debouncedQuery);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleResultClick = () => {
    setQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search articles by keywords, authors, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 text-lg border-0 focus:outline-none focus:ring-0"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Loading State */}
          {isLoading && debouncedQuery.length >= 2 && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          )}

          {/* Empty State - No Query */}
          {!query && (
            <div className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Search Articles
              </h3>
              <p className="text-gray-600">
                Start typing to search for articles, authors, or topics
              </p>
            </div>
          )}

          {/* Empty State - Query Too Short */}
          {query && query.length < 2 && (
            <div className="p-12 text-center">
              <p className="text-gray-600">
                Type at least 2 characters to search
              </p>
            </div>
          )}

          {/* Empty State - No Results */}
          {!isLoading && debouncedQuery.length >= 2 && results && results.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results && results.length > 0 && (
            <div className="py-2">
              {results.map((article) => {
                const articleSlug = typeof article.slug === 'string' ? article.slug : article.slug.current;
                return (
                  <Link
                    key={article._id}
                    href={`/article/${articleSlug}`}
                    onClick={handleResultClick}
                  >
                    <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-b-0">
                      <div className="flex gap-4">
                        {/* Article Thumbnail */}
                        {article.heroImageUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={article.heroImageUrl}
                              alt={article.title}
                              className="w-24 h-24 object-cover rounded"
                            />
                          </div>
                        )}

                        {/* Article Info */}
                        <div className="flex-1 min-w-0">
                          {/* Category Badge */}
                          {article.category && (
                            <div className="mb-2">
                              <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded">
                                {typeof article.category === 'string' ? article.category : article.category.title}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>

                          {/* Excerpt */}
                          {article.excerpt && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {article.author && (
                              <span>By {article.author.name}</span>
                            )}
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        {query && (
          <div className="px-6 py-3 border-t bg-gray-50 text-xs text-gray-500 text-center">
            Press <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd> to close
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
