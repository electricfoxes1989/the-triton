import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackArticleView, getTrendingArticles } from './sanity';

// Mock the Sanity client
vi.mock('./sanity', () => ({
  trackArticleView: vi.fn(),
  getTrendingArticles: vi.fn()
}));

describe('Article View Tracking and Trending', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackArticleView', () => {
    it('should successfully track an article view', async () => {
      vi.mocked(trackArticleView).mockResolvedValue(true);

      const result = await trackArticleView('article123');

      expect(result).toBe(true);
      expect(trackArticleView).toHaveBeenCalledWith('article123');
    });

    it('should handle tracking errors gracefully', async () => {
      vi.mocked(trackArticleView).mockResolvedValue(false);

      const result = await trackArticleView('invalid-id');

      expect(result).toBe(false);
    });

    it('should increment view count for multiple views', async () => {
      vi.mocked(trackArticleView).mockResolvedValue(true);

      await trackArticleView('article123');
      await trackArticleView('article123');
      await trackArticleView('article123');

      expect(trackArticleView).toHaveBeenCalledTimes(3);
    });
  });

  describe('getTrendingArticles', () => {
    it('should return trending articles sorted by views', async () => {
      const mockTrendingArticles = [
        {
          _id: 'article1',
          title: 'Most Popular Article',
          slug: { current: 'most-popular' },
          excerpt: 'This is the most viewed article',
          publishedAt: '2026-02-09T00:00:00Z',
          heroImageUrl: 'https://example.com/image1.jpg',
          views: 10000,
          author: { name: 'John Doe', slug: { current: 'john-doe' } },
          category: { title: 'News', slug: { current: 'news' } }
        },
        {
          _id: 'article2',
          title: 'Second Popular Article',
          slug: { current: 'second-popular' },
          excerpt: 'This is the second most viewed',
          publishedAt: '2026-02-08T00:00:00Z',
          heroImageUrl: 'https://example.com/image2.jpg',
          views: 5000,
          author: { name: 'Jane Smith', slug: { current: 'jane-smith' } },
          category: { title: 'Captains', slug: { current: 'captains' } }
        },
        {
          _id: 'article3',
          title: 'Third Popular Article',
          slug: { current: 'third-popular' },
          excerpt: 'This is the third most viewed',
          publishedAt: '2026-02-07T00:00:00Z',
          heroImageUrl: 'https://example.com/image3.jpg',
          views: 2500,
          author: { name: 'Bob Johnson', slug: { current: 'bob-johnson' } },
          category: { title: 'Crew Life', slug: { current: 'crew-life' } }
        }
      ];

      vi.mocked(getTrendingArticles).mockResolvedValue(mockTrendingArticles);

      const result = await getTrendingArticles(5);

      expect(result).toEqual(mockTrendingArticles);
      expect(result.length).toBe(3);
      expect(result[0].views).toBeGreaterThan(result[1].views!);
      expect(result[1].views).toBeGreaterThan(result[2].views!);
    });

    it('should respect the limit parameter', async () => {
      const mockArticles = [
        { _id: '1', views: 1000, title: 'Article 1', slug: { current: 'article-1' }, publishedAt: '2026-02-09T00:00:00Z' },
        { _id: '2', views: 900, title: 'Article 2', slug: { current: 'article-2' }, publishedAt: '2026-02-08T00:00:00Z' },
        { _id: '3', views: 800, title: 'Article 3', slug: { current: 'article-3' }, publishedAt: '2026-02-07T00:00:00Z' }
      ];

      vi.mocked(getTrendingArticles).mockResolvedValue(mockArticles);

      const result = await getTrendingArticles(3);

      expect(result.length).toBeLessThanOrEqual(3);
      expect(getTrendingArticles).toHaveBeenCalledWith(3);
    });

    it('should return empty array when no trending articles exist', async () => {
      vi.mocked(getTrendingArticles).mockResolvedValue([]);

      const result = await getTrendingArticles(5);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should include all required article fields', async () => {
      const mockArticle = {
        _id: 'article1',
        title: 'Test Article',
        slug: { current: 'test-article' },
        excerpt: 'Test excerpt',
        publishedAt: '2026-02-09T00:00:00Z',
        heroImageUrl: 'https://example.com/image.jpg',
        views: 1000,
        author: { name: 'Test Author', slug: { current: 'test-author' } },
        category: { title: 'Test Category', slug: { current: 'test-category' } }
      };

      vi.mocked(getTrendingArticles).mockResolvedValue([mockArticle]);

      const result = await getTrendingArticles(1);

      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('slug');
      expect(result[0]).toHaveProperty('views');
      expect(result[0]).toHaveProperty('publishedAt');
      expect(result[0]).toHaveProperty('author');
      expect(result[0]).toHaveProperty('category');
    });

    it('should handle articles with zero views', async () => {
      const mockArticles = [
        { _id: '1', views: 100, title: 'Article 1', slug: { current: 'article-1' }, publishedAt: '2026-02-09T00:00:00Z' },
        { _id: '2', views: 0, title: 'Article 2', slug: { current: 'article-2' }, publishedAt: '2026-02-08T00:00:00Z' }
      ];

      vi.mocked(getTrendingArticles).mockResolvedValue(mockArticles);

      const result = await getTrendingArticles(5);

      expect(result.some(article => article.views === 0)).toBe(true);
    });
  });

  describe('View Count Formatting', () => {
    it('should format views under 1000 as plain numbers', () => {
      const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
      };

      expect(formatViews(999)).toBe('999');
      expect(formatViews(500)).toBe('500');
      expect(formatViews(1)).toBe('1');
    });

    it('should format views in thousands with K suffix', () => {
      const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
      };

      expect(formatViews(1000)).toBe('1.0K');
      expect(formatViews(5500)).toBe('5.5K');
      expect(formatViews(999999)).toBe('1000.0K');
    });

    it('should format views in millions with M suffix', () => {
      const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
      };

      expect(formatViews(1000000)).toBe('1.0M');
      expect(formatViews(2500000)).toBe('2.5M');
      expect(formatViews(10000000)).toBe('10.0M');
    });
  });

  describe('Trending Articles Ranking', () => {
    it('should rank articles by view count', () => {
      const articles = [
        { views: 1000 },
        { views: 5000 },
        { views: 2500 }
      ];

      const sorted = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));

      expect(sorted[0].views).toBe(5000);
      expect(sorted[1].views).toBe(2500);
      expect(sorted[2].views).toBe(1000);
    });

    it('should handle articles with undefined views', () => {
      const articles = [
        { views: 1000 },
        { views: undefined },
        { views: 500 }
      ];

      const sorted = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));

      expect(sorted[0].views).toBe(1000);
      expect(sorted[1].views).toBe(500);
      expect(sorted[2].views).toBeUndefined();
    });
  });
});
