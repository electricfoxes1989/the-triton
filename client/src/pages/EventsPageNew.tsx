import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { useArticlesByCategory } from "@/lib/sanityHooks";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

function ArticleGrid({ articles }: { articles: any[] }) {
  if (!articles || articles.length === 0) {
    return <p className="text-gray-500 text-sm italic">No articles yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article: any) => {
        const slug = typeof article.slug === "string" ? article.slug : article.slug.current;
        return (
          <Link key={article._id} href={`/article/${slug}`}>
            <article className="group cursor-pointer">
              <div className="aspect-video overflow-hidden mb-3 bg-gray-100">
                {article.heroImageUrl ? (
                  <img
                    src={article.heroImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#00BCD4] transition-colors mb-2 line-clamp-2 leading-tight">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>
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
      })}
    </div>
  );
}

function Section({ title, id, articles }: { title: string; id: string; articles: any[] }) {
  return (
    <section id={id} className="py-12 border-b border-gray-200 last:border-b-0">
      <h2 className="text-2xl font-bold text-[#0A2342] mb-8">
        {title}
        <div className="h-1 w-20 bg-[#00BCD4] mt-2"></div>
      </h2>
      <ArticleGrid articles={articles} />
    </section>
  );
}

export default function EventsPageNew() {
  const { data: eventsArticles = [], isLoading: loadingEvents } = useArticlesByCategory('events', 20);
  const { data: galleriesArticles = [], isLoading: loadingGalleries } = useArticlesByCategory('galleries', 20);
  const { data: exposArticles = [], isLoading: loadingExpos } = useArticlesByCategory('expos', 20);

  const isLoading = loadingEvents || loadingGalleries || loadingExpos;

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
              <span className="text-gray-900 font-medium">Events</span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-6 md:px-8 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-[#0A2342] border-b-2 border-[#0A2342] pb-3 inline-block">
            Events
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Coverage from boat shows, industry expos, and photo galleries from across the yachting world.
          </p>

          {/* Jump links */}
          <div className="flex gap-6 mt-6 text-sm font-semibold uppercase tracking-wide">
            <a href="#events" className="text-[#00BCD4] hover:underline">Events</a>
            <a href="#galleries" className="text-[#00BCD4] hover:underline">Galleries</a>
            <a href="#expos" className="text-[#00BCD4] hover:underline">Expos</a>
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-8">
          <Section title="Events" id="events" articles={eventsArticles} />
          <Section title="Galleries" id="galleries" articles={galleriesArticles} />
          <Section title="Expos" id="expos" articles={exposArticles} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
