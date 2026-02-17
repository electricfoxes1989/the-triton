import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '48r6hh2o',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: true, // Public read access, no token needed
  apiVersion: '2024-01-01',
  perspective: 'published',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Responsive image URL generator with presets
export function sanityImageUrl(
  source: any,
  preset: 'heroLarge' | 'heroMedium' | 'thumbnail' | 'card' | 'full' = 'full'
) {
  if (!source) return '';
  
  const base = builder.image(source).auto('format').quality(85);
  
  switch (preset) {
    case 'heroLarge':
      return base.width(1200).url();
    case 'heroMedium':
      return base.width(800).url();
    case 'thumbnail':
      return base.width(400).url();
    case 'card':
      return base.width(600).url();
    case 'full':
    default:
      return base.url();
  }
}

// Query functions for fetching content
export async function getArticles(limit = 100) {
  try {
    return await sanityClient.fetch(`
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
    `);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  return await sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      heroImageUrl,
      body,
      readingTimeMinutes,
      "author": author->{name, slug, image, bio, title},
      "category": category->{title, slug},
      tags[]->{name, slug},
      seoTitle,
      seoDescription
    }`,
    { slug }
  );
}

export async function getFeaturedArticles(limit = 1) {
  try {
    // Try featured articles first, fallback to latest if no featured field exists
    const featured = await sanityClient.fetch(`
      *[_type == "article" && featured == true] | order(publishedAt desc) [0...${limit}] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `);
    
    // If no featured articles, return latest articles
    if (!featured || featured.length === 0) {
      return await getArticles(limit);
    }
    
    return featured;
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return await getArticles(limit);
  }
}

export async function getArticlesByCategory(categorySlug: string, limit = 20) {
  return await sanityClient.fetch(
    `*[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) [0...${limit}] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      heroImageUrl,
      "author": author->{name, slug},
      "category": category->{title, slug}
    }`,
    { categorySlug }
  );
}

export async function getArticlesByTag(tagSlug: string, limit = 20) {
  return await sanityClient.fetch(
    `*[_type == "article" && $tagSlug in tags[]->slug.current] | order(publishedAt desc) [0...${limit}] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      heroImageUrl,
      "author": author->{name, slug},
      "category": category->{title, slug}
    }`,
    { tagSlug }
  );
}

export async function searchArticles(query: string): Promise<any[]> {
  return await sanityClient.fetch(
    `*[_type == "article" && (
      title match $query + "*" ||
      excerpt match $query + "*" ||
      pt::text(body) match $query + "*"
    )] | order(publishedAt desc) [0...20] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      heroImageUrl,
      "author": author->{name, slug},
      "category": category->{title, slug}
    }`,
    { query } as any
  );
}

export async function getPopularTags(limit = 20) {
  try {
    return await sanityClient.fetch(`
      *[_type == "tag"] {
        _id,
        name,
        slug,
        "articleCount": count(*[_type == "article" && references(^._id)])
      } | order(articleCount desc) [0...${limit}]
    `);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return [];
  }
}

export async function getCategories() {
  return await sanityClient.fetch(`
    *[_type == "category"] | order(displayOrder asc) {
      _id,
      title,
      slug,
      description
    }
  `);
}

export async function getRelatedArticles(articleId: string, tags: any[], limit = 4) {
  const tagIds = tags?.map(t => t._id).filter(Boolean) || [];
  
  if (tagIds.length === 0) {
    return await sanityClient.fetch(
      `*[_type == "article" && _id != $articleId] | order(publishedAt desc) [0...${limit}] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        mainImage,
        heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }`,
      { articleId }
    );
  }
  
  return await sanityClient.fetch(
    `*[_type == "article" && _id != $articleId && count((tags[]._ref)[@ in $tagIds]) > 0] | order(publishedAt desc) [0...${limit}] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      heroImageUrl,
      "author": author->{name, slug},
      "category": category->{title, slug}
    }`,
    { articleId, tagIds }
  );
}
