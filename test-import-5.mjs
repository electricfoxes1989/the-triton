#!/usr/bin/env node
/**
 * Careful test import of 5 articles with:
 * - Full body text as Portable Text
 * - Inline images uploaded to Sanity
 * - Hero/featured image uploaded to Sanity
 * - Real author from WP author map
 * - Real category from WP category data
 */
import { createClient } from '@sanity/client';
import fs from 'fs';

const SANITY_TOKEN = 'skPOTfGUvSoRQcoIDG2aUgY5IZ3LxRZgUyE8wjGyYD6f48l0twVYbenDvKqKeuxW5is1wtV09I2qBN6vMcp78HDGuNcw7Uzod64EjV8Mla9BCAHC4NkgmAAsSr92nfCsBpvOSKFGpJ3yH2tNcBQyBzUF1T8o1o8yzR7CGF5O0g5qRgZGerSd';
const sanity = createClient({ projectId: '48r6hh2o', dataset: 'production', token: SANITY_TOKEN, apiVersion: '2024-01-01', useCdn: false });
const WP_API = 'https://www.the-triton.com/wp-json/wp/v2';

// Load author map
const wpAuthorMap = JSON.parse(fs.readFileSync('wp-author-map.json', 'utf8'));

// ── WP Category → Sanity Category Mapping ──
// Based on the WP category hierarchy analysis
const WP_CAT_TO_SANITY = {
  // *News section and children
  214: 'news', 249: 'news', 307: 'news', 210: 'news', 248: 'news', 251: 'news', 250: 'news', 216: 'news',
  3026: 'news', 3027: 'news', // Headlines, Other News
  218: 'news',  // Obituaries
  2947: 'news', // Press Releases
  2984: 'news', // Sponsored Content
  253: 'news',  // Triton Exclusives
  
  // *Crew Life section and children
  2918: 'crew-life', 655: 'crew-life', 290: 'crew-life', 292: 'crew-life', 256: 'crew-life', 234: 'crew-life', 1098: 'crew-life', 212: 'crew-life', 235: 'crew-life',
  3029: 'crew-life', // Crew Corner
  
  // *Work section and children → crew-life
  2917: 'crew-life', 1033: 'crew-life', 1047: 'crew-life', 223: 'crew-life', 226: 'crew-life', 232: 'crew-life', 233: 'crew-life', 1100: 'crew-life',
  208: 'crew-life', 1101: 'crew-life', 1099: 'crew-life', 1097: 'crew-life', 1094: 'crew-life', 204: 'crew-life', 547: 'crew-life', 230: 'crew-life',
  1032: 'crew-life', 621: 'crew-life', 227: 'crew-life', 209: 'crew-life', 700: 'crew-life', 231: 'crew-life', 238: 'crew-life',
  2841: 'crew-life', 2842: 'crew-life', 2845: 'crew-life', 2839: 'crew-life', 2840: 'crew-life', 2844: 'crew-life', 2945: 'crew-life',
  291: 'crew-life', // Engineer's Angle
  
  // Captains
  2944: 'captains',
  215: 'captains', // From the Bridge
  2981: 'captains', 2982: 'captains', // Cover Story, From the Bridge Features
  
  // *Destinations section and children
  2915: 'destinations', 2815: 'destinations', 2812: 'destinations', 2819: 'destinations', 2820: 'destinations',
  2824: 'destinations', 2825: 'destinations', 2823: 'destinations', 2821: 'destinations', 206: 'destinations',
  2836: 'destinations', 2828: 'destinations', 2814: 'destinations', 2835: 'destinations', 2826: 'destinations',
  2827: 'destinations', 2818: 'destinations', 2813: 'destinations', 2829: 'destinations', 2832: 'destinations',
  2834: 'destinations', 3023: 'destinations', 2816: 'destinations', 2817: 'destinations', 2833: 'destinations', 2831: 'destinations',
  2986: 'destinations', // Hidden Gems
  203: 'destinations', // Where in the World
  
  // *Events section and children
  2920: 'events', 244: 'events', 245: 'events', 33: 'events', 222: 'events', 246: 'events',
  
  // *Good Galley → crew-life (cooking/galley content)
  2942: 'crew-life', 2977: 'crew-life',
  2951: 'crew-life', // Chefs
  
  // Stew Cues → crew-life  
  225: 'crew-life', 2979: 'crew-life',
  
  // Ask Bugsy → crew-life
  2949: 'crew-life', 2978: 'crew-life',
  
  // What the Deck → crew-life
  2948: 'crew-life', 2980: 'crew-life',
  
  // Fleet Friday → news
  3267: 'news',
  
  // Magazine-related
  2924: 'magazine', // Issuu PDF Posts
  3010: 'magazine', // Cover Stories Features
  
  // Expos
  // (Triton Expo is under events: 222)
  
  // Tech/Equipment/Training → news (general)
  207: 'news', 2872: 'news', 3021: 'news',
  2800: 'news', 2780: 'news', 211: 'news',
};

function mapWpCatsToSanity(wpCatIds) {
  // Priority order: specific categories first
  const priorityOrder = ['captains', 'crew-life', 'events', 'destinations', 'magazine', 'expos', 'galleries', 'news'];
  const found = new Set();
  
  for (const id of wpCatIds || []) {
    const mapped = WP_CAT_TO_SANITY[id];
    if (mapped) found.add(mapped);
  }
  
  // Return the most specific category
  for (const cat of priorityOrder) {
    if (found.has(cat)) return `category-${cat}`;
  }
  return 'category-news'; // fallback
}

// ── HTML Entity Decoder ──
function decodeHtml(s) {
  if (!s) return '';
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&#038;/g, '&')
    .replace(/&#8217;/g, '\u2019').replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201C').replace(/&#8221;/g, '\u201D')
    .replace(/&#8212;/g, '\u2014').replace(/&#8211;/g, '\u2013')
    .replace(/&#8230;/g, '\u2026').replace(/&hellip;/g, '\u2026')
    .replace(/&rdquo;/g, '\u201D').replace(/&ldquo;/g, '\u201C')
    .replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018')
    .replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, m => String.fromCharCode(parseInt(m.slice(2, -1))))
    .trim();
}

// ── Upload image to Sanity ──
async function uploadImageToSanity(imageUrl) {
  if (!imageUrl) return null;
  console.log(`    Uploading image: ${imageUrl.split('/').pop().slice(0, 60)}...`);
  try {
    const res = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (!res.ok) { console.log(`    ✗ HTTP ${res.status}`); return null; }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) { console.log(`    ✗ Too small (${buf.length} bytes)`); return null; }
    const ct = res.headers.get('content-type') || 'image/jpeg';
    const fn = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
    const asset = await sanity.assets.upload('image', buf, { filename: fn, contentType: ct });
    console.log(`    ✓ Uploaded: ${asset._id}`);
    return asset;
  } catch (e) {
    console.log(`    ✗ Error: ${e.message}`);
    return null;
  }
}

// ── HTML → Portable Text with inline images ──
async function htmlToPortableText(html) {
  if (!html) return [];
  const blocks = [];
  
  // Split HTML into meaningful segments
  // We need to handle: <p>, <h2>-<h6>, <blockquote>, <img>, <figure>
  const segments = [];
  let remaining = html;
  
  // Regex to find block-level elements and images
  const blockRegex = /<(p|h[1-6]|blockquote|figure|img|ul|ol|li)(\s[^>]*)?\/?>([\s\S]*?)<\/\1>|<img\s[^>]*\/?>/gi;
  
  let lastIndex = 0;
  // Simpler approach: split by closing block tags and process each
  
  // Actually, let's use a more robust approach: iterate through the HTML and extract blocks
  const parts = html.split(/(<\/?(?:p|h[1-6]|blockquote|figure|figcaption|ul|ol|li|div|img)[^>]*\/?>)/gi);
  
  let currentText = '';
  let currentStyle = 'normal';
  let inFigure = false;
  let inBlockquote = false;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Check if this is an img tag (self-closing)
    const imgMatch = part.match(/<img\s[^>]*src=["']([^"']+)["'][^>]*\/?>/i);
    if (imgMatch) {
      // First, flush any text we've accumulated
      const text = decodeHtml(currentText);
      if (text) {
        blocks.push(makeTextBlock(text, currentStyle));
        currentText = '';
      }
      
      // Upload this image and add as image block
      const imgSrc = imgMatch[1];
      // Skip tiny tracking pixels, logos, etc
      if (!imgSrc.includes('pixel') && !imgSrc.includes('tracking') && !imgSrc.includes('logo')) {
        const asset = await uploadImageToSanity(imgSrc);
        if (asset) {
          // Get alt text
          const altMatch = part.match(/alt=["']([^"']*)["']/i);
          const alt = altMatch ? decodeHtml(altMatch[1]) : '';
          
          blocks.push({
            _type: 'image',
            _key: randomKey(),
            asset: { _type: 'reference', _ref: asset._id },
            ...(alt ? { alt } : {}),
          });
        }
      }
      continue;
    }
    
    const tagMatch = part.match(/^<(\/?)(\w+)/i);
    if (tagMatch) {
      const [, isClose, tag] = tagMatch;
      const lt = tag.toLowerCase();
      
      if (isClose) {
        // Closing tag — flush accumulated text
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'div'].includes(lt)) {
          const text = decodeHtml(currentText);
          if (text) {
            let style = 'normal';
            if (/^h[1-6]$/.test(lt)) style = lt;
            else if (lt === 'blockquote' || inBlockquote) style = 'blockquote';
            blocks.push(makeTextBlock(text, style));
          }
          currentText = '';
          if (lt === 'blockquote') inBlockquote = false;
        } else if (lt === 'figure') {
          inFigure = false;
        }
      } else {
        // Opening tag
        if (lt === 'blockquote') inBlockquote = true;
        if (lt === 'figure') inFigure = true;
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(lt)) {
          currentText = '';
          currentStyle = /^h[1-6]$/.test(lt) ? lt : 'normal';
        }
      }
    } else {
      // Text content
      currentText += part;
    }
  }
  
  // Flush remaining
  const text = decodeHtml(currentText);
  if (text) {
    blocks.push(makeTextBlock(text, 'normal'));
  }
  
  return blocks;
}

function makeTextBlock(text, style) {
  return {
    _type: 'block',
    _key: randomKey(),
    style: style || 'normal',
    markDefs: [],
    children: [{
      _type: 'span',
      _key: randomKey(),
      marks: [],
      text,
    }],
  };
}

function randomKey() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Get or create author ──
const authorCache = {};
async function getOrCreateAuthor(name) {
  if (!name || name === 'NOT FOUND') return null;
  // Decode HTML entities in author name
  name = name.replace(/&amp;/g, '&');
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (authorCache[slug]) return authorCache[slug];
  
  // Check if exists in Sanity
  const existing = await sanity.fetch('*[_type=="author" && slug.current==$slug][0]._id', { slug });
  if (existing) {
    authorCache[slug] = existing;
    return existing;
  }
  
  // Create new author
  const doc = await sanity.create({
    _type: 'author',
    name,
    slug: { _type: 'slug', current: slug },
    bio: '',
  });
  console.log(`  Created author: ${name} (${doc._id})`);
  authorCache[slug] = doc._id;
  return doc._id;
}

// ── Fetch featured image URL from WP media endpoint ──
async function fetchFeaturedImageUrl(mediaId) {
  if (!mediaId || mediaId === 0) return null;
  try {
    const r = await fetch(`${WP_API}/media/${mediaId}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) return null;
    const m = await r.json();
    return m.source_url || null;
  } catch { return null; }
}

// ── Main ──
async function main() {
  // 5 test articles chosen for variety:
  // 1. cocaine-smuggling... → news, Kevin Maher, 2 inline images, has hero
  // 2. transition-tips... → crew-life/cover story, Chief Stew Julie Emmons, 2 inline images
  // 3. the-invisible-stew... → crew-life/cover story, Kendall Shafer, 3 inline images
  // 4. new-yachting-regulations-for-2026 → captains (From the Bridge), Capt. Jake DesVergers, no inline images
  // 5. a-modern-circumnavigation-oyster-world-rally → news, Kevin Maher, 6 inline images
  
  const testSlugs = [
    'cocaine-smuggling-yachts-busted-off-fort-lauderdale',
    'transition-tips-from-sole-stew-to-chief-stew',
    'the-invisible-stew-mistakes-green-crew-make',
    'new-yachting-regulations-for-2026',
    'a-modern-circumnavigation-oyster-world-rally',
  ];
  
  console.log('=== Test Import: 5 Articles ===\n');
  
  // First, delete existing versions of these articles
  for (const slug of testSlugs) {
    const existing = await sanity.fetch('*[_type=="article" && slug.current==$slug][0]._id', { slug });
    if (existing) {
      await sanity.delete(existing);
      console.log(`Deleted existing: ${slug}`);
    }
  }
  
  // Fetch the 5 articles from WP API
  for (const slug of testSlugs) {
    console.log(`\n━━━ Importing: ${slug} ━━━`);
    
    const posts = await (await fetch(`${WP_API}/posts?slug=${slug}&_fields=slug,title,date,excerpt,content,author,categories,featured_media`, 
      { headers: { 'User-Agent': 'Mozilla/5.0' } })).json();
    
    if (!posts.length) {
      console.log('  ✗ Not found in WP API!');
      continue;
    }
    
    const wp = posts[0];
    const title = decodeHtml(wp.title?.rendered);
    const excerpt = decodeHtml(wp.excerpt?.rendered);
    const publishedAt = wp.date;
    
    console.log(`  Title: ${title}`);
    console.log(`  Date: ${publishedAt}`);
    console.log(`  WP Author ID: ${wp.author}`);
    console.log(`  WP Categories: ${wp.categories}`);
    
    // 1. Resolve author
    const authorName = wpAuthorMap[String(wp.author)];
    console.log(`  Author name: ${authorName}`);
    const authorId = await getOrCreateAuthor(authorName);
    
    // 2. Resolve category
    const sanityCatId = mapWpCatsToSanity(wp.categories);
    console.log(`  Sanity category: ${sanityCatId}`);
    
    // 3. Fetch and upload hero/featured image
    console.log(`  Featured media ID: ${wp.featured_media}`);
    const heroUrl = await fetchFeaturedImageUrl(wp.featured_media);
    console.log(`  Hero image URL: ${heroUrl || 'NONE'}`);
    
    let mainImage = null;
    if (heroUrl) {
      const asset = await uploadImageToSanity(heroUrl);
      if (asset) {
        mainImage = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
      }
    }
    
    // 4. Parse body with inline images
    console.log(`  Parsing body HTML (${wp.content?.rendered?.length} chars)...`);
    const body = await htmlToPortableText(wp.content?.rendered);
    const textBlocks = body.filter(b => b._type === 'block');
    const imageBlocks = body.filter(b => b._type === 'image');
    console.log(`  → ${textBlocks.length} text blocks, ${imageBlocks.length} image blocks`);
    
    // 5. Create the article
    const doc = await sanity.create({
      _type: 'article',
      title,
      slug: { _type: 'slug', current: slug },
      excerpt,
      publishedAt,
      body,
      category: { _type: 'reference', _ref: sanityCatId },
      ...(authorId ? { author: { _type: 'reference', _ref: authorId } } : {}),
      ...(mainImage ? { mainImage } : {}),
      heroImageUrl: heroUrl || '',
    });
    
    console.log(`  ✓ Created: ${doc._id}`);
    console.log(`  ✓ Title: ${title}`);
    console.log(`  ✓ Author: ${authorName}`);
    console.log(`  ✓ Category: ${sanityCatId}`);
    console.log(`  ✓ Hero image: ${mainImage ? 'YES' : 'NO (using heroImageUrl)'}`);
    console.log(`  ✓ Body: ${textBlocks.length} paragraphs, ${imageBlocks.length} inline images`);
  }
  
  console.log('\n=== Test Import Complete ===');
  console.log('Check these articles on the dev site at /article/<slug>');
}

main().catch(console.error);
