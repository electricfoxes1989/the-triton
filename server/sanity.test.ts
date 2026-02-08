import { describe, expect, it } from "vitest";
import { createClient } from '@sanity/client';

describe("Sanity CMS Connection", () => {
  it("should connect to Sanity and fetch project info", async () => {
    const client = createClient({
      projectId: process.env.VITE_SANITY_PROJECT_ID,
      dataset: process.env.VITE_SANITY_DATASET,
      useCdn: false,
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
    });

    // Test basic connectivity by fetching a simple query
    const result = await client.fetch(`count(*[_type == "article"])`);
    
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("should fetch articles from Sanity", async () => {
    const client = createClient({
      projectId: process.env.VITE_SANITY_PROJECT_ID,
      dataset: process.env.VITE_SANITY_DATASET,
      useCdn: false,
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
    });

    const articles = await client.fetch(`
      *[_type == "article"] | order(publishedAt desc) [0...5] {
        _id,
        title,
        slug
      }
    `);
    
    expect(Array.isArray(articles)).toBe(true);
  });
});
