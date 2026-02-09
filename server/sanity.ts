import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '9w7gje4u',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false, // Server-side should not use CDN
});

export interface SanityArticle {
  _id: string;
  title: string;
  slug: { current: string } | string;
  excerpt?: string;
  publishedAt: string;
  heroImageUrl?: string;
  author?: {
    name: string;
    slug: { current: string } | string;
  };
  category?: {
    title: string;
    slug: { current: string } | string;
  };
  tags?: Array<{
    name: string;
    slug: { current: string } | string;
  }>;
}

export async function getArticles(limit: number = 50): Promise<SanityArticle[]> {
  try {
    const query = `
      *[_type == "article"] | order(publishedAt desc) [0...${limit}] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Server: Failed to fetch articles from Sanity:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<SanityArticle | null> {
  try {
    const query = `
      *[_type == "article" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        heroImageUrl,
        body,
        "author": author->{name, slug, image, bio},
        "category": category->{title, slug},
        "tags": tags[]->{name, slug}
      }
    `;
    const result = await sanityClient.fetch(query, { slug });
    return result || null;
  } catch (error) {
    console.error('Server: Failed to fetch article by slug:', error);
    return null;
  }
}

export async function getArticlesByCategory(categorySlug: string, limit: number = 20): Promise<SanityArticle[]> {
  try {
    const query = `
      *[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) [0...${limit}] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `;
    const results = await sanityClient.fetch(query, { categorySlug });
    return results || [];
  } catch (error) {
    console.error('Server: Failed to fetch articles by category:', error);
    return [];
  }
}

export async function searchArticles(searchQuery: string, limit: number = 20): Promise<SanityArticle[]> {
  try {
    const query = `
      *[_type == "article" && (
        title match $searchQuery ||
        excerpt match $searchQuery
      )] | order(publishedAt desc) [0...${limit}] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `;
    const results = await sanityClient.fetch(query, { searchQuery: `*${searchQuery}*` });
    return results || [];
  } catch (error) {
    console.error('Server: Failed to search articles:', error);
    return [];
  }
}
