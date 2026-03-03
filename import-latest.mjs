#!/usr/bin/env node
/**
 * Import latest WordPress articles into Sanity CMS for The Triton
 * Only imports articles newer than the last Sanity article (2026-02-17T13:00:48Z)
 */

const SANITY_PROJECT = '48r6hh2o';
const SANITY_DATASET = 'production';
const WP_BASE = 'https://www.the-triton.com/wp-json/wp/v2';
const SANITY_API = `https://${SANITY_PROJECT}.api.sanity.io/v2024-01-01`;
const AFTER_DATE = '2026-02-17T13:00:48Z';

// We need a write token — check .env
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf8');
const tokenMatch = envFile.match(/SANITY_API_TOKEN=(.+)/);
const SANITY_TOKEN = tokenMatch?.[1]?.trim();

if (!SANITY_TOKEN) {
  console.error('ERROR: No SANITY_API_TOKEN in .env');
  process.exit(1);
}

// Test token
async function testToken() {
  const r = await fetch(`${SANITY_API}/data/query/${SANITY_DATASET}?query=count(*[])`, {
    headers: { Authorization: `Bearer ${SANITY_TOKEN}` }
  });
  if (!r.ok) {
    console.log('Write token may be expired. Trying without auth for reads...');
    return false;
  }
  return true;
}

// Fetch WP posts
async function fetchWPPosts() {
  const url = `${WP_BASE}/posts?per_page=20&after=${AFTER_DATE}&orderby=date&order=desc`;
  const r = await fetch(url);
  return r.json();
}

// Fetch WP author
async function fetchWPAuthor(authorId) {
  const r = await fetch(`${WP_BASE}/users/${authorId}?_fields=id,name,slug,description,avatar_urls`);
  if (!r.ok) return null;
  return r.json();
}

// Fetch WP media
async function fetchWPMedia(mediaId) {
  if (!mediaId) return null;
  const r = await fetch(`${WP_BASE}/media/${mediaId}?_fields=id,source_url,alt_text,title,caption`);
  if (!r.ok) return null;
  return r.json();
}

// Fetch WP categories
async function fetchWPCategories(catIds) {
  if (!catIds?.length) return [];
  const r = await fetch(`${WP_BASE}/categories?include=${catIds.join(',')}&_fields=id,name,slug`);
  if (!r.ok) return [];
  return r.json();
}

// Upload image to Sanity
async function uploadImageToSanity(imageUrl) {
  try {
    console.log(`  Downloading image: ${imageUrl.substring(0, 80)}...`);
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgRes.arrayBuffer();
    
    const uploadUrl = `${SANITY_API}/assets/images/${SANITY_DATASET}?filename=${imageUrl.split('/').pop()}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SANITY_TOKEN}`,
        'Content-Type': contentType,
      },
      body: Buffer.from(buffer),
    });
    
    if (!uploadRes.ok) {
      console.log(`  Image upload failed: ${uploadRes.status}`);
      return null;
    }
    
    const data = await uploadRes.json();
    return data.document._id;
  } catch (e) {
    console.log(`  Image error: ${e.message}`);
    return null;
  }
}

// Check if article already exists in Sanity (by slug)
async function articleExists(slug) {
  const query = encodeURIComponent(`count(*[_type=='article' && slug.current=='${slug}'])`);
  const r = await fetch(`${SANITY_API}/data/query/${SANITY_DATASET}?query=${query}`);
  const data = await r.json();
  return data.result > 0;
}

// Find or create author in Sanity
async function findOrCreateAuthor(wpAuthor) {
  const slug = wpAuthor.slug;
  const query = encodeURIComponent(`*[_type=='author' && slug.current=='${slug}'][0]._id`);
  const r = await fetch(`${SANITY_API}/data/query/${SANITY_DATASET}?query=${query}`);
  const data = await r.json();
  
  if (data.result) return data.result;
  
  // Create author
  const authorDoc = {
    _type: 'author',
    _id: `author-${slug}`,
    name: wpAuthor.name,
    slug: { _type: 'slug', current: slug },
    bio: wpAuthor.description || '',
  };
  
  const mutations = [{ createIfNotExists: authorDoc }];
  const mr = await fetch(`${SANITY_API}/data/mutate/${SANITY_DATASET}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SANITY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  });
  
  if (!mr.ok) {
    console.log(`  Author create failed: ${mr.status}`);
    return null;
  }
  return `author-${slug}`;
}

// Find category in Sanity
async function findCategory(slug) {
  const query = encodeURIComponent(`*[_type=='category' && slug.current=='${slug}'][0]._id`);
  const r = await fetch(`${SANITY_API}/data/query/${SANITY_DATASET}?query=${query}`);
  const data = await r.json();
  return data.result || null;
}

// Convert HTML to Sanity Portable Text (simplified)
function htmlToPortableText(html) {
  if (!html) return [];
  
  // Strip WP shortcodes
  let text = html.replace(/\[.*?\]/g, '');
  
  // Split on block elements
  const blocks = [];
  const parts = text.split(/<\/?(?:p|div|h[1-6]|blockquote|ul|ol|li|figure|figcaption|br\s*\/?)>/gi);
  
  for (const part of parts) {
    const clean = part
      .replace(/<[^>]+>/g, '') // strip remaining HTML
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&#038;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    if (clean.length > 0) {
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).slice(2, 10),
        style: 'normal',
        markDefs: [],
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).slice(2, 10),
          text: clean,
          marks: [],
        }],
      });
    }
  }
  
  return blocks.length > 0 ? blocks : [{
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'fallback', text: 'Content pending migration.', marks: [] }],
  }];
}

// Decode HTML entities in titles
function decodeEntities(str) {
  return str
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Main
async function main() {
  console.log('=== The Triton: WordPress → Sanity Migration ===');
  console.log(`Importing articles after: ${AFTER_DATE}\n`);
  
  const hasAuth = await testToken();
  if (!hasAuth) {
    console.error('Sanity token is invalid/expired. Need a fresh write token.');
    console.error('Go to: https://www.sanity.io/manage/project/48r6hh2o/api#tokens');
    process.exit(1);
  }
  
  const posts = await fetchWPPosts();
  console.log(`Found ${posts.length} new articles on WordPress\n`);
  
  const authorCache = {};
  let imported = 0;
  let skipped = 0;
  
  for (const post of posts) {
    const title = decodeEntities(post.title.rendered);
    const slug = post.slug;
    console.log(`[${post.date.slice(0,10)}] ${title}`);
    
    // Check if already exists
    if (await articleExists(slug)) {
      console.log('  → Already in Sanity, skipping\n');
      skipped++;
      continue;
    }
    
    // Resolve author
    let authorRef = null;
    if (post.author && !authorCache[post.author]) {
      const wpAuthor = await fetchWPAuthor(post.author);
      if (wpAuthor) {
        authorCache[post.author] = await findOrCreateAuthor(wpAuthor);
      }
    }
    authorRef = authorCache[post.author] || null;
    
    // Resolve featured image
    let imageRef = null;
    if (post.featured_media) {
      const media = await fetchWPMedia(post.featured_media);
      if (media?.source_url) {
        imageRef = await uploadImageToSanity(media.source_url);
      }
    }
    
    // Resolve categories
    let categoryRef = null;
    if (post.categories?.length) {
      const wpCats = await fetchWPCategories(post.categories);
      for (const cat of wpCats) {
        const catId = await findCategory(cat.slug);
        if (catId) { categoryRef = catId; break; }
      }
    }
    
    // Build article document
    const articleDoc = {
      _type: 'article',
      _id: `wp-${post.id}`,
      title,
      slug: { _type: 'slug', current: slug },
      publishedAt: post.date + 'Z',
      excerpt: decodeEntities(post.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || ''),
      body: htmlToPortableText(post.content.rendered),
    };
    
    if (authorRef) {
      articleDoc.author = { _type: 'reference', _ref: authorRef };
    }
    
    if (imageRef) {
      articleDoc.mainImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageRef },
      };
    }
    
    if (categoryRef) {
      articleDoc.category = { _type: 'reference', _ref: categoryRef };
    }
    
    // Create in Sanity
    const mutations = [{ createIfNotExists: articleDoc }];
    const mr = await fetch(`${SANITY_API}/data/mutate/${SANITY_DATASET}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SANITY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mutations }),
    });
    
    if (mr.ok) {
      console.log('  ✅ Imported\n');
      imported++;
    } else {
      const err = await mr.text();
      console.log(`  ❌ Failed: ${err}\n`);
    }
    
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('=== Migration Complete ===');
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Failed: ${posts.length - imported - skipped}`);
}

main().catch(console.error);
