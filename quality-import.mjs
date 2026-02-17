#!/usr/bin/env node
/**
 * Quality article import: WP REST API → Sanity
 * 
 * Focuses on:
 * - Article body text (full HTML → Portable Text)
 * - Inline images within article bodies (uploaded to Sanity)
 * - Metadata: title, author, date, category, excerpt
 * 
 * Resumable via quality-import-progress.json
 */
import { createClient } from '@sanity/client';
import fs from 'fs';

const SANITY_TOKEN = 'skPOTfGUvSoRQcoIDG2aUgY5IZ3LxRZgUyE8wjGyYD6f48l0twVYbenDvKqKeuxW5is1wtV09I2qBN6vMcp78HDGuNcw7Uzod64EjV8Mla9BCAHC4NkgmAAsSr92nfCsBpvOSKFGpJ3yH2tNcBQyBzUF1T8o1o8yzR7CGF5O0g5qRgZGerSd';
const sanity = createClient({ projectId: '48r6hh2o', dataset: 'production', token: SANITY_TOKEN, apiVersion: '2024-01-01', useCdn: false });
const WP_API = 'https://www.the-triton.com/wp-json/wp/v2';
const PROGRESS_FILE = 'quality-import-progress.json';

// ── HTML Entity Decoding ──
function decodeHtml(s) {
  if (!s) return '';
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '…')
    .replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&bull;/g, '•').replace(/&middot;/g, '·')
    .trim();
}

function stripHtml(s) {
  return decodeHtml((s || '').replace(/<[^>]+>/g, ''));
}

// ── Image Upload ──
const imageCache = {}; // url → sanity asset id

async function uploadImageToSanity(imageUrl) {
  if (!imageUrl) return null;
  
  // Check cache
  if (imageCache[imageUrl]) return imageCache[imageUrl];
  
  // Get highest-res version by removing size suffix
  // e.g. image-800x600.jpg → image.jpg
  let fullUrl = imageUrl.replace(/-\d+x\d+(\.\w+)$/, '$1');
  
  try {
    const res = await fetch(fullUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) {
      // Try original URL if full-res failed
      if (fullUrl !== imageUrl) {
        const res2 = await fetch(imageUrl, { 
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(30000)
        });
        if (!res2.ok) return null;
        const buf = Buffer.from(await res2.arrayBuffer());
        if (buf.length < 100) return null;
        const ct = res2.headers.get('content-type') || 'image/jpeg';
        const fn = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
        const asset = await sanity.assets.upload('image', buf, { filename: fn, contentType: ct });
        imageCache[imageUrl] = asset._id;
        return asset._id;
      }
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return null;
    const ct = res.headers.get('content-type') || 'image/jpeg';
    const fn = fullUrl.split('/').pop().split('?')[0] || 'image.jpg';
    const asset = await sanity.assets.upload('image', buf, { filename: fn, contentType: ct });
    imageCache[imageUrl] = asset._id;
    imageCache[fullUrl] = asset._id;
    return asset._id;
  } catch (e) {
    console.error(`    Image upload failed: ${imageUrl.slice(-60)} — ${e.message}`);
    return null;
  }
}

// ── HTML → Portable Text with Inline Images ──
function genKey() { return Math.random().toString(36).slice(2, 10); }

function makeTextBlock(text, style = 'normal') {
  return {
    _type: 'block', _key: genKey(), style, markDefs: [],
    children: [{ _type: 'span', _key: genKey(), marks: [], text }],
  };
}

function makeImageBlock(assetId, alt = '') {
  return {
    _type: 'image', _key: genKey(),
    asset: { _type: 'reference', _ref: assetId },
    ...(alt ? { alt } : {}),
  };
}

async function htmlToPortableText(html) {
  if (!html) return [];
  const blocks = [];
  
  // Split HTML into segments: text content and image tags
  // We process the HTML linearly, capturing text blocks and images in order
  const segments = html.split(/(<(?:img|figure|figcaption)[^>]*>|<\/(?:figure|figcaption)>)/gi);
  
  let inFigure = false;
  let pendingImages = [];
  
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    
    // Check for image tag
    const imgMatch = trimmed.match(/^<img\s/i);
    if (imgMatch) {
      const src = trimmed.match(/src=["']([^"']+)/i)?.[1];
      const alt = trimmed.match(/alt=["']([^"']*)/i)?.[1] || '';
      if (src && src.includes('wp-content/uploads')) {
        pendingImages.push({ src, alt: decodeHtml(alt) });
      }
      continue;
    }
    
    // Figure/figcaption tags
    if (/^<figure/i.test(trimmed)) { inFigure = true; continue; }
    if (/^<\/figure/i.test(trimmed)) { inFigure = false; continue; }
    if (/^<figcaption/i.test(trimmed) || /^<\/figcaption/i.test(trimmed)) continue;
    
    // Process text content — split by paragraph/heading tags
    const parts = trimmed.split(/(<\/?(?:p|h[1-6]|blockquote|ul|ol|li|div|pre)[^>]*>)/gi);
    let buffer = '';
    let currentStyle = 'normal';
    
    for (const part of parts) {
      const tagM = part.match(/^<(\/?)(\w+)/i);
      if (tagM) {
        const [, isClose, tag] = tagM;
        const lt = tag.toLowerCase();
        
        if (isClose && ['p','h1','h2','h3','h4','h5','h6','blockquote','li','div','pre'].includes(lt)) {
          const text = stripHtml(buffer);
          if (text) {
            blocks.push(makeTextBlock(text, currentStyle));
          }
          // Flush any pending images after this text block
          for (const img of pendingImages) {
            // Will be replaced with actual image blocks later (placeholder)
            blocks.push({ _pending_image: true, src: img.src, alt: img.alt });
          }
          pendingImages = [];
          buffer = '';
          currentStyle = 'normal';
        } else if (!isClose) {
          currentStyle = 'normal';
          if (/^h[1-6]$/.test(lt)) currentStyle = lt;
          else if (lt === 'blockquote') currentStyle = 'blockquote';
          buffer = '';
        }
      } else {
        buffer += part;
      }
    }
    
    // Any remaining text
    const remaining = stripHtml(buffer);
    if (remaining) {
      blocks.push(makeTextBlock(remaining, currentStyle));
    }
  }
  
  // Flush any remaining pending images
  for (const img of pendingImages) {
    blocks.push({ _pending_image: true, src: img.src, alt: img.alt });
  }
  
  // Now upload all pending images
  const finalBlocks = [];
  for (const block of blocks) {
    if (block._pending_image) {
      const assetId = await uploadImageToSanity(block.src);
      if (assetId) {
        finalBlocks.push(makeImageBlock(assetId, block.alt));
      }
    } else {
      finalBlocks.push(block);
    }
  }
  
  return finalBlocks;
}

// ── Category Mapping ──
function mapCategory(wpCats, catLookup) {
  for (const id of wpCats || []) {
    const c = catLookup[id]; if (!c) continue;
    const s = c.slug.toLowerCase();
    if (s.includes('captain')) return 'category-captains';
    if (s.includes('crew') || s.includes('stew') || s.includes('chef') || s.includes('deckhand') || s.includes('engineer') || s.includes('interior') || s.includes('galley')) return 'category-crew-life';
    if (s.includes('event') || s.includes('show') || s.includes('networking')) return 'category-events';
    if (s.includes('destination') || s.includes('hidden-gem')) return 'category-destinations';
    if (s.includes('gallery') || s.includes('photo')) return 'category-galleries';
    if (s.includes('expo') || s.includes('flibs') || s.includes('boat-show') || s.includes('monaco')) return 'category-expos';
    if (s.includes('magazine') || s.includes('print')) return 'category-magazine';
  }
  return 'category-news';
}

// ── Helpers ──
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(30000)
      });
      if (r.status === 400) return null;
      if (r.status === 429) { console.log('  Rate limited, waiting...'); await sleep(10000); continue; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) { 
      if (i === 2) throw e; 
      await sleep(3000); 
    }
  }
}

function loadProgress() {
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
  catch { return { processed: {}, failed: {}, imageAssets: {} }; }
}
function saveProgress(p) { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p)); }

// ── Main ──
async function main() {
  console.log('=== Quality Article Import ===');
  console.log('Focus: body text, inline images, metadata\n');

  // Load existing articles in Sanity
  const existing = await sanity.fetch('*[_type=="article"]{_id, "slug": slug.current}');
  const slugToId = {};
  for (const a of existing) slugToId[a.slug] = a._id;
  console.log(`Existing articles in Sanity: ${existing.length}`);

  // WP categories
  const wpCats = {};
  for (let p = 1; p <= 3; p++) {
    const cats = await fetchJSON(`${WP_API}/categories?per_page=100&page=${p}`);
    if (!cats?.length) break;
    for (const c of cats) wpCats[c.id] = c;
  }
  console.log(`WP categories: ${Object.keys(wpCats).length}`);

  // Authors
  const authorCache = {};
  const existingAuthors = await sanity.fetch('*[_type=="author"]{_id, "slug": slug.current}');
  for (const a of existingAuthors) authorCache[a.slug] = a._id;

  async function getOrCreateAuthor(name) {
    if (!name) return null;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (authorCache[slug]) return authorCache[slug];
    try {
      const ex = await sanity.fetch('*[_type=="author" && slug.current==$slug][0]._id', { slug });
      if (ex) { authorCache[slug] = ex; return ex; }
      const doc = await sanity.create({ _type: 'author', name, slug: { _type: 'slug', current: slug }, bio: '' });
      authorCache[slug] = doc._id;
      console.log(`  Created author: ${name}`);
      return doc._id;
    } catch (e) {
      console.error(`  Author creation failed: ${name} — ${e.message}`);
      return null;
    }
  }

  // Load progress and image cache
  const progress = loadProgress();
  // Restore image cache from progress
  Object.assign(imageCache, progress.imageAssets || {});
  
  let processed = Object.keys(progress.processed).length;
  let failed = Object.keys(progress.failed).length;
  let imagesUploaded = 0;

  console.log(`Resume: ${processed} processed, ${failed} failed`);
  console.log(`Image cache: ${Object.keys(imageCache).length} entries\n`);

  // Process all WP posts page by page
  for (let page = 1; ; page++) {
    const posts = await fetchJSON(`${WP_API}/posts?per_page=50&page=${page}&_embed&orderby=date&order=desc`);
    if (!posts || !Array.isArray(posts) || !posts.length) break;

    for (const wp of posts) {
      const slug = wp.slug;
      if (!slug) continue;
      if (progress.processed[slug]) continue; // Already done

      try {
        const title = stripHtml(wp.title?.rendered);
        const excerpt = stripHtml(wp.excerpt?.rendered);
        const contentHtml = wp.content?.rendered || '';
        
        // Count inline images before processing
        const imgCount = (contentHtml.match(/<img[^>]+wp-content\/uploads[^>]+>/gi) || []).length;
        
        console.log(`  [${processed + 1}] ${title.slice(0, 55)}... (${imgCount} inline imgs)`);
        
        // Convert HTML to Portable Text with inline images
        const body = await htmlToPortableText(contentHtml);
        const bodyImageCount = body.filter(b => b._type === 'image').length;
        
        if (bodyImageCount > 0) {
          imagesUploaded += bodyImageCount;
          console.log(`    → Uploaded ${bodyImageCount} inline images`);
        }

        // Author
        const authorName = wp._embedded?.author?.[0]?.name;
        const authorId = await getOrCreateAuthor(authorName);

        // Hero image URL (just the URL, not uploaded)
        const featMedia = wp._embedded?.['wp:featuredmedia']?.[0];
        const heroImageUrl = featMedia?.source_url || featMedia?.media_details?.sizes?.large?.source_url || '';

        // Category
        const catId = mapCategory(wp.categories, wpCats);

        // Build document data
        const data = {
          title, excerpt, body, heroImageUrl,
          publishedAt: wp.date,
          slug: { _type: 'slug', current: slug },
          category: { _type: 'reference', _ref: catId },
          ...(authorId ? { author: { _type: 'reference', _ref: authorId } } : {}),
        };

        // Create or update
        if (slugToId[slug]) {
          await sanity.patch(slugToId[slug]).set(data).commit();
        } else {
          const doc = await sanity.create({ _type: 'article', ...data });
          slugToId[slug] = doc._id;
        }

        progress.processed[slug] = { images: bodyImageCount, hasAuthor: !!authorId };
        processed++;
      } catch (e) {
        progress.failed[slug] = e.message;
        failed++;
        console.error(`    ✗ FAILED: ${e.message.slice(0, 100)}`);
      }
    }

    // Save progress after each page, including image cache
    progress.imageAssets = { ...imageCache };
    saveProgress(progress);
    console.log(`--- Page ${page}: ${processed} done | ${failed} failed | ${imagesUploaded} images uploaded ---\n`);
    await sleep(500);
  }

  saveProgress(progress);
  const total = await sanity.fetch('count(*[_type=="article"])');
  const withBody = await sanity.fetch('count(*[_type=="article" && length(body) > 0])');
  const withAuthor = await sanity.fetch('count(*[_type=="article" && defined(author)])');
  
  console.log('\n=== DONE ===');
  console.log(`Processed: ${processed} | Failed: ${failed}`);
  console.log(`Images uploaded: ${imagesUploaded}`);
  console.log(`Total articles: ${total} | With body: ${withBody} | With author: ${withAuthor}`);
}

main().catch(console.error);
