#!/usr/bin/env node
/**
 * Scrape last 100 articles from the-triton.com via WP REST API
 * and import them into Sanity CMS (48r6hh2o)
 */
import { createClient } from '@sanity/client';
import https from 'https';
import http from 'http';
import fs from 'fs';

const SANITY_PROJECT_ID = '48r6hh2o';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || 'skPOTfGUvSoRQcoIDG2aUgY5IZ3LxRZgUyE8wjGyYD6f48l0twVYbenDvKqKeuxW5is1wtV09I2qBN6vMcp78HDGuNcw7Uzod64EjV8Mla9BCAHC4NkgmAAsSr92nfCsBpvOSKFGpJ3yH2tNcBQyBzUF1T8o1o8yzR7CGF5O0g5qRgZGerSd';

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Fetch JSON from URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

// Download image and upload to Sanity
async function uploadImageToSanity(imageUrl) {
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const filename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
    const asset = await sanity.assets.upload('image', buffer, { filename, contentType });
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  } catch (e) {
    console.error(`  Image upload failed for ${imageUrl}: ${e.message}`);
    return null;
  }
}

// Convert HTML to Portable Text blocks
function htmlToPortableText(html) {
  if (!html) return [];
  const blocks = [];
  
  // Strip tags helper
  const strip = (s) => s.replace(/<[^>]+>/g, '').trim();
  
  // Split by paragraphs and headings
  const parts = html.split(/(<\/?(?:p|h[2-6]|blockquote|ul|ol|li|figure|figcaption|img)[^>]*>)/gi);
  
  let currentTag = 'p';
  let buffer = '';
  
  for (const part of parts) {
    const tagMatch = part.match(/^<(\/?)(\w+)/i);
    if (tagMatch) {
      const [, isClose, tag] = tagMatch;
      const lowerTag = tag.toLowerCase();
      
      if (isClose) {
        const text = strip(buffer).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8212;/g, '—').replace(/&#8211;/g, '–').replace(/&nbsp;/g, ' ');
        if (text) {
          let style = 'normal';
          if (lowerTag === 'h2') style = 'h2';
          else if (lowerTag === 'h3') style = 'h3';
          else if (lowerTag === 'h4') style = 'h4';
          else if (lowerTag === 'blockquote') style = 'blockquote';
          
          blocks.push({
            _type: 'block',
            _key: Math.random().toString(36).slice(2, 10),
            style,
            markDefs: [],
            children: [{
              _type: 'span',
              _key: Math.random().toString(36).slice(2, 10),
              marks: [],
              text,
            }],
          });
        }
        buffer = '';
      } else {
        currentTag = lowerTag;
        buffer = '';
      }
    } else {
      buffer += part;
    }
  }
  
  // Catch any remaining text
  const remaining = strip(buffer).replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8212;/g, '—').replace(/&nbsp;/g, ' ');
  if (remaining) {
    blocks.push({
      _type: 'block',
      _key: Math.random().toString(36).slice(2, 10),
      style: 'normal',
      markDefs: [],
      children: [{
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        marks: [],
        text: remaining,
      }],
    });
  }
  
  return blocks;
}

// Map WP categories to our Sanity category slugs
function mapCategory(wpCategories) {
  // WP category IDs from the-triton.com (we'll determine these dynamically)
  // Default to 'news'
  return 'news';
}

async function main() {
  console.log('=== The Triton Scrape & Import ===\n');
  
  // Step 1: Fetch WP categories
  console.log('1. Fetching WP categories...');
  const wpCats = await fetchJSON('https://www.the-triton.com/wp-json/wp/v2/categories?per_page=50');
  const catMap = {};
  for (const cat of wpCats) {
    catMap[cat.id] = { name: cat.name, slug: cat.slug };
    console.log(`   Cat ${cat.id}: ${cat.name} (${cat.slug})`);
  }
  
  // Step 2: Fetch last 100 articles from WP API
  console.log('\n2. Fetching last 100 articles...');
  const articles = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await fetchJSON(`https://www.the-triton.com/wp-json/wp/v2/posts?per_page=10&page=${page}&_fields=id,title,slug,date,excerpt,content,categories,featured_media,_embedded&_embed`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    articles.push(...batch);
    console.log(`   Page ${page}: ${batch.length} articles (total: ${articles.length})`);
    if (articles.length >= 100) break;
  }
  console.log(`   Total fetched: ${articles.length}`);
  
  // Save raw data
  fs.writeFileSync('/tmp/triton-scraped.json', JSON.stringify(articles, null, 2));
  console.log('   Saved raw data to /tmp/triton-scraped.json');
  
  // Step 3: Get existing Sanity categories
  console.log('\n3. Fetching Sanity categories...');
  const sanityCats = await sanity.fetch('*[_type=="category"]{_id, title, slug}');
  const sanityCatMap = {};
  for (const c of sanityCats) {
    const s = typeof c.slug === 'string' ? c.slug : c.slug?.current;
    sanityCatMap[s] = c._id;
    console.log(`   Sanity cat: ${c.title} → ${c._id}`);
  }
  
  // Map WP cat slugs to Sanity cat IDs
  function getSanityCatId(wpCatIds) {
    for (const id of wpCatIds || []) {
      const wpCat = catMap[id];
      if (!wpCat) continue;
      // Map WP slug to our Sanity slugs
      const slug = wpCat.slug.toLowerCase();
      if (slug.includes('crew') || slug.includes('stew') || slug.includes('chef') || slug.includes('deckhand') || slug.includes('engineer')) return sanityCatMap['crew-life'];
      if (slug.includes('captain')) return sanityCatMap['captains'];
      if (slug.includes('event') || slug.includes('show')) return sanityCatMap['events'];
      if (slug.includes('destination')) return sanityCatMap['destinations'];
      if (slug.includes('gallery') || slug.includes('photo')) return sanityCatMap['galleries'];
      if (slug.includes('expo')) return sanityCatMap['expos'];
      if (slug.includes('magazine')) return sanityCatMap['magazine'];
    }
    return sanityCatMap['news']; // default
  }
  
  // Step 4: Get/create authors
  console.log('\n4. Processing authors...');
  const authorCache = {};
  
  async function getOrCreateAuthor(name) {
    if (!name) return null;
    if (authorCache[name]) return authorCache[name];
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const existing = await sanity.fetch('*[_type=="author" && slug.current==$slug][0]._id', { slug });
    if (existing) {
      authorCache[name] = existing;
      return existing;
    }
    
    const doc = await sanity.create({
      _type: 'author',
      name,
      slug: { _type: 'slug', current: slug },
      bio: '',
    });
    authorCache[name] = doc._id;
    console.log(`   Created author: ${name}`);
    return doc._id;
  }
  
  // Step 5: Delete old articles from Sanity that we'll be replacing
  console.log('\n5. Cleaning old data...');
  // Delete all existing articles to start fresh
  const oldArticles = await sanity.fetch('*[_type=="article"]._id');
  console.log(`   Found ${oldArticles.length} old articles to delete`);
  const batchSize = 50;
  for (let i = 0; i < oldArticles.length; i += batchSize) {
    const batch = oldArticles.slice(i, i + batchSize);
    let tx = sanity.transaction();
    for (const id of batch) {
      tx = tx.delete(id);
    }
    await tx.commit();
    console.log(`   Deleted ${Math.min(i + batchSize, oldArticles.length)}/${oldArticles.length}`);
  }
  
  // Step 6: Import articles
  console.log('\n6. Importing articles...');
  let imported = 0;
  let failed = 0;
  
  for (const wp of articles) {
    try {
      const title = wp.title?.rendered?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—');
      const excerpt = wp.excerpt?.rendered?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').trim();
      const body = htmlToPortableText(wp.content?.rendered);
      
      // Get author from embedded data
      let authorName = null;
      if (wp._embedded?.author?.[0]?.name) {
        authorName = wp._embedded.author[0].name;
      }
      const authorId = await getOrCreateAuthor(authorName);
      
      // Get featured image from embedded data
      let mainImage = null;
      const featMedia = wp._embedded?.['wp:featuredmedia']?.[0];
      const imageUrl = featMedia?.source_url || featMedia?.media_details?.sizes?.large?.source_url || featMedia?.media_details?.sizes?.full?.source_url;
      if (imageUrl) {
        console.log(`   Uploading image for: ${title.slice(0, 50)}...`);
        mainImage = await uploadImageToSanity(imageUrl);
      }
      
      // Get category
      const catId = getSanityCatId(wp.categories);
      
      const doc = {
        _type: 'article',
        title,
        slug: { _type: 'slug', current: wp.slug },
        excerpt,
        publishedAt: wp.date,
        body,
        category: catId ? { _type: 'reference', _ref: catId } : undefined,
        author: authorId ? { _type: 'reference', _ref: authorId } : undefined,
        mainImage,
        // Also store heroImageUrl for backward compat
        heroImageUrl: imageUrl || '',
      };
      
      await sanity.create(doc);
      imported++;
      console.log(`   ✓ ${imported}/${articles.length}: ${title.slice(0, 60)}`);
    } catch (e) {
      failed++;
      console.error(`   ✗ Failed: ${wp.title?.rendered?.slice(0, 50)} — ${e.message}`);
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Imported: ${imported}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total in Sanity: ${await sanity.fetch('count(*[_type=="article"])')}`);
}

main().catch(console.error);
