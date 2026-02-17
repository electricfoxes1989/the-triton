#!/usr/bin/env node
/**
 * Test fix for 12 articles: link authors, add hero images, fill missing body content
 */
import { createClient } from '@sanity/client';
import 'dotenv/config';

const sanity = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '48r6hh2o',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const TEST_SLUGS = [
  'lithium-fire-guard-offers-lithium-fire-containment-solution-for-yachts',
  'bluewater-launches-2025-photo-competition',
  'evac-group-launches-new-sustainable-waste-management-solution-for-superyachts',
  'resolve-academy-hosts-2025-damage-control-olympics',
  'meet-the-triton-acrew-and-yatco-team',
  'svalbard-tightens-eco-regulations',
  'former-crewmember-creates-yacht-recruitment-app',
  'wacky-news-in-the-maritime-world',
  'yacht-crew-careers-through-the-ages',
  'ai-in-yachting-the-rise-of-smart-yachts',
  'navigating-health-insurance-for-yacht-crew',
  'z11-electric-tender-takes-a-big-step',
];

// Get all existing authors from Sanity
async function getAuthorMap() {
  const authors = await sanity.fetch('*[_type=="author"]{_id, name, "slug": slug.current}');
  const map = {};
  for (const a of authors) {
    map[a.name.toLowerCase().trim()] = a._id;
  }
  return { map, authors };
}

// Create author if doesn't exist
async function ensureAuthor(name, authorMap) {
  const key = name.toLowerCase().trim();
  if (authorMap[key]) return authorMap[key];
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const doc = {
    _type: 'author',
    name: name,
    slug: { _type: 'slug', current: slug },
  };
  const created = await sanity.create(doc);
  authorMap[key] = created._id;
  console.log(`  Created new author: ${name} (${created._id})`);
  return created._id;
}

// Upload image to Sanity
async function uploadImage(imageUrl) {
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) { console.log(`  Image fetch failed (${response.status}): ${imageUrl}`); return null; }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const filename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
    const asset = await sanity.assets.upload('image', buffer, { filename, contentType });
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  } catch (e) {
    console.log(`  Image upload error: ${e.message}`);
    return null;
  }
}

// Convert HTML to Portable Text blocks, preserving inline images
function htmlToPortableText(html) {
  if (!html) return [];
  const blocks = [];
  
  // Split by block-level elements
  const parts = html.split(/<\/?(?:p|div|h[1-6]|blockquote|ul|ol|li|figure|figcaption)[^>]*>/gi);
  
  // Also extract images
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  
  // Process the full HTML preserving order
  const segments = [];
  let lastIndex = 0;
  const fullRegex = /<(p|h[1-6]|blockquote|figure|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  
  // Simple approach: split by paragraphs and images
  const lines = html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, (m) => {
      const imgMatch = m.match(/src=["']([^"']+)["']/);
      return imgMatch ? `\n[[IMG:${imgMatch[1]}]]\n` : '';
    })
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, '\n[[IMG:$1]]\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .split('\n');
  
  const inlineImages = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const imgMatch = trimmed.match(/^\[\[IMG:(.+)\]\]$/);
    if (imgMatch) {
      inlineImages.push(imgMatch[1]);
      // Add placeholder block that we'll replace later
      blocks.push({
        _type: 'block',
        _key: 'img_' + inlineImages.length,
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's' + blocks.length, text: `[IMAGE: ${imgMatch[1]}]`, marks: [] }],
      });
    } else {
      blocks.push({
        _type: 'block',
        _key: 'b' + blocks.length,
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's' + blocks.length, text: trimmed, marks: [] }],
      });
    }
  }
  
  return { blocks, inlineImages };
}

// Fetch article data from WP by slug
async function fetchFromWP(slug) {
  try {
    const url = `https://www.the-triton.com/wp-json/wp/v2/posts?slug=${slug}&_embed`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    if (!data[0]) return null;
    return data[0];
  } catch (e) {
    console.log(`  WP fetch error for ${slug}: ${e.message}`);
    return null;
  }
}

// Get author name from the article HTML page (Yoast JSON-LD)
async function getAuthorFromPage(wpPost) {
  try {
    // Try getting from the rendered page's JSON-LD
    const yoast = wpPost.yoast_head_json;
    if (yoast?.schema?.['@graph']) {
      const person = yoast.schema['@graph'].find(g => g['@type'] === 'Person');
      if (person?.name) return person.name;
    }
    // Fallback: scrape the page
    const link = wpPost.link;
    if (link) {
      const res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const ldMatch = html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
      if (ldMatch) {
        const ld = JSON.parse(ldMatch[1]);
        const person = ld['@graph']?.find(g => g['@type'] === 'Person');
        if (person?.name) return person.name;
      }
    }
  } catch (e) {}
  return null;
}

async function main() {
  console.log('=== Test Fix: 12 Articles ===\n');
  
  const { map: authorMap } = await getAuthorMap();
  console.log(`Loaded ${Object.keys(authorMap).length} existing authors\n`);
  
  const results = [];
  
  for (const slug of TEST_SLUGS) {
    console.log(`\n--- Processing: ${slug} ---`);
    
    // Get Sanity doc
    const sanityDoc = await sanity.fetch(
      '*[_type=="article" && slug.current==$slug][0]{_id, title, "hasBody": defined(body) && length(body)>0, "hasHero": defined(heroImage), "hasAuthor": defined(author)}',
      { slug }
    );
    
    if (!sanityDoc) {
      console.log('  NOT FOUND in Sanity, skipping');
      results.push({ slug, status: 'not_found' });
      continue;
    }
    
    console.log(`  Sanity ID: ${sanityDoc._id}`);
    console.log(`  Has body: ${sanityDoc.hasBody}, Has hero: ${sanityDoc.hasHero}, Has author: ${sanityDoc.hasAuthor}`);
    
    // Fetch from WP
    const wpPost = await fetchFromWP(slug);
    if (!wpPost) {
      console.log('  NOT FOUND on WP API, skipping');
      results.push({ slug, status: 'wp_not_found' });
      continue;
    }
    
    const patch = {};
    
    // 1. Author
    const authorName = await getAuthorFromPage(wpPost);
    if (authorName) {
      console.log(`  Author: ${authorName}`);
      const authorId = await ensureAuthor(authorName, authorMap);
      patch.author = { _type: 'reference', _ref: authorId };
    } else {
      console.log('  Author: not found');
    }
    
    // 2. Hero image
    const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
    const heroUrl = featuredMedia?.source_url;
    if (heroUrl) {
      console.log(`  Hero image: ${heroUrl}`);
      const heroAsset = await uploadImage(heroUrl);
      if (heroAsset) {
        patch.heroImage = heroAsset;
        console.log('  Hero uploaded ✓');
      }
    } else {
      console.log('  No hero image in WP');
    }
    
    // 3. Body content (if missing)
    if (!sanityDoc.hasBody && wpPost.content?.rendered) {
      console.log(`  Filling body content (${wpPost.content.rendered.length} chars HTML)`);
      const { blocks, inlineImages } = htmlToPortableText(wpPost.content.rendered);
      
      // Upload inline images (but keep as text references for now — Sanity portable text image blocks need special handling)
      if (inlineImages.length > 0) {
        console.log(`  Found ${inlineImages.length} inline images`);
        for (const imgUrl of inlineImages) {
          // Filter out ads/tracking pixels/tiny images
          if (imgUrl.includes('pixel') || imgUrl.includes('tracking') || imgUrl.includes('ad-') || imgUrl.includes('banner')) {
            console.log(`  Skipping ad/tracking image: ${imgUrl}`);
            continue;
          }
          console.log(`  Inline image: ${imgUrl}`);
        }
      }
      
      patch.body = blocks;
    } else if (sanityDoc.hasBody) {
      console.log('  Body already exists');
    }
    
    // 4. Excerpt
    if (wpPost.excerpt?.rendered) {
      const excerpt = wpPost.excerpt.rendered.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim();
      if (excerpt) patch.excerpt = excerpt.slice(0, 300);
    }
    
    // 5. Published date
    if (wpPost.date) {
      patch.publishedAt = wpPost.date;
    }
    
    // Apply patch
    if (Object.keys(patch).length > 0) {
      await sanity.patch(sanityDoc._id).set(patch).commit();
      console.log(`  ✓ Patched: ${Object.keys(patch).join(', ')}`);
    } else {
      console.log('  Nothing to patch');
    }
    
    results.push({ slug, status: 'ok', patched: Object.keys(patch) });
    
    // Small delay to be nice to APIs
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n\n=== RESULTS ===');
  for (const r of results) {
    console.log(`${r.status === 'ok' ? '✓' : '✗'} ${r.slug} — ${r.status}${r.patched ? ` (${r.patched.join(', ')})` : ''}`);
  }
  console.log('\nDone! Check these on http://localhost:3000/article/<slug>');
}

main().catch(e => { console.error(e); process.exit(1); });
