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
  body?: any;
  author?: {
    name: string;
    slug: { current: string } | string;
    image?: string;
    bio?: string;
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

// Magazine Issue interfaces and functions
export interface SanityMagazineIssue {
  _id: string;
  title: string;
  slug: { current: string } | string;
  issueNumber?: string;
  publishDate: string;
  coverImage?: string;
  issuuEmbedUrl?: string;
  issuuDocumentId?: string;
  pdfUrl?: string;
  description?: string;
  featuredArticles?: SanityArticle[];
}

export async function getMagazineIssues(limit: number = 50): Promise<SanityMagazineIssue[]> {
  try {
    const query = `
      *[_type == "magazineIssue"] | order(publishDate desc) [0...${limit}] {
        _id,
        title,
        slug,
        issueNumber,
        publishDate,
        "coverImage": coverImage.asset->url,
        issuuEmbedUrl,
        issuuDocumentId,
        pdfUrl,
        description,
        "featuredArticles": featuredArticles[]->{
          _id,
          title,
          slug,
          excerpt,
          publishedAt,
          heroImageUrl
        }
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Server: Failed to fetch magazine issues from Sanity:', error);
    return [];
  }
}

export async function getMagazineIssueBySlug(slug: string): Promise<SanityMagazineIssue | null> {
  try {
    const query = `
      *[_type == "magazineIssue" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        issueNumber,
        publishDate,
        "coverImage": coverImage.asset->url,
        issuuEmbedUrl,
        issuuDocumentId,
        pdfUrl,
        description,
        "featuredArticles": featuredArticles[]->{
          _id,
          title,
          slug,
          excerpt,
          publishedAt,
          heroImageUrl,
          "author": author->{name, slug}
        }
      }
    `;
    const result = await sanityClient.fetch(query, { slug });
    return result || null;
  } catch (error) {
    console.error('Server: Failed to fetch magazine issue by slug:', error);
    return null;
  }
}

// Event interfaces and functions
export interface SanityEvent {
  _id: string;
  title: string;
  slug: { current: string } | string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  eventType: string;
  location?: {
    venue?: string;
    city?: string;
    country?: string;
    address?: string;
  };
  description?: any;
  featuredImage?: string;
  registrationUrl?: string;
  websiteUrl?: string;
  organizer?: string;
  contactEmail?: string;
  isFeatured: boolean;
}

export async function getEvents(limit: number = 100): Promise<SanityEvent[]> {
  try {
    const query = `
      *[_type == "event"] | order(startDate asc) [0...${limit}] {
        _id,
        title,
        slug,
        startDate,
        endDate,
        allDay,
        eventType,
        location,
        description,
        "featuredImage": featuredImage.asset->url,
        registrationUrl,
        websiteUrl,
        organizer,
        contactEmail,
        isFeatured
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Server: Failed to fetch events from Sanity:', error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<SanityEvent | null> {
  try {
    const query = `
      *[_type == "event" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        startDate,
        endDate,
        allDay,
        eventType,
        location,
        description,
        "featuredImage": featuredImage.asset->url,
        registrationUrl,
        websiteUrl,
        organizer,
        contactEmail,
        isFeatured
      }
    `;
    const result = await sanityClient.fetch(query, { slug });
    return result || null;
  } catch (error) {
    console.error('Server: Failed to fetch event by slug:', error);
    return null;
  }
}

export async function getFeaturedEvents(limit: number = 10): Promise<SanityEvent[]> {
  try {
    const query = `
      *[_type == "event" && isFeatured == true] | order(startDate asc) [0...${limit}] {
        _id,
        title,
        slug,
        startDate,
        endDate,
        allDay,
        eventType,
        location,
        "featuredImage": featuredImage.asset->url,
        registrationUrl,
        websiteUrl
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Server: Failed to fetch featured events:', error);
    return [];
  }
}

// Author interface
export interface SanityAuthor {
  _id: string;
  name: string;
  slug: { current: string } | string;
  image?: string;
  bio?: string;
  twitter?: string;
  linkedin?: string;
  email?: string;
  website?: string;
}

// Get author by slug
export async function getAuthorBySlug(slug: string): Promise<SanityAuthor | null> {
  try {
    const query = `
      *[_type == "author" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        image,
        bio,
        twitter,
        linkedin,
        email,
        website
      }
    `;
    const result = await sanityClient.fetch(query, { slug });
    return result || null;
  } catch (error) {
    console.error('Server: Failed to fetch author by slug:', error);
    return null;
  }
}

// Get articles by author slug
export async function getArticlesByAuthor(authorSlug: string, limit: number = 50): Promise<SanityArticle[]> {
  try {
    const query = `
      *[_type == "article" && author->slug.current == $authorSlug] | order(publishedAt desc) [0...${limit}] {
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
    const results = await sanityClient.fetch(query, { authorSlug });
    return results || [];
  } catch (error) {
    console.error('Server: Failed to fetch articles by author:', error);
    return [];
  }
}

// Featured Video interface
export interface SanityFeaturedVideo {
  _id: string;
  title: string;
  slug: { current: string } | string;
  category: 'crew-life' | 'captains';
  videoUrl: string;
  description?: string;
  isActive: boolean;
  publishedAt: string;
}

// Get active featured video by category
export async function getFeaturedVideoByCategory(category: string): Promise<SanityFeaturedVideo | null> {
  try {
    const query = `
      *[_type == "featuredVideo" && category == $category && isActive == true] | order(publishedAt desc) [0] {
        _id,
        title,
        slug,
        category,
        videoUrl,
        description,
        isActive,
        publishedAt
      }
    `;
    const result = await sanityClient.fetch(query, { category });
    return result || null;
  } catch (error) {
    console.error('Server: Failed to fetch featured video by category:', error);
    return null;
  }
}

// Get all featured videos
export async function getAllFeaturedVideos(): Promise<SanityFeaturedVideo[]> {
  try {
    const query = `
      *[_type == "featuredVideo"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        category,
        videoUrl,
        description,
        isActive,
        publishedAt
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Server: Failed to fetch featured videos:', error);
    return [];
  }
}

// Banner Advertisement Types
export interface SanityBannerAd {
  _id: string;
  title: string;
  slug: { current: string } | string;
  imageUrl: string;
  link: string;
  advertiser?: string;
  position: string;
  pageTargeting: string[];
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export async function getBannerAds(page: string, position: string): Promise<SanityBannerAd | null> {
  try {
    const query = `
      *[_type == "bannerAd" 
        && isActive == true 
        && position == "${position}"
        && ("all" in pageTargeting || "${page}" in pageTargeting)
        && (!defined(startDate) || startDate <= now())
        && (!defined(endDate) || endDate >= now())
      ] | order(priority desc) [0]{
        _id,
        title,
        slug,
        "imageUrl": image.asset->url,
        link,
        advertiser,
        position,
        pageTargeting,
        priority,
        isActive,
        startDate,
        endDate
      }
    `;
    const result = await sanityClient.fetch(query);
    return result || null;
  } catch (error) {
    console.error('Error fetching banner ads:', error);
    return null;
  }
}

export async function getAllActiveBanners(): Promise<SanityBannerAd[]> {
  try {
    const query = `
      *[_type == "bannerAd" 
        && isActive == true
        && (!defined(startDate) || startDate <= now())
        && (!defined(endDate) || endDate >= now())
      ] | order(priority desc){
        _id,
        title,
        slug,
        "imageUrl": image.asset->url,
        link,
        advertiser,
        position,
        pageTargeting,
        priority,
        isActive,
        startDate,
        endDate
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Error fetching all active banners:', error);
    return [];
  }
}
