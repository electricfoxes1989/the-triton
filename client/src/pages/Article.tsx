import { useParams, Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PopularTags from "@/components/PopularTags";
import { SanityImage } from "@/components/SanityImage";
import PortableTextRenderer, { portableTextToPlainText, portableTextWordCount } from "@/components/PortableText";
import { sanityPreset } from "@/lib/sanityImage";
import { getArticleBySlug, getRelatedArticles } from "@/lib/sanity";
import { format } from "date-fns";
import { Loader2, Clock, ArrowLeft, Facebook, Linkedin, Twitter, Mail } from "lucide-react";
import { useEffect, useState } from "react";

interface SanityArticle {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  body: any;
  publishedAt: string;
  heroImageUrl: string;
  category: { _id: string; title: string; slug: { current: string } } | null;
  author: { _id: string; name: string; bio: string; image: any } | null;
  tags: Array<{ _id: string; title: string; slug: { current: string } }> | null;
}

export default function Article() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const [readingProgress, setReadingProgress] = useState(0);

  const [sanityArticle, setSanityArticle] = useState<SanityArticle | null>(null);
  const [sanityRelated, setSanityRelated] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      getArticleBySlug(slug)
        .then(article => {
          setSanityArticle(article);
          if (article?.tags) {
            return getRelatedArticles(article._id, article.tags, 4);
          }
          return [];
        })
        .then(related => {
          setSanityRelated(related || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch article:', err);
          setIsLoading(false);
        });
    }
  }, [slug]);

  const dbArticle: any = null;
  const dbAuthor: any = null;
  const dbRelated: any = null;
  const dbTags: any = null;

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const article = sanityArticle ? {
    title: sanityArticle.title,
    excerpt: sanityArticle.excerpt || "",
    body: sanityArticle.body,
    heroImageUrl: sanityArticle.heroImageUrl || "",
    publishedAt: sanityArticle.publishedAt,
    categoryName: sanityArticle.category?.title || "",
    categorySlug: sanityArticle.category?.slug?.current || "",
    authorName: sanityArticle.author?.name || "",
    authorBio: sanityArticle.author?.bio || "",
    tags: sanityArticle.tags?.map(t => ({ name: t.title, slug: t.slug.current })) || [],
    readingTimeMinutes: Math.ceil(portableTextWordCount(sanityArticle.body) / 200),
  } : dbArticle ? {
    title: dbArticle.title,
    excerpt: dbArticle.excerpt || "",
    body: dbArticle.content,
    heroImageUrl: dbArticle.heroImageUrl || "",
    publishedAt: dbArticle.publishedAt ? new Date(dbArticle.publishedAt).toISOString() : null,
    categoryName: "",
    categorySlug: "",
    authorName: dbAuthor?.name || "",
    authorBio: dbAuthor?.bio || "",
    tags: dbTags?.map((t: any) => ({ name: t.name, slug: t.slug })) || [],
    readingTimeMinutes: dbArticle.readingTimeMinutes || Math.ceil(dbArticle.content.split(/\s+/).length / 200),
  } : null;

  const relatedArticles = sanityRelated
    ? sanityRelated
        .filter((a: SanityArticle) => a.slug.current !== slug)
        .slice(0, 3)
        .map((a: SanityArticle) => ({
          slug: a.slug.current,
          title: a.title,
          excerpt: a.excerpt,
          heroImageUrl: a.heroImageUrl,
          publishedAt: a.publishedAt,
          categoryName: a.category?.title || "",
        }))
    : dbRelated?.map((a: any) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || "",
        heroImageUrl: a.heroImageUrl || "",
        publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : null,
        categoryName: "",
      })) || [];

  // SEO meta tags
  useEffect(() => {
    if (!article) return;

    document.title = `${article.title} | The Triton`;
    document.querySelectorAll('[data-seo]').forEach(el => el.remove());

    const head = document.head;
    const currentUrl = window.location.href;

    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = currentUrl;
    canonical.setAttribute('data-seo', 'true');
    head.appendChild(canonical);

    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = article.excerpt || article.title;
    metaDesc.setAttribute('data-seo', 'true');
    head.appendChild(metaDesc);

    const ogTags: Record<string, string> = {
      'og:title': article.title,
      'og:description': article.excerpt || article.title,
      'og:type': 'article',
      'og:url': currentUrl,
      'og:site_name': 'The Triton',
      'og:locale': 'en_US',
    };
    if (article.heroImageUrl) ogTags['og:image'] = article.heroImageUrl;
    if (article.publishedAt) ogTags['article:published_time'] = article.publishedAt;
    if (article.authorName) ogTags['article:author'] = article.authorName;
    if (article.categoryName) ogTags['article:section'] = article.categoryName;

    Object.entries(ogTags).forEach(([prop, content]) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', prop);
      meta.content = content;
      meta.setAttribute('data-seo', 'true');
      head.appendChild(meta);
    });

    const twitterTags: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': article.title,
      'twitter:description': article.excerpt || article.title,
    };
    if (article.heroImageUrl) twitterTags['twitter:image'] = article.heroImageUrl;

    Object.entries(twitterTags).forEach(([name, content]) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      meta.setAttribute('data-seo', 'true');
      head.appendChild(meta);
    });

    const plainText = portableTextToPlainText(article.body);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt || article.title,
      url: currentUrl,
      datePublished: article.publishedAt || undefined,
      dateModified: article.publishedAt || undefined,
      image: article.heroImageUrl || undefined,
      author: article.authorName ? { '@type': 'Person', name: article.authorName } : undefined,
      publisher: {
        '@type': 'Organization',
        name: 'The Triton',
        logo: { '@type': 'ImageObject', url: 'https://www.the-triton.com/wp-content/uploads/2023/01/triton-logo.png' },
      },
      articleSection: article.categoryName || undefined,
      wordCount: plainText ? plainText.split(/\s+/).filter(Boolean).length : undefined,
      mainEntityOfPage: { '@type': 'WebPage', '@id': currentUrl },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    script.setAttribute('data-seo', 'true');
    head.appendChild(script);

    return () => {
      document.querySelectorAll('[data-seo]').forEach(el => el.remove());
      document.title = 'The Triton | Nautical News for Yacht Captains and Crews';
    };
  }, [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-[#0A1628] font-serif">Article Not Found</h1>
            <p className="text-gray-500 mb-6 font-sans text-sm sm:text-base">The article you're looking for doesn't exist.</p>
            <Link href="/" className="text-sm font-medium text-[#0A1628] hover:underline font-sans">
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "MMMM d, yyyy")
    : null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 z-50 h-[2px]"
        style={{
          width: `${readingProgress}%`,
          backgroundColor: "#3ECFB2",
          transition: "width 0.1s ease-out",
        }}
      />

      <Navigation />

      <main className="flex-1">
        {/* Article Header */}
        <div className="bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 md:pt-16">
            {/* Back link */}
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0A1628] transition-colors mb-5 sm:mb-8 font-sans">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            {/* Category */}
            {article.categoryName && (
              <Link
                href={`/category/${article.categorySlug}`}
                className="inline-block text-[10px] sm:text-[11px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2] hover:text-[#3ECFB2]/80 transition-colors mb-3 sm:mb-4"
              >
                {article.categoryName}
              </Link>
            )}

            {/* Title — scales down on mobile */}
            <h1 className="text-[1.625rem] leading-[1.2] sm:text-3xl md:text-[42px] font-bold sm:leading-[1.15] md:leading-[1.15] text-[#0A1628] mb-4 sm:mb-5 font-serif">
              {article.title}
            </h1>

            {/* Excerpt — slightly smaller on mobile */}
            {article.excerpt && (
              <p className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed mb-5 sm:mb-6 font-sans">
                {article.excerpt}
              </p>
            )}

            {/* Meta bar — stacks better on mobile */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-400 pb-6 sm:pb-8 border-b border-gray-100 font-sans">
              {article.authorName && (
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0A1628] flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold flex-shrink-0">
                    {article.authorName.charAt(0)}
                  </div>
                  <span className="text-[#0A1628] font-medium text-sm">{article.authorName}</span>
                </span>
              )}
              {formattedDate && (
                <span className="text-sm">{formattedDate}</span>
              )}
              {article.readingTimeMinutes > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readingTimeMinutes} min read
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hero Image — responsive aspect ratio */}
        {article.heroImageUrl && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
            <SanityImage
              src={article.heroImageUrl}
              alt={article.title}
              preset="heroArticle"
              priority
              className="w-full rounded-sm"
              sizes="(max-width: 768px) 100vw, 896px"
              aspectRatio="16/9"
            />
          </div>
        )}

        {/* Article Body — responsive padding and typography */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-12">
          <PortableTextRenderer content={article.body} />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
              <span className="text-[11px] font-sans font-semibold tracking-widest uppercase text-gray-400 block mb-3 sm:mb-4">
                Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: { name: string; slug: string }, i: number) => (
                  <Link
                    key={i}
                    href={`/tag/${tag.slug}`}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 border border-gray-200 text-gray-500 hover:text-[#0A1628] hover:border-[#0A1628] transition-colors font-sans"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-100">
            <span className="text-[11px] font-sans font-semibold tracking-widest uppercase text-gray-400 block mb-3 sm:mb-4">
              Share
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, label: "Facebook" },
                { icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`, label: "Twitter" },
                { icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, label: "LinkedIn" },
                { icon: Mail, href: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareUrl)}`, label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={label !== "Email" ? "_blank" : undefined}
                  rel={label !== "Email" ? "noopener noreferrer" : undefined}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-[#0A1628] hover:border-[#0A1628] transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          {article.authorName && (
            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 font-serif">
                  {article.authorName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#0A1628] font-serif text-sm sm:text-base">{article.authorName}</p>
                  {article.authorBio && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed font-sans">{article.authorBio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Articles — responsive grid */}
        {relatedArticles.length > 0 && (
          <section className="bg-[#FAFAFA] py-10 sm:py-14">
            <div className="container">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A1628] mb-6 sm:mb-8 font-serif">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedArticles.map((related: any, i: number) => (
                  <Link key={i} href={`/article/${related.slug}`}>
                    <article className="group cursor-pointer">
                      {related.heroImageUrl && (
                        <div className="aspect-[4/3] overflow-hidden mb-3 sm:mb-4">
                          <SanityImage
                            src={related.heroImageUrl}
                            alt={related.title}
                            preset="related"
                            className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      {related.categoryName && (
                        <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2]">
                          {related.categoryName}
                        </span>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-[#0A1628] group-hover:text-[#0A1628]/70 transition-colors line-clamp-2 mt-1.5 font-serif">
                        {related.title}
                      </h3>
                      {related.publishedAt && (
                        <p className="text-gray-400 text-xs mt-2 font-sans">
                          {format(new Date(related.publishedAt), "MMMM d, yyyy")}
                        </p>
                      )}
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Explore Topics — after related articles */}
        <section className="bg-white py-10 sm:py-14 border-t border-gray-100">
          <div className="container">
            <PopularTags variant="inline" limit={16} title="Explore Topics" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
