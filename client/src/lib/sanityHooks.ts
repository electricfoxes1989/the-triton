import { useQuery, useMutation } from '@tanstack/react-query';
import { sanityClient } from './sanity';

// ── Articles ──

export function useArticles(limit = 50) {
  return useQuery({
    queryKey: ['articles', limit],
    queryFn: () => sanityClient.fetch(`
      *[_type == "article"] | order(publishedAt desc) [0...${limit}] {
        _id, title, slug, excerpt, publishedAt, heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `),
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => sanityClient.fetch(`
      *[_type == "article" && slug.current == $slug][0]{
        _id, title, slug, excerpt, publishedAt, heroImageUrl,
        body[]{
          ...,
          _type == "image" => { ..., "asset": asset->{url, _id, _ref} }
        },
        "author": author->{
          name, slug, "image": image.asset->url, bio,
          twitter, linkedin, email, website
        },
        "category": category->{title, slug},
        "tags": tags[]->{name, slug}
      }
    `, { slug }),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticlesByCategory(categorySlug: string, limit = 20) {
  return useQuery({
    queryKey: ['articles', 'category', categorySlug, limit],
    queryFn: () => sanityClient.fetch(`
      *[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) [0...${limit}] {
        _id, title, slug, excerpt, publishedAt, heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `, { categorySlug }),
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchArticles(query: string, limit = 20) {
  return useQuery({
    queryKey: ['articles', 'search', query],
    queryFn: () => sanityClient.fetch(`
      *[_type == "article" && (
        title match $query + "*" ||
        excerpt match $query + "*"
      )] | order(publishedAt desc) [0...${limit}] {
        _id, title, slug, excerpt, publishedAt, heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `, { query }),
    enabled: !!query && query.length > 1,
    staleTime: 60 * 1000,
  });
}

export function useTrendingArticles(limit = 5) {
  return useQuery({
    queryKey: ['articles', 'trending', limit],
    queryFn: () => sanityClient.fetch(`
      *[_type == "article" && defined(views)] | order(views desc) [0...${limit}] {
        _id, title, slug, excerpt, publishedAt, heroImageUrl, views,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Authors ──

export function useAuthorBySlug(slug: string) {
  return useQuery({
    queryKey: ['author', slug],
    queryFn: () => sanityClient.fetch(`
      *[_type == "author" && slug.current == $slug][0]{
        _id, name, slug, "image": image.asset->url, bio,
        twitter, linkedin, email, website
      }
    `, { slug }),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticlesByAuthor(authorSlug: string, limit = 20) {
  return useQuery({
    queryKey: ['articles', 'author', authorSlug, limit],
    queryFn: () => sanityClient.fetch(`
      *[_type == "article" && author->slug.current == $authorSlug] | order(publishedAt desc) [0...${limit}] {
        _id, title, slug, excerpt, publishedAt, heroImageUrl,
        "author": author->{name, slug},
        "category": category->{title, slug}
      }
    `, { authorSlug }),
    enabled: !!authorSlug,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Events ──

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => sanityClient.fetch(`
      *[_type == "event"] | order(startDate desc) {
        _id, title, slug, startDate, endDate, location,
        description, eventType, registrationUrl,
        "imageUrl": image.asset->url
      }
    `),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Magazines ──

export function useMagazineIssues() {
  return useQuery({
    queryKey: ['magazines'],
    queryFn: () => sanityClient.fetch(`
      *[_type == "magazineIssue"] | order(publishedDate desc) {
        _id, title, slug, issueNumber, publishedDate,
        "coverImageUrl": coverImage.asset->url,
        issuuEmbedUrl, description
      }
    `),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Videos ──

export function useFeaturedVideo(category: string) {
  return useQuery({
    queryKey: ['video', category],
    queryFn: () => sanityClient.fetch(`
      *[_type == "featuredVideo" && category == $category && active == true][0]{
        _id, title, videoUrl, description, category, active
      }
    `, { category }),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Banners ──

export function useBannerAd(page: string, position: string) {
  return useQuery({
    queryKey: ['banner', page, position],
    queryFn: () => sanityClient.fetch(`
      *[_type == "bannerAd"
        && isActive == true
        && position == $position
        && ("all" in pageTargeting || $page in pageTargeting)
      ] | order(priority desc) [0]{
        _id, title, slug, "imageUrl": image.asset->url, link,
        advertiser, position, pageTargeting, priority
      }
    `, { page, position }),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Advertisements (analytics) ──

export function useAllAdvertisements() {
  return useQuery({
    queryKey: ['advertisements'],
    queryFn: () => sanityClient.fetch(`
      *[_type == "bannerAd"] | order(priority desc) {
        _id, title, slug, "imageUrl": image.asset->url, link,
        advertiser, position, pageTargeting, priority, isActive,
        impressions, clicks
      }
    `),
    staleTime: 5 * 60 * 1000,
  });
}
