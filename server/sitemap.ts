import { Router } from 'express';
import { createClient } from '@sanity/client';

const router = Router();

const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: process.env.VITE_SANITY_DATASET!,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Fetch all published articles
    const articles = await sanityClient.fetch(`
      *[_type == "article"] {
        "slug": slug.current,
        publishedAt,
        _updatedAt
      }
    `);

    // Fetch all categories
    const categories = await sanityClient.fetch(`
      *[_type == "category"] {
        "slug": slug.current
      }
    `);

    // Fetch all tags
    const tags = await sanityClient.fetch(`
      *[_type == "tag"] {
        "slug": slug.current
      }
    `);

    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Articles
    articles.forEach((article: any) => {
      const lastmod = article._updatedAt || article.publishedAt;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/article/${article.slug}</loc>\n`;
      if (lastmod) xml += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Categories
    categories.forEach((category: any) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/category/${category.slug}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Tags
    tags.forEach((tag: any) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/tag/${tag.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    // Events page
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/events</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
