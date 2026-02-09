import { useState } from "react";
import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

interface CategoryPageProps {
  category: string;
  title: string;
  description: string;
}

export default function CategoryPage({ category, title, description }: CategoryPageProps) {
  // Fetch articles filtered by category
  const { data: articles = [], isLoading } = trpc.articles.byCategory.useQuery({ 
    categorySlug: category.toLowerCase(),
    limit: 50
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavigationNew />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
        {/* Page Header */}
        <section className="bg-gradient-to-r from-primary to-[#00BCD4] py-16">
          <div className="container mx-auto px-6 md:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
              {title}
            </h1>
            <p className="text-white/90 text-lg max-w-3xl">
              {description}
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-8">
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No articles found in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <Link 
                    key={article._id} 
                    href={`/article/${typeof article.slug === "string" ? article.slug : article.slug.current}`}
                  >
                    <article className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        {article.heroImageUrl ? (
                          <img
                            src={article.heroImageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-[#00BCD4]"></div>
                        )}
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                          {category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[var(--triton-aqua)] transition-colors mt-2 mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="uppercase tracking-wide">
                            BY {article.author?.name || 'TRITON STAFF'}
                          </span>
                          <span>•</span>
                          <span className="uppercase">{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
