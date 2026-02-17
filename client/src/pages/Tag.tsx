import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import Navigation from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { SanityImage } from "@/components/SanityImage";
import { getArticlesByTag } from "@/lib/sanity";
import { Loader2 } from "lucide-react";

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

export default function Tag() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tag, setTag] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      getArticlesByTag(slug, 50)
        .then(results => {
          setArticles(results || []);
          setTag({ name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), slug });
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch tag articles:', err);
          setIsLoading(false);
        });
    }
  }, [slug]);

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

  if (!tag) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-[#0A1628] font-serif">Tag Not Found</h1>
            <p className="text-gray-500 mb-6 font-sans">The tag you're looking for doesn't exist.</p>
            <Link href="/" className="text-sm text-[#0A1628] hover:underline font-sans">
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navigation />

      <main className="flex-1">
        {/* Tag Header */}
        <section className="bg-white border-b border-gray-100">
          <div className="container py-12 md:py-16">
            <span className="text-[11px] font-sans font-semibold tracking-widest uppercase text-[#3ECFB2] mb-3 block">
              Topic
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-3 font-serif">
              {tag.name}
            </h1>
            <p className="text-sm text-gray-400 font-sans">
              {articles?.length || 0} article{articles?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        {/* Articles */}
        <section className="py-12">
          <div className="container">
            {articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: any) => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
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
                      {article.publishedAt && (
                        <span className="text-[11px] text-gray-400 font-sans">
                          {timeAgo(article.publishedAt.toString())}
                        </span>
                      )}
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-sans">No articles found with this tag.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
