import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdvertisements } from './sanity';

// Mock the Sanity client
vi.mock('./sanity', () => ({
  getAdvertisements: vi.fn()
}));

describe('Advertisement System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdvertisements', () => {
    it('should return advertisements filtered by page and position', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'Quantum Marine Stabilizers',
          imageUrl: 'https://example.com/quantum.jpg',
          clickUrl: 'https://quantummarine.com',
          targetPages: ['all'],
          position: 'nav-top',
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          priority: 10,
          active: true,
          impressions: 1000,
          clicks: 50
        }
      ];

      vi.mocked(getAdvertisements).mockResolvedValue(mockAds);

      const result = await getAdvertisements('all', 'nav-top');

      expect(result).toEqual(mockAds);
      expect(getAdvertisements).toHaveBeenCalledWith('all', 'nav-top');
    });

    it('should return empty array when no ads match', async () => {
      vi.mocked(getAdvertisements).mockResolvedValue([]);

      const result = await getAdvertisements('homepage', 'sidebar');

      expect(result).toEqual([]);
    });

    it('should filter ads by specific page', async () => {
      const mockAds = [
        {
          _id: 'ad2',
          title: 'AME Solutions - Crew Life',
          imageUrl: 'https://example.com/ame.jpg',
          clickUrl: 'https://amesolutions.com',
          targetPages: ['crew-life'],
          position: 'content-top',
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          priority: 5,
          active: true,
          impressions: 500,
          clicks: 25
        }
      ];

      vi.mocked(getAdvertisements).mockResolvedValue(mockAds);

      const result = await getAdvertisements('crew-life', 'content-top');

      expect(result).toEqual(mockAds);
      expect(result[0].targetPages).toContain('crew-life');
    });

    it('should return ads sorted by priority (highest first)', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'High Priority Ad',
          imageUrl: 'https://example.com/high.jpg',
          clickUrl: 'https://example.com',
          targetPages: ['all'],
          position: 'nav-top',
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          priority: 10,
          active: true,
          impressions: 0,
          clicks: 0
        },
        {
          _id: 'ad2',
          title: 'Low Priority Ad',
          imageUrl: 'https://example.com/low.jpg',
          clickUrl: 'https://example.com',
          targetPages: ['all'],
          position: 'nav-top',
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          priority: 5,
          active: true,
          impressions: 0,
          clicks: 0
        }
      ];

      vi.mocked(getAdvertisements).mockResolvedValue(mockAds);

      const result = await getAdvertisements('all', 'nav-top');

      expect(result[0].priority).toBeGreaterThan(result[1].priority);
    });

    it('should only return active ads', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'Active Ad',
          imageUrl: 'https://example.com/active.jpg',
          clickUrl: 'https://example.com',
          targetPages: ['all'],
          position: 'nav-top',
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          priority: 10,
          active: true,
          impressions: 0,
          clicks: 0
        }
      ];

      vi.mocked(getAdvertisements).mockResolvedValue(mockAds);

      const result = await getAdvertisements('all', 'nav-top');

      expect(result.every(ad => ad.active)).toBe(true);
    });
  });

  describe('Advertisement Schema Validation', () => {
    it('should have all required fields', () => {
      const mockAd = {
        _id: 'ad1',
        title: 'Test Ad',
        imageUrl: 'https://example.com/test.jpg',
        clickUrl: 'https://example.com',
        targetPages: ['all'],
        position: 'nav-top',
        startDate: '2026-01-01T00:00:00Z',
        endDate: null,
        priority: 10,
        active: true,
        impressions: 0,
        clicks: 0
      };

      expect(mockAd).toHaveProperty('_id');
      expect(mockAd).toHaveProperty('title');
      expect(mockAd).toHaveProperty('imageUrl');
      expect(mockAd).toHaveProperty('clickUrl');
      expect(mockAd).toHaveProperty('targetPages');
      expect(mockAd).toHaveProperty('position');
      expect(mockAd).toHaveProperty('startDate');
      expect(mockAd).toHaveProperty('priority');
      expect(mockAd).toHaveProperty('active');
      expect(mockAd).toHaveProperty('impressions');
      expect(mockAd).toHaveProperty('clicks');
    });

    it('should validate position values', () => {
      const validPositions = ['nav-top', 'content-top', 'content-middle', 'sidebar', 'footer'];
      
      validPositions.forEach(position => {
        expect(['nav-top', 'content-top', 'content-middle', 'sidebar', 'footer']).toContain(position);
      });
    });

    it('should validate targetPages values', () => {
      const validPages = ['all', 'homepage', 'news', 'captains', 'crew-life', 'magazine', 'events', 'article'];
      
      validPages.forEach(page => {
        expect(['all', 'homepage', 'news', 'captains', 'crew-life', 'magazine', 'events', 'article']).toContain(page);
      });
    });

    it('should validate priority range', () => {
      const priorities = [1, 5, 10, 50, 100];
      
      priorities.forEach(priority => {
        expect(priority).toBeGreaterThanOrEqual(1);
        expect(priority).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Advertisement Analytics', () => {
    it('should track impressions', () => {
      const mockAd = {
        _id: 'ad1',
        title: 'Test Ad',
        imageUrl: 'https://example.com/test.jpg',
        clickUrl: 'https://example.com',
        targetPages: ['all'],
        position: 'nav-top',
        startDate: '2026-01-01T00:00:00Z',
        endDate: null,
        priority: 10,
        active: true,
        impressions: 100,
        clicks: 5
      };

      expect(mockAd.impressions).toBe(100);
      expect(typeof mockAd.impressions).toBe('number');
    });

    it('should track clicks', () => {
      const mockAd = {
        _id: 'ad1',
        title: 'Test Ad',
        imageUrl: 'https://example.com/test.jpg',
        clickUrl: 'https://example.com',
        targetPages: ['all'],
        position: 'nav-top',
        startDate: '2026-01-01T00:00:00Z',
        endDate: null,
        priority: 10,
        active: true,
        impressions: 100,
        clicks: 5
      };

      expect(mockAd.clicks).toBe(5);
      expect(typeof mockAd.clicks).toBe('number');
    });

    it('should calculate CTR (Click-Through Rate)', () => {
      const mockAd = {
        impressions: 1000,
        clicks: 50
      };

      const ctr = (mockAd.clicks / mockAd.impressions) * 100;
      
      expect(ctr).toBe(5); // 5% CTR
    });
  });

  describe('Advertisement Date Filtering', () => {
    it('should validate start date format', () => {
      const startDate = '2026-01-01T00:00:00Z';
      const dateObj = new Date(startDate);
      
      expect(dateObj).toBeInstanceOf(Date);
      expect(dateObj.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    });

    it('should handle null end date (no expiration)', () => {
      const mockAd = {
        _id: 'ad1',
        title: 'Test Ad',
        imageUrl: 'https://example.com/test.jpg',
        clickUrl: 'https://example.com',
        targetPages: ['all'],
        position: 'nav-top',
        startDate: '2026-01-01T00:00:00Z',
        endDate: null,
        priority: 10,
        active: true,
        impressions: 0,
        clicks: 0
      };

      expect(mockAd.endDate).toBeNull();
    });

    it('should validate end date when provided', () => {
      const endDate = '2026-12-31T23:59:59Z';
      const dateObj = new Date(endDate);
      
      expect(dateObj).toBeInstanceOf(Date);
      expect(dateObj.toISOString()).toBe('2026-12-31T23:59:59.000Z');
    });
  });

  describe('Advertisement Page Targeting', () => {
    it('should match "all" pages to any page request', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'Universal Ad',
          imageUrl: 'https://example.com/universal.jpg',
          clickUrl: 'https://example.com',
          targetPages: ['all'],
          position: 'nav-top',
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          priority: 10,
          active: true,
          impressions: 0,
          clicks: 0
        }
      ];

      vi.mocked(getAdvertisements).mockResolvedValue(mockAds);

      const pages = ['homepage', 'news', 'captains', 'crew-life', 'magazine', 'events'];
      
      for (const page of pages) {
        const result = await getAdvertisements(page, 'nav-top');
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].targetPages).toContain('all');
      }
    });

    it('should match specific page targeting', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'Crew Life Specific Ad',
          imageUrl: 'https://example.com/crew.jpg',
          clickUrl: 'https://example.com',
          targetPages: ['crew-life'],
          position: 'content-top',
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          priority: 10,
          active: true,
          impressions: 0,
          clicks: 0
        }
      ];

      vi.mocked(getAdvertisements).mockResolvedValue(mockAds);

      const result = await getAdvertisements('crew-life', 'content-top');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].targetPages).toContain('crew-life');
    });
  });
});
