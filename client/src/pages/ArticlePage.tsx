import { Link, useParams } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { useArticleBySlug, useArticlesByCategory, useArticles } from "@/lib/sanityHooks";
import { PortableText } from "@portabletext/react";
import { Calendar, Tag, Share2, Facebook, Twitter, Linkedin, Mail, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import Lightbox from "@/components/Lightbox";

// Build Sanity image URL from asset ref when .url isn't available
function sanityImageFromRef(ref: string, width = 1200): string {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '48r6hh2o';
  const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
  const parts = ref.replace('image-', '').split('-');
  const format = parts.pop();
  const dimensions = parts.pop();
  const id = parts.join('-');
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=${width}&auto=format`;
}

function getImageUrl(value: any): string | null {
  if (value?.asset?.url) return value.asset.url;
  if (value?.asset?._ref) return sanityImageFromRef(value.asset._ref);
  return null;
}

// Auto-detect quotes from text patterns
function isQuoteBlock(block: any): boolean {
  const text = block?.children?.map((c: any) => c.text || '').join('') || '';
  const trimmed = text.trim();
  if (/^[""\u201C\u201D]/.test(trimmed)) return true;
  if (/[""\u201C].{40,}[""\u201D]\s*[-—–]/.test(trimmed)) return true;
  return false;
}

export function ArticlePage() {
  const { slug } = useParams();
  const { data: article, isLoading } = useArticleBySlug(slug || "");
  const categorySlug = article?.category 
    ? (typeof article.category === 'string' 
        ? article.category 
        : (typeof article.category.slug === 'string' 
            ? article.category.slug 
            : article.category.slug.current))
    : "";
  
  const { data: relatedArticles } = useArticlesByCategory(categorySlug, 4);
  const { data: trendingArticles } = useArticles(5);
  
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (imageUrl: string, allImages: string[]) => {
    setLightboxImages(allImages);
    setLightboxIndex(allImages.indexOf(imageUrl));
    setLightboxOpen(true);
  };

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article.title;

  const handleShare = (platform: string) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`
    };
    
    if (platform in urls) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
  };

  const articleSlug = typeof article.slug === 'string' ? article.slug : article.slug.current;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationNew />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#00BCD4]">Home</Link>
            <span>›</span>
            {article.category && (
              <>
                <Link href={`/${categorySlug}`} className="hover:text-[#00BCD4]">
                  {typeof article.category === 'string' ? article.category : article.category.title}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-gray-700 truncate max-w-xs">{article.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <div className="container mx-auto px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Article Column (2/3) */}
            <div className="lg:col-span-2">
              <article>
                {/* Hero Image — full width within column */}
                {article.heroImageUrl && (
                  <div className="mb-6">
                    <img
                      src={article.heroImageUrl}
                      alt={article.title}
                      className="w-full max-h-[500px] object-cover rounded"
                    />
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
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
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>5 min read</span>
                  </div>
                </div>

                {/* Social Sharing */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Share:</span>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Share via Email"
                  >
                    <Mail className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Article Body */}
                <div className="prose prose-lg max-w-none mb-12">
                  {article.body && (
                    <PortableText
                      value={article.body}
                      components={{
                        block: {
                          normal: ({ children, value }) => {
                            // Auto-detect quotes
                            if (isQuoteBlock(value)) {
                              return (
                                <blockquote className="border-l-4 border-[var(--triton-aqua)] pl-6 py-2 my-8 italic text-xl text-gray-700 font-serif">
                                  {children}
                                </blockquote>
                              );
                            }
                            return <p className="text-gray-800 leading-relaxed mb-6 font-serif text-lg">{children}</p>
                          },
                          h2: ({ children }) => (
                            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 font-sans">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4 font-sans">{children}</h3>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-[var(--triton-aqua)] pl-6 py-2 my-8 italic text-xl text-gray-700 font-serif">
                              {children}
                            </blockquote>
                          ),
                        },
                        types: {
                          image: ({ value }) => {
                            const imgUrl = getImageUrl(value);
                            if (!imgUrl) return null;
                            
                            // Collect all images from article body for lightbox navigation
                            const allImages = article.body
                              ?.filter((block: any) => block._type === 'image')
                              .map((block: any) => getImageUrl(block))
                              .filter(Boolean) as string[] || [];
                            
                            return (
                              <figure className="my-10">
                                <img
                                  src={imgUrl}
                                  alt={value.alt || 'Article image'}
                                  className="w-full max-h-[450px] object-contain cursor-pointer hover:opacity-90 transition-opacity rounded"
                                  loading="lazy"
                                  onClick={() => openLightbox(imgUrl, allImages)}
                                />
                                {value.caption && (
                                  <figcaption className="text-center text-sm text-gray-500 mt-3 italic font-sans">
                                    {value.caption}
                                  </figcaption>
                                )}
                              </figure>
                            );
                          },
                        },
                        marks: {
                          strong: ({ children }) => (
                            <strong className="font-bold text-gray-900">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          link: ({ children, value }) => (
                            <a
                              href={value.href}
                              className="text-[var(--triton-aqua)] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          ),
                        },
                      }}
                    />
                  )}
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mb-12">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Tags:</span>
                    {article.tags.map((tag, index) => {
                      const tagTitle = typeof tag === 'string' ? tag : tag.name;
                      return (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {tagTitle}
                        </span>
                      );
                    })}
                  </div>
                )}
              </article>
            </div>

            {/* Sidebar (1/3) */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Author Card */}
              {article.author && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    About the Author
                  </h3>
                  <div className="flex flex-col items-center text-center">
                    {article.author.image && (
                      <img
                        src={article.author.image}
                        alt={article.author.name}
                        className="w-24 h-24 rounded-full object-cover mb-4"
                      />
                    )}
                    <Link href={`/author/${typeof article.author.slug === 'string' ? article.author.slug : article.author.slug.current}`}>
                      <h4 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary transition-colors cursor-pointer">
                        {article.author.name}
                      </h4>
                    </Link>
                    {article.author.bio && (
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {article.author.bio}
                      </p>
                    )}
                    <Link href={`/author/${typeof article.author.slug === 'string' ? article.author.slug : article.author.slug.current}`}>
                      <button className="text-sm text-primary hover:underline font-medium">
                        View all articles →
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles
                      .filter(related => related._id !== article._id)
                      .slice(0, 3)
                      .map((related) => {
                        const relatedSlug = typeof related.slug === 'string' ? related.slug : related.slug.current;
                        return (
                          <Link key={related._id} href={`/article/${relatedSlug}`}>
                            <div className="group cursor-pointer">
                              {related.heroImageUrl && (
                                <div className="aspect-video overflow-hidden rounded mb-2">
                                  <img
                                    src={related.heroImageUrl}
                                    alt={related.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                {related.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(related.publishedAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Trending Articles */}
              {trendingArticles && trendingArticles.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Trending Now
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {trendingArticles.slice(0, 5).map((trending, index) => {
                      const trendingSlug = typeof trending.slug === 'string' ? trending.slug : trending.slug.current;
                      return (
                        <Link key={trending._id} href={`/article/${trendingSlug}`}>
                          <div className="group cursor-pointer flex gap-3">
                            <span className="text-2xl font-bold text-gray-200 group-hover:text-primary transition-colors">
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                {trending.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-primary to-cyan-600 rounded-lg p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-2">
                  Never Miss a Story
                </h3>
                <p className="text-sm text-white/90 mb-4">
                  Get the latest maritime news delivered to your inbox weekly
                </p>
                <Link href="/newsletter">
                  <button className="w-full bg-white text-primary py-2 px-4 rounded font-semibold hover:bg-gray-100 transition-colors">
                    Subscribe Now
                  </button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
