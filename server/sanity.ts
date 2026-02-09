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
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<SanityArticle | null> {
  try {
    const query = `
      *[_type == "article" && slug.current == "${slug}"][0]{
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        heroImageUrl,
        body,
        "author": author->{
          name, 
          slug,
          "image": image.asset->url,
          bio,
          twitter,
          linkedin,
          email,
          website
        },
        "category": category->{title, slug},
        "tags": tags[]->{name, slug}
      }
    `;
    const result = await sanityClient.fetch(query);
    return result || null;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}

export async function getArticlesByCategory(categorySlug: string, limit: number = 20): Promise<SanityArticle[]> {
  try {
    const query = `
      *[_type == "article" && category->slug.current == "${categorySlug}"] | order(publishedAt desc) [0...${limit}] {
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
    console.error('Error fetching articles by category:', error);
    return [];
  }
}

export async function searchArticles(searchQuery: string, limit: number = 20): Promise<SanityArticle[]> {
  try {
    const query = `
      *[_type == "article" && (
        title match "${searchQuery}*" ||
        excerpt match "${searchQuery}*" ||
        author->name match "${searchQuery}*"
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
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
}

// Magazine Issue Types
export interface SanityMagazineIssue {
  _id: string;
  title: string;
  slug: { current: string } | string;
  issueNumber: number;
  publishedDate: string;
  coverImageUrl?: string;
  issuuEmbedUrl?: string;
  description?: string;
}

export async function getMagazineIssues(): Promise<SanityMagazineIssue[]> {
  try {
    const query = `
      *[_type == "magazineIssue"] | order(publishedDate desc) {
        _id,
        title,
        slug,
        issueNumber,
        publishedDate,
        "coverImageUrl": coverImage.asset->url,
        issuuEmbedUrl,
        description
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Error fetching magazine issues:', error);
    return [];
  }
}

export async function getMagazineIssueBySlug(slug: string): Promise<SanityMagazineIssue | null> {
  try {
    const query = `
      *[_type == "magazineIssue" && slug.current == "${slug}"][0]{
        _id,
        title,
        slug,
        issueNumber,
        publishedDate,
        "coverImageUrl": coverImage.asset->url,
        issuuEmbedUrl,
        description
      }
    `;
    const result = await sanityClient.fetch(query);
    return result || null;
  } catch (error) {
    console.error('Error fetching magazine issue by slug:', error);
    return null;
  }
}

// Event Types
export interface SanityEvent {
  _id: string;
  title: string;
  slug: { current: string } | string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  eventType?: string;
  registrationUrl?: string;
  imageUrl?: string;
}

export async function getEvents(): Promise<SanityEvent[]> {
  try {
    const query = `
      *[_type == "event"] | order(startDate desc) {
        _id,
        title,
        slug,
        startDate,
        endDate,
        location,
        description,
        eventType,
        registrationUrl,
        "imageUrl": image.asset->url
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<SanityEvent | null> {
  try {
    const query = `
      *[_type == "event" && slug.current == "${slug}"][0]{
        _id,
        title,
        slug,
        startDate,
        endDate,
        location,
        description,
        eventType,
        registrationUrl,
        "imageUrl": image.asset->url
      }
    `;
    const result = await sanityClient.fetch(query);
    return result || null;
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return null;
  }
}

export async function getFeaturedEvents(limit: number = 5): Promise<SanityEvent[]> {
  try {
    const query = `
      *[_type == "event" && startDate >= now()] | order(startDate asc) [0...${limit}] {
        _id,
        title,
        slug,
        startDate,
        endDate,
        location,
        description,
        eventType,
        registrationUrl,
        "imageUrl": image.asset->url
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return [];
  }
}

// Author Types
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

export async function getAuthorBySlug(slug: string): Promise<SanityAuthor | null> {
  try {
    const query = `
      *[_type == "author" && slug.current == "${slug}"][0]{
        _id,
        name,
        slug,
        "image": image.asset->url,
        bio,
        twitter,
        linkedin,
        email,
        website
      }
    `;
    const result = await sanityClient.fetch(query);
    return result || null;
  } catch (error) {
    console.error('Error fetching author by slug:', error);
    return null;
  }
}

export async function getArticlesByAuthor(authorSlug: string, limit: number = 20): Promise<SanityArticle[]> {
  try {
    const query = `
      *[_type == "article" && author->slug.current == "${authorSlug}"] | order(publishedAt desc) [0...${limit}] {
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
    console.error('Error fetching articles by author:', error);
    return [];
  }
}

// Featured Video Types
export interface SanityFeaturedVideo {
  _id: string;
  title: string;
  videoUrl: string;
  description?: string;
  category: string;
  active: boolean;
}

export async function getFeaturedVideoByCategory(category: string): Promise<SanityFeaturedVideo | null> {
  try {
    const query = `
      *[_type == "featuredVideo" && category == "${category}" && active == true][0]{
        _id,
        title,
        videoUrl,
        description,
        category,
        active
      }
    `;
    const result = await sanityClient.fetch(query);
    return result || null;
  } catch (error) {
    console.error('Error fetching featured video by category:', error);
    return null;
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
  impressions?: number;
  clicks?: number;
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
        endDate,
        impressions,
        clicks
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
        endDate,
        impressions,
        clicks
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Error fetching all active banners:', error);
    return [];
  }
}

export async function getAllAdvertisements(): Promise<SanityBannerAd[]> {
  try {
    const query = `
      *[_type == "bannerAd"] | order(priority desc, _createdAt desc){
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
        endDate,
        impressions,
        clicks
      }
    `;
    const results = await sanityClient.fetch(query);
    return results || [];
  } catch (error) {
    console.error('Error fetching all advertisements:', error);
    return [];
  }
}

export async function trackBannerImpression(adId: string): Promise<boolean> {
  try {
    await sanityClient
      .patch(adId)
      .setIfMissing({ impressions: 0 })
      .inc({ impressions: 1 })
      .commit();
    return true;
  } catch (error) {
    console.error('Error tracking banner impression:', error);
    return false;
  }
}

export async function trackBannerClick(adId: string): Promise<boolean> {
  try {
    await sanityClient
      .patch(adId)
      .setIfMissing({ clicks: 0 })
      .inc({ clicks: 1 })
      .commit();
    return true;
  } catch (error) {
    console.error('Error tracking banner click:', error);
    return false;
  }
}
