#!/usr/bin/env node
/**
 * Fix articles from 2022+: proper HTML→Portable Text with real image uploads
 */
import { createClient } from '@sanity/client';
import { nanoid } from 'nanoid';
import 'dotenv/config';

const sanity = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '48r6hh2o',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const key = () => nanoid(12);

// Upload image to Sanity, return asset reference
async function uploadImage(imageUrl) {
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 100) return null; // skip tiny/broken images
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const filename = decodeURIComponent(imageUrl.split('/').pop().split('?')[0] || 'image.jpg');
    const asset = await sanity.assets.upload('image', buffer, { filename, contentType });
    return asset._id;
  } catch (e) {
    console.log(`    IMG FAIL: ${e.message} — ${imageUrl.slice(0, 80)}`);
    return null;
  }
}

// Decode HTML entities
function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&bull;/g, '\u2022')
    .replace(/&copy;/g, '\u00A9')
    .replace(/&reg;/g, '\u00AE')
    .replace(/&trade;/g, '\u2122')
    .replace(/&deg;/g, '\u00B0');
}

// Strip HTML tags and decode entities
function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, '').trim());
}

// Parse inline formatting (bold, italic, links) from HTML into Sanity spans
function parseInlineContent(html, markDefs) {
  const spans = [];
  let remaining = html;
  
  // Regex to find inline elements
  const inlineRegex = /<(strong|b|em|i|a)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match;
  
  // Simple approach: strip to text but preserve structure
  // For now, just get clean text — we can add rich formatting later
  const text = stripTags(html);
  if (text) {
    spans.push({ _type: 'span', _key: key(), text, marks: [] });
  }
  return spans;
}

// Convert HTML to Portable Text blocks with real image uploads
async function htmlToPortableText(html) {
  if (!html) return { blocks: [], imageUrls: [] };
  
  const blocks = [];
  const imageUrls = [];
  
  // Tokenize HTML into block-level elements
  // We'll process sequentially to maintain order
  const tokens = [];
  
  // Match block-level elements and images
  const blockRegex = /<(p|h[1-6]|blockquote|figure|ul|ol|li|div)([^>]*)>([\s\S]*?)<\/\1>|<img\b([^>]*)\/?>|<br\s*\/?>/gi;
  
  let lastIdx = 0;
  let m;
  
  while ((m = blockRegex.exec(html)) !== null) {
    // Any text between blocks
    if (m.index > lastIdx) {
      const between = html.slice(lastIdx, m.index).trim();
      if (between && stripTags(between)) {
        tokens.push({ type: 'text', content: stripTags(between) });
      }
    }
    lastIdx = m.index + m[0].length;
    
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const inner = m[3];
      
      if (tag === 'figure') {
        // Extract image from figure
        const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        const captionMatch = inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
        if (imgMatch) {
          tokens.push({ 
            type: 'image', 
            url: imgMatch[1],
            caption: captionMatch ? stripTags(captionMatch[1]) : null
          });
        }
      } else if (tag.match(/^h[1-6]$/)) {
        const text = stripTags(inner);
        if (text) {
          const level = parseInt(tag[1]);
          tokens.push({ type: 'heading', level, text });
        }
      } else if (tag === 'blockquote') {
        const text = stripTags(inner);
        if (text) tokens.push({ type: 'quote', text });
      } else if (tag === 'ul' || tag === 'ol') {
        // Extract list items
        const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
        const listType = tag === 'ul' ? 'bullet' : 'number';
        for (const item of items) {
          const text = stripTags(item[1]);
          if (text) tokens.push({ type: 'listItem', listType, text });
        }
      } else if (tag === 'p') {
        // Check if paragraph contains an image
        const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        if (imgMatch) {
          tokens.push({ type: 'image', url: imgMatch[1], caption: null });
          // Also get any text in the paragraph besides the image
          const textOnly = stripTags(inner.replace(/<img[^>]*>/gi, ''));
          if (textOnly) tokens.push({ type: 'text', content: textOnly });
        } else {
          const text = stripTags(inner);
          if (text) tokens.push({ type: 'text', content: text });
        }
      } else if (tag === 'div') {
        // Recurse into divs but skip ad/sidebar classes
        const classMatch = m[2]?.match(/class=["']([^"']+)["']/i);
        const cls = classMatch?.[1] || '';
        if (cls.includes('ad') || cls.includes('sidebar') || cls.includes('related') || cls.includes('share') || cls.includes('social')) {
          continue; // skip non-content divs
        }
        const text = stripTags(inner);
        if (text) tokens.push({ type: 'text', content: text });
      }
    } else if (m[4]) {
      // Standalone <img> tag
      const srcMatch = m[4].match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        tokens.push({ type: 'image', url: srcMatch[1], caption: null });
      }
    }
  }
  
  // Any trailing text
  if (lastIdx < html.length) {
    const trailing = stripTags(html.slice(lastIdx));
    if (trailing) tokens.push({ type: 'text', content: trailing });
  }
  
  // Now convert tokens to Sanity blocks, uploading images
  for (const token of tokens) {
    if (token.type === 'text') {
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: key(), text: token.content, marks: [] }],
      });
    } else if (token.type === 'heading') {
      const style = token.level <= 2 ? 'h2' : token.level === 3 ? 'h3' : 'h4';
      blocks.push({
        _type: 'block',
        _key: key(),
        style,
        markDefs: [],
        children: [{ _type: 'span', _key: key(), text: token.text, marks: [] }],
      });
    } else if (token.type === 'quote') {
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'blockquote',
        markDefs: [],
        children: [{ _type: 'span', _key: key(), text: token.text, marks: [] }],
      });
    } else if (token.type === 'listItem') {
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'normal',
        listItem: token.listType,
        level: 1,
        markDefs: [],
        children: [{ _type: 'span', _key: key(), text: token.text, marks: [] }],
      });
    } else if (token.type === 'image') {
      // Filter out tracking pixels, ads, icons
      const url = token.url;
      if (url.includes('pixel') || url.includes('tracking') || url.includes('gravatar') || 
          url.includes('wp-includes') || url.includes('emoji') || url.includes('smilies') ||
          url.includes('ad-') || url.includes('banner') || url.includes('sponsor')) {
        continue;
      }
      
      imageUrls.push(url);
      
      // Upload image to Sanity
      const assetId = await uploadImage(url);
      if (assetId) {
        blocks.push({
          _type: 'image',
          _key: key(),
          asset: { _type: 'reference', _ref: assetId },
        });
        // Add caption if present
        if (token.caption) {
          blocks.push({
            _type: 'block',
            _key: key(),
            style: 'normal',
            markDefs: [],
            children: [{ _type: 'span', _key: key(), text: token.caption, marks: ['em'] }],
          });
        }
      }
    }
  }
  
  return { blocks, imageUrls };
}

// Get author name from Yoast JSON-LD
async function getAuthorName(wpPost) {
  try {
    const yoast = wpPost.yoast_head_json;
    if (yoast?.schema?.['@graph']) {
      const person = yoast.schema['@graph'].find(g => g['@type'] === 'Person');
      if (person?.name) return person.name;
    }
    // Fallback: scrape page
    const res = await fetch(wpPost.link, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const ldMatch = html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
    if (ldMatch) {
      const ld = JSON.parse(ldMatch[1]);
      const person = ld['@graph']?.find(g => g['@type'] === 'Person');
      if (person?.name) return person.name;
    }
  } catch (e) {}
  return null;
}

// Ensure author exists in Sanity
async function ensureAuthor(name, authorMap) {
  const k = name.toLowerCase().trim();
  if (authorMap[k]) return authorMap[k];
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const doc = await sanity.create({
    _type: 'author',
    name,
    slug: { _type: 'slug', current: slug },
  });
  authorMap[k] = doc._id;
  return doc._id;
}

// Process a single article
async function processArticle(slug, sanityId, authorMap, stats) {
  // Fetch from WP
  const res = await fetch(`https://www.the-triton.com/wp-json/wp/v2/posts?slug=${slug}&_embed`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!data[0]) { stats.wpNotFound++; return; }
  
  const wp = data[0];
  const patch = {};
  
  // Author
  const authorName = await getAuthorName(wp);
  if (authorName) {
    const authorId = await ensureAuthor(authorName, authorMap);
    patch.author = { _type: 'reference', _ref: authorId };
  }
  
  // Hero image
  const featuredMedia = wp._embedded?.['wp:featuredmedia']?.[0];
  const heroUrl = featuredMedia?.source_url;
  if (heroUrl) {
    const assetId = await uploadImage(heroUrl);
    if (assetId) {
      patch.heroImage = { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
    }
  }
  
  // Body content — always re-process to get proper formatting + images
  if (wp.content?.rendered) {
    const { blocks } = await htmlToPortableText(wp.content.rendered);
    if (blocks.length > 0) {
      patch.body = blocks;
    }
  }
  
  // Excerpt
  if (wp.excerpt?.rendered) {
    const excerpt = stripTags(wp.excerpt.rendered).slice(0, 300);
    if (excerpt) patch.excerpt = excerpt;
  }
  
  // Published date
  if (wp.date) patch.publishedAt = wp.date;
  
  // Apply
  if (Object.keys(patch).length > 0) {
    await sanity.patch(sanityId).set(patch).commit();
    stats.fixed++;
  }
}

// === MAIN ===
const MODE = process.argv[2] || 'test'; // 'test' or 'full'
const BATCH_SIZE = MODE === 'test' ? 5 : 50;

async function main() {
  console.log(`\n=== Fix Articles (${MODE} mode) ===\n`);
  
  // Load author map
  const authors = await sanity.fetch('*[_type=="author"]{_id, name}');
  const authorMap = {};
  for (const a of authors) authorMap[a.name.toLowerCase().trim()] = a._id;
  console.log(`Loaded ${Object.keys(authorMap).length} authors`);
  
  // Get articles that need fixing (2022+)
  const limit = MODE === 'test' ? 4 : MODE === 'batch' ? 199 : MODE === 'remaining' ? 1099 : 9999;
  const articles = await sanity.fetch(
    `*[_type=="article" && publishedAt >= "2022-01-01"] | order(publishedAt desc) [0..${limit}]{_id, "slug": slug.current, title}`,
  );
  console.log(`Found ${articles.length} articles to process\n`);
  
  const stats = { fixed: 0, wpNotFound: 0, errors: 0, total: articles.length };
  
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const progress = `[${i + 1}/${articles.length}]`;
    
    try {
      process.stdout.write(`${progress} ${a.slug?.slice(0, 60)}... `);
      await processArticle(a.slug, a._id, authorMap, stats);
      console.log('✓');
    } catch (e) {
      console.log(`✗ ${e.message}`);
      stats.errors++;
    }
    
    // Rate limit: small delay between articles
    if (i % 10 === 9) {
      await new Promise(r => setTimeout(r, 2000));
    } else {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Fixed: ${stats.fixed} | WP not found: ${stats.wpNotFound} | Errors: ${stats.errors} | Total: ${stats.total}`);
}

main().catch(e => { console.error(e); process.exit(1); });
