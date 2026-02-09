import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { PortableText } from "@portabletext/react";
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug || "";
  
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Fetch article by slug
  const { data: article, isLoading } = trpc.articles.bySlug.useQuery({ slug });
  
  // Fetch related articles (same category)
  const categorySlug = article?.category?.slug 
    ? (typeof article.category.slug === 'string' ? article.category.slug : article.category.slug.current)
    : "";
  
  const { data: relatedArticles = [] } = trpc.articles.byCategory.useQuery(
    { 
      categorySlug,
      limit: 4
    },
    { enabled: !!article?.category && !!categorySlug }
  );

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Share functions
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article?.title || "";

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, "_blank");
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationNew />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationNew />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Link href="/" className="text-primary hover-aqua">← Back to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredRelated = relatedArticles.filter(a => a._id !== article._id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationNew />
      
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[#00CED1] z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative w-full h-[60vh] bg-gray-200">
          {article.heroImageUrl ? (
            <img
              src={article.heroImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#0066cc] flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{article.title}</span>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Category Badge */}
              {article.category && (
                <Link 
                  href={`/category/${typeof article.category.slug === 'string' ? article.category.slug : article.category.slug?.current}`}
                  className="inline-block bg-[#00CED1] text-white px-4 py-1 text-xs uppercase tracking-wider font-semibold mb-4 hover:bg-[#00b8bb] transition-colors"
                >
                  {article.category.title}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-5xl font-bold mb-6 leading-tight text-gray-900">
                {article.title}
              </h1>

              {/* Author & Date */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">
                    {article.author?.name || "Triton Staff"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </div>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-xl text-gray-700 mb-8 leading-relaxed font-serif italic border-l-4 border-[#00CED1] pl-6">
                  {article.excerpt}
                </p>
              )}

              {/* Article Body */}
              <div className="prose prose-lg max-w-none mb-12">
                {article.body ? (
                  <PortableText 
                    value={article.body}
                    components={{
                      block: {
                        normal: ({ children }) => (
                          <p className="mb-6 text-lg leading-relaxed text-gray-800 font-serif">
                            {children}
                          </p>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900">
                            {children}
                          </h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-[#00CED1] pl-6 my-8 italic text-xl text-gray-700">
                            {children}
                          </blockquote>
                        ),
                      },
                      marks: {
                        strong: ({ children }) => (
                          <strong className="font-bold text-gray-900">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        link: ({ value, children }) => (
                          <a 
                            href={value?.href} 
                            className="text-[#00CED1] hover:text-[#00b8bb] underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-600 italic">Article content not available.</p>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-600 mb-4">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: any) => (
                      <Link
                        key={tag.name}
                        href={`/tag/${typeof tag.slug === 'string' ? tag.slug : tag.slug?.current}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-[#00CED1] hover:text-white transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="border-t border-b border-gray-200 py-6 mb-12">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-600 mb-4">Share This Article</h3>
                <div className="flex gap-4">
                  <button
                    onClick={shareOnTwitter}
                    className="p-3 bg-gray-100 hover:bg-[#1DA1F2] hover:text-white transition-colors rounded-full"
                    aria-label="Share on Twitter"
                  >
                    <Twitter size={20} />
                  </button>
                  <button
                    onClick={shareOnFacebook}
                    className="p-3 bg-gray-100 hover:bg-[#4267B2] hover:text-white transition-colors rounded-full"
                    aria-label="Share on Facebook"
                  >
                    <Facebook size={20} />
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="p-3 bg-gray-100 hover:bg-[#0077B5] hover:text-white transition-colors rounded-full"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin size={20} />
                  </button>
                  <button
                    onClick={copyLink}
                    className="p-3 bg-gray-100 hover:bg-[#00CED1] hover:text-white transition-colors rounded-full"
                    aria-label="Copy link"
                  >
                    <LinkIcon size={20} />
                  </button>
                </div>
              </div>

              {/* Author Bio */}
              {article.author && (
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-4">About the Author</h3>
                  <div className="flex gap-6">
                    {article.author.image && (
                      <img
                        src={article.author.image}
                        alt={article.author.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="text-xl font-bold mb-2">{article.author.name}</h4>
                      {article.author.bio && (
                        <p className="text-gray-700 leading-relaxed">{article.author.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Related Articles */}
                {filteredRelated.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 pb-3 border-b-4 border-[#00CED1]">
                      Related Articles
                    </h3>
                    <div className="space-y-6">
                      {filteredRelated.map((related: any) => (
                        <Link
                          key={related._id}
                          href={`/article/${typeof related.slug === 'string' ? related.slug : related.slug?.current}`}
                          className="block group"
                        >
                          {related.heroImageUrl && (
                            <img
                              src={related.heroImageUrl}
                              alt={related.title}
                              className="w-full h-40 object-cover mb-3 group-hover:opacity-80 transition-opacity"
                            />
                          )}
                          <h4 className="font-bold text-lg mb-2 group-hover:text-[#00CED1] transition-colors">
                            {related.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(related.publishedAt)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter Signup */}
                <div className="bg-[#00CED1] text-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
                  <p className="mb-6">Get the latest yachting news delivered to your inbox.</p>
                  <Link
                    href="/newsletter"
                    className="block w-full bg-white text-[#00CED1] text-center py-3 px-6 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Subscribe Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
