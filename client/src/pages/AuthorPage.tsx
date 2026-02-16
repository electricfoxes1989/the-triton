import { useParams, Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { useAuthorBySlug, useArticlesByAuthor } from "@/lib/sanityHooks";
import { Twitter, Linkedin, Mail, Globe, Calendar } from "lucide-react";

export function AuthorPage() {
  const { slug } = useParams();
  const { data: author, isLoading: authorLoading } = useAuthorBySlug(slug || "");
  const { data: articles, isLoading: articlesLoading } = useArticlesByAuthor(slug || "");

  if (authorLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNew />
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-32 w-32 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNew />
        <div className="container mx-auto px-6 md:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Author Not Found</h1>
          <p className="text-gray-600 mb-8">The author you're looking for doesn't exist.</p>
          <Link href="/">
            <a className="text-primary hover:underline">Return to Homepage</a>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const authorSlug = typeof author.slug === 'string' ? author.slug : author.slug.current;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNew />

      {/* Author Profile Header */}
      <div className="bg-gradient-to-br from-primary to-cyan-600 py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Author Image */}
            {author.image && (
              <div className="mb-6">
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                />
              </div>
            )}

            {/* Author Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {author.name}
            </h1>

            {/* Author Bio */}
            {author.bio && (
              <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
                {author.bio}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4">
              {author.twitter && (
                <a
                  href={author.twitter.startsWith('http') ? author.twitter : `https://twitter.com/${author.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
              )}
              {author.linkedin && (
                <a
                  href={author.linkedin.startsWith('http') ? author.linkedin : `https://linkedin.com/in/${author.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              )}
              {author.email && (
                <a
                  href={`mailto:${author.email}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email</span>
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="container mx-auto px-6 md:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Articles by {author.name}
          </h2>
          <p className="text-gray-600">
            {articles?.length || 0} {articles?.length === 1 ? 'article' : 'articles'} published
          </p>
        </div>

        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const articleSlug = typeof article.slug === 'string' ? article.slug : article.slug.current;
              return (
                <Link key={article._id} href={`/article/${articleSlug}`}>
                  <article className="group cursor-pointer">
                    {/* Article Image */}
                    {article.heroImageUrl && (
                      <div className="aspect-video overflow-hidden rounded-lg mb-4">
                        <img
                          src={article.heroImageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Category Badge */}
                    {article.category && (
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded">
                          {typeof article.category === 'string' ? article.category : article.category.title}
                        </span>
                      </div>
                    )}

                    {/* Article Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Publish Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={article.publishedAt}>
                        {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </time>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No articles published yet.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
