import { useParams, Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { PortableText } from "@portabletext/react";
import { Calendar, Tag, Share2, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { useState } from "react";

export function ArticlePage() {
  const { slug } = useParams();
  const { data: article, isLoading } = trpc.articles.bySlug.useQuery({ slug: slug || "" });
  const categorySlug = article?.category 
    ? (typeof article.category === 'string' 
        ? article.category 
        : (typeof article.category.slug === 'string' 
            ? article.category.slug 
            : article.category.slug.current))
    : "";
  
  const { data: relatedArticles } = trpc.articles.byCategory.useQuery(
    { categorySlug, limit: 3 },
    { enabled: !!categorySlug }
  );
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavigationNew />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavigationNew />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <Link href="/" className="text-primary hover:underline">
              Return to homepage
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article.title;

  const handleShare = (platform: string) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
    };
    
    if (platform in urls) {
      window.open(urls[platform as keyof typeof urls], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationNew />

      {/* Hero Image */}
      {article.heroImageUrl && (
        <div className="w-full h-[50vh] md:h-[60vh] bg-gray-900">
          <img
            src={article.heroImageUrl}
            alt={article.title}
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                {/* Category Badge */}
                {article.category && (
                  <div className="mb-4">
                    <Link href={`/${typeof article.category === 'string' ? article.category : (typeof article.category.slug === 'string' ? article.category.slug : article.category.slug.current)}`}>
                      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider rounded hover:bg-primary/20 transition-colors">
                        {typeof article.category === 'string' ? article.category : article.category.title}
                      </span>
                    </Link>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {article.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
                  {article.author && (
                    <div className="flex items-center gap-3">
                      {article.author.image && (
                        <img
                          src={article.author.image}
                          alt={article.author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <Link href={`/author/${typeof article.author.slug === 'string' ? article.author.slug : article.author.slug.current}`}>
                        <span className="font-medium text-gray-900 hover:text-primary transition-colors cursor-pointer">
                          By {article.author.name}
                        </span>
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time>
                      {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  
                  {/* Share Button */}
                  <div className="relative ml-auto">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                    
                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                        <button
                          onClick={() => handleShare("facebook")}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Facebook className="w-4 h-4 text-[#1877F2]" />
                          <span className="text-sm">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                          <span className="text-sm">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                          <span className="text-sm">LinkedIn</span>
                        </button>
                        <button
                          onClick={() => handleShare("email")}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">Email</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Excerpt */}
                {article.excerpt && (
                  <div className="text-xl text-gray-700 mb-8 leading-relaxed font-serif italic border-l-4 border-primary pl-6">
                    {article.excerpt}
                  </div>
                )}

                {/* Article Body */}
                {article.body && (
                  <div className="prose prose-lg max-w-none">
                    <PortableText
                      value={article.body}
                      components={{
                        block: {
                          normal: ({ children }) => (
                            <p className="mb-6 text-gray-800 leading-relaxed">{children}</p>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{children}</h3>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-6 my-8 italic text-gray-700">
                              {children}
                            </blockquote>
                          ),
                        },
                        marks: {
                          strong: ({ children }) => (
                            <strong className="font-bold text-gray-900">{children}</strong>
                          ),
                          em: ({ children }) => <em className="italic">{children}</em>,
                          link: ({ value, children }) => (
                            <a
                              href={value?.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {children}
                            </a>
                          ),
                        },
                        types: {
                          image: ({ value }) => (
                            <figure className="my-8">
                              <img
                                src={value?.asset?.url}
                                alt={value?.alt || ""}
                                className="w-full rounded-lg"
                              />
                              {value?.caption && (
                                <figcaption className="text-sm text-gray-600 mt-2 text-center">
                                  {value.caption}
                                </figcaption>
                              )}
                            </figure>
                          ),
                        },
                      }}
                    />
                  </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <Tag className="w-4 h-4 text-gray-500" />
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {typeof tag === 'string' ? tag : tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Bio */}
                {article.author && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex gap-6">
                      {article.author.image && (
                        <img
                          src={article.author.image}
                          alt={article.author.name}
                          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          About {article.author.name}
                        </h3>
                        {article.author.bio && typeof article.author.bio === 'string' && (
                          <p className="text-gray-700 leading-relaxed">{article.author.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Articles */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    Related Articles
                  </h3>
                  <div className="space-y-6">
                    {relatedArticles
                      .filter((related) => related._id !== article._id)
                      .slice(0, 3)
                      .map((related) => (
                        <Link
                          key={related._id}
                            href={`/article/${typeof related.slug === 'string' ? related.slug : related.slug.current}`}
                          className="block group"
                        >
                          <article>
                            {related.heroImageUrl && (
                              <div className="aspect-video overflow-hidden rounded-lg mb-3 bg-gray-200">
                                <img
                                  src={related.heroImageUrl}
                                  alt={related.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                              {related.title}
                            </h4>
                            {related.excerpt && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {related.excerpt}
                              </p>
                            )}
                          </article>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
