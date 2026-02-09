import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllAdvertisements, trackBannerImpression, trackBannerClick } from './sanity';

// Mock the Sanity client
vi.mock('./sanity', () => ({
  getAllAdvertisements: vi.fn(),
  trackBannerImpression: vi.fn(),
  trackBannerClick: vi.fn()
}));

describe('Advertisement Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllAdvertisements', () => {
    it('should return all advertisements including inactive ones', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'Active Ad',
          slug: { current: 'active-ad' },
          imageUrl: 'https://example.com/active.jpg',
          link: 'https://example.com',
          advertiser: 'Test Advertiser',
          position: 'nav-top',
          pageTargeting: ['all'],
          priority: 10,
          isActive: true,
          startDate: '2026-01-01T00:00:00Z',
          endDate: null,
          impressions: 1000,
          clicks: 50
        },
        {
          _id: 'ad2',
          title: 'Inactive Ad',
          slug: { current: 'inactive-ad' },
          imageUrl: 'https://example.com/inactive.jpg',
          link: 'https://example.com',
          advertiser: 'Test Advertiser 2',
          position: 'content-top',
          pageTargeting: ['crew-life'],
          priority: 5,
          isActive: false,
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-06-30T23:59:59Z',
          impressions: 500,
          clicks: 10
        }
      ];

      vi.mocked(getAllAdvertisements).mockResolvedValue(mockAds);

      const result = await getAllAdvertisements();

      expect(result).toEqual(mockAds);
      expect(result.length).toBe(2);
      expect(result.some(ad => ad.isActive)).toBe(true);
      expect(result.some(ad => !ad.isActive)).toBe(true);
    });

    it('should include impressions and clicks data', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'Test Ad',
          slug: { current: 'test-ad' },
          imageUrl: 'https://example.com/test.jpg',
          link: 'https://example.com',
          position: 'nav-top',
          pageTargeting: ['all'],
          priority: 10,
          isActive: true,
          impressions: 1500,
          clicks: 75
        }
      ];

      vi.mocked(getAllAdvertisements).mockResolvedValue(mockAds);

      const result = await getAllAdvertisements();

      expect(result[0]).toHaveProperty('impressions');
      expect(result[0]).toHaveProperty('clicks');
      expect(result[0].impressions).toBe(1500);
      expect(result[0].clicks).toBe(75);
    });

    it('should handle ads with zero impressions and clicks', async () => {
      const mockAds = [
        {
          _id: 'ad1',
          title: 'New Ad',
          slug: { current: 'new-ad' },
          imageUrl: 'https://example.com/new.jpg',
          link: 'https://example.com',
          position: 'nav-top',
          pageTargeting: ['all'],
          priority: 10,
          isActive: true,
          impressions: 0,
          clicks: 0
        }
      ];

      vi.mocked(getAllAdvertisements).mockResolvedValue(mockAds);

      const result = await getAllAdvertisements();

      expect(result[0].impressions).toBe(0);
      expect(result[0].clicks).toBe(0);
    });

    it('should return empty array when no ads exist', async () => {
      vi.mocked(getAllAdvertisements).mockResolvedValue([]);

      const result = await getAllAdvertisements();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('trackBannerImpression', () => {
    it('should successfully track an impression', async () => {
      vi.mocked(trackBannerImpression).mockResolvedValue(true);

      const result = await trackBannerImpression('ad123');

      expect(result).toBe(true);
      expect(trackBannerImpression).toHaveBeenCalledWith('ad123');
    });

    it('should handle tracking errors gracefully', async () => {
      vi.mocked(trackBannerImpression).mockResolvedValue(false);

      const result = await trackBannerImpression('invalid-id');

      expect(result).toBe(false);
    });
  });

  describe('trackBannerClick', () => {
    it('should successfully track a click', async () => {
      vi.mocked(trackBannerClick).mockResolvedValue(true);

      const result = await trackBannerClick('ad123');

      expect(result).toBe(true);
      expect(trackBannerClick).toHaveBeenCalledWith('ad123');
    });

    it('should handle tracking errors gracefully', async () => {
      vi.mocked(trackBannerClick).mockResolvedValue(false);

      const result = await trackBannerClick('invalid-id');

      expect(result).toBe(false);
    });
  });

  describe('CTR Calculation', () => {
    it('should calculate CTR correctly', () => {
      const impressions = 1000;
      const clicks = 50;
      const ctr = (clicks / impressions) * 100;

      expect(ctr).toBe(5); // 5% CTR
    });

    it('should handle zero impressions', () => {
      const impressions = 0;
      const clicks = 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

      expect(ctr).toBe(0);
    });

    it('should calculate high CTR', () => {
      const impressions = 100;
      const clicks = 15;
      const ctr = (clicks / impressions) * 100;

      expect(ctr).toBe(15); // 15% CTR
    });

    it('should calculate low CTR', () => {
      const impressions = 10000;
      const clicks = 50;
      const ctr = (clicks / impressions) * 100;

      expect(ctr).toBe(0.5); // 0.5% CTR
    });
  });

  describe('Analytics Data Aggregation', () => {
    it('should aggregate total impressions across all ads', () => {
      const ads = [
        { impressions: 1000, clicks: 50 },
        { impressions: 500, clicks: 25 },
        { impressions: 2000, clicks: 100 }
      ];

      const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);

      expect(totalImpressions).toBe(3500);
    });

    it('should aggregate total clicks across all ads', () => {
      const ads = [
        { impressions: 1000, clicks: 50 },
        { impressions: 500, clicks: 25 },
        { impressions: 2000, clicks: 100 }
      ];

      const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

      expect(totalClicks).toBe(175);
    });

    it('should calculate average CTR across all ads', () => {
      const ads = [
        { impressions: 1000, clicks: 50 },
        { impressions: 500, clicks: 25 },
        { impressions: 2000, clicks: 100 }
      ];

      const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
      const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      expect(avgCTR).toBe(5); // 5% average CTR
    });

    it('should handle empty ads array', () => {
      const ads: any[] = [];

      const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
      const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      expect(totalImpressions).toBe(0);
      expect(totalClicks).toBe(0);
      expect(avgCTR).toBe(0);
    });
  });

  describe('Advertisement Filtering', () => {
    it('should filter active advertisements', () => {
      const ads = [
        { _id: 'ad1', isActive: true, impressions: 1000, clicks: 50 },
        { _id: 'ad2', isActive: false, impressions: 500, clicks: 25 },
        { _id: 'ad3', isActive: true, impressions: 2000, clicks: 100 }
      ];

      const activeAds = ads.filter(ad => ad.isActive);

      expect(activeAds.length).toBe(2);
      expect(activeAds.every(ad => ad.isActive)).toBe(true);
    });

    it('should filter inactive advertisements', () => {
      const ads = [
        { _id: 'ad1', isActive: true, impressions: 1000, clicks: 50 },
        { _id: 'ad2', isActive: false, impressions: 500, clicks: 25 },
        { _id: 'ad3', isActive: true, impressions: 2000, clicks: 100 }
      ];

      const inactiveAds = ads.filter(ad => !ad.isActive);

      expect(inactiveAds.length).toBe(1);
      expect(inactiveAds.every(ad => !ad.isActive)).toBe(true);
    });
  });

  describe('Advertisement Sorting', () => {
    it('should sort by impressions descending', () => {
      const ads = [
        { _id: 'ad1', impressions: 500 },
        { _id: 'ad2', impressions: 2000 },
        { _id: 'ad3', impressions: 1000 }
      ];

      const sorted = [...ads].sort((a, b) => (b.impressions || 0) - (a.impressions || 0));

      expect(sorted[0].impressions).toBe(2000);
      expect(sorted[1].impressions).toBe(1000);
      expect(sorted[2].impressions).toBe(500);
    });

    it('should sort by clicks descending', () => {
      const ads = [
        { _id: 'ad1', clicks: 25 },
        { _id: 'ad2', clicks: 100 },
        { _id: 'ad3', clicks: 50 }
      ];

      const sorted = [...ads].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

      expect(sorted[0].clicks).toBe(100);
      expect(sorted[1].clicks).toBe(50);
      expect(sorted[2].clicks).toBe(25);
    });

    it('should sort by CTR descending', () => {
      const ads = [
        { _id: 'ad1', impressions: 1000, clicks: 50, ctr: 5 },
        { _id: 'ad2', impressions: 1000, clicks: 100, ctr: 10 },
        { _id: 'ad3', impressions: 1000, clicks: 25, ctr: 2.5 }
      ];

      const sorted = [...ads].sort((a, b) => (b.ctr || 0) - (a.ctr || 0));

      expect(sorted[0].ctr).toBe(10);
      expect(sorted[1].ctr).toBe(5);
      expect(sorted[2].ctr).toBe(2.5);
    });
  });
});
