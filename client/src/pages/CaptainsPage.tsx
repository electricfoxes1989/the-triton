import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import BannerAd from "@/components/BannerAd";
import { useArticlesByCategory } from "@/lib/sanityHooks";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

function FeaturedCard({ article }: { article: any }) {
  const slug = typeof article.slug === "string" ? article.slug : article.slug.current;
  return (
    <Link href={`/article/${slug}`}>
      <article className="group cursor-pointer">
        <div className="overflow-hidden mb-4 bg-gray-100">
          {article.heroImageUrl ? (
            <img
              src={article.heroImageUrl}
              alt={article.title}
              className="w-full h-[350px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-[350px] bg-gray-200"></div>
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors mb-3 leading-tight">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-gray-600 leading-relaxed mb-3 line-clamp-3">{article.excerpt}</p>
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

function Section({ title, articles, showMore }: { title: string; articles: any[]; showMore?: string }) {
  if (!articles || articles.length === 0) return null;
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <section className="py-12 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#0A2342]">
          {title}
          <div className="h-1 w-20 bg-[#00BCD4] mt-2"></div>
        </h2>
        {showMore && (
          <Link href={showMore} className="text-sm text-[#00BCD4] font-semibold uppercase tracking-wide hover:underline">
            View All →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FeaturedCard article={featured} />
        </div>
        <div className="space-y-6">
          {rest.map((article: any) => (
            <Link key={article._id} href={`/article/${typeof article.slug === "string" ? article.slug : article.slug.current}`}>
              <article className="group cursor-pointer flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                <div className="w-[100px] h-[70px] flex-shrink-0 overflow-hidden bg-gray-100">
                  {article.heroImageUrl ? (
                    <img src={article.heroImageUrl} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors line-clamp-2 leading-tight">
                    {article.title}
                  </h4>
                  <span className="text-xs text-gray-500 mt-1 block">{formatDate(article.publishedAt)}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CaptainsPage() {
  const { data: captainsArticles = [], isLoading: loadingCaptains } = useArticlesByCategory("captains", 20);
  const { data: crewLifeArticles = [], isLoading: loadingCrew } = useArticlesByCategory("crew-life", 10);
  const { data: destinationsArticles = [], isLoading: loadingDest } = useArticlesByCategory("destinations", 10);

  const isLoading = loadingCaptains || loadingCrew || loadingDest;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavigationNew />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationNew />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-6 md:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#00BCD4]">Home</Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">Captains</span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-6 md:px-8 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-[#0A2342] border-b-2 border-[#0A2342] pb-3 inline-block">
            Captains
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Expert insights, technical guidance, and professional advice from experienced superyacht captains.
          </p>
        </div>

        {/* Banner Ad */}
        <div className="container mx-auto px-6 md:px-8 py-4">
          <BannerAd page="captains" position="content-top" className="w-full h-24" />
        </div>

        <div className="container mx-auto px-6 md:px-8">
          <Section
            title="Captains"
            articles={captainsArticles.slice(0, 7)}
            showMore="/category/captains"
          />

          <Section
            title="Crew Life"
            articles={crewLifeArticles.slice(0, 7)}
            showMore="/crew-life"
          />

          <Section
            title="Destinations"
            articles={destinationsArticles.slice(0, 7)}
            showMore="/category/destinations"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
