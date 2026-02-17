#!/usr/bin/env node
/**
 * Test script: Fix 5 articles with author links, hero images, and inline images
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

const SANITY_TOKEN = 'skPOTfGUvSoRQcoIDG2aUgY5IZ3LxRZgUyE8wjGyYD6f48l0twVYbenDvKqKeuxW5is1wtV09I2qBN6vMcp78HDGuNcw7Uzod64EjV8Mla9BCAHC4NkgmAAsSr92nfCsBpvOSKFGpJ3yH2tNcBQyBzUF1T8o1o8yzR7CGF5O0g5qRgZGerSd';
const sanity = createClient({ projectId: '48r6hh2o', dataset: 'production', token: SANITY_TOKEN, apiVersion: '2024-01-01', useCdn: false });
const WP_API = 'https://www.the-triton.com/wp-json/wp/v2';

const wpAuthorMap = JSON.parse(readFileSync('wp-author-map.json', 'utf8'));

const TEST_SLUGS = [
  'this-recipe-is-in-memory-of-lewis-burke',
  'take-it-in-peak-performance-of-the-brain-depends-on-smart-fuel-choices',
  'veteran-captain-jack-maguire-dies',
  'yachtsign-opens-fort-lauderdale-showroom',
  'crew-compass-coming-my-way-fit-a-little-something-in-your-bag',
];

function nameToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function getOrCreateAuthor(wpAuthorId) {
  const wpName = wpAuthorMap[String(wpAuthorId)];
  if (!wpName) {
    console.log(`  ⚠ No WP author name for ID ${wpAuthorId}`);
    return null;
  }
  
  // Decode HTML entities
  const name = wpName.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const slug = nameToSlug(name);
  
  // Check if author exists
  let author = await sanity.fetch('*[_type=="author" && slug.current==$slug][0]{_id, name}', { slug });
  if (author) {
    console.log(`  ✓ Author found: ${author.name} (${author._id})`);
    return author._id;
  }
  
  // Create author
  console.log(`  + Creating author: ${name} (${slug})`);
  const doc = await sanity.create({
    _type: 'author',
    name,
    slug: { _type: 'slug', current: slug },
    bio: '',
  });
  return doc._id;
}

async function uploadImageToSanity(imageUrl) {
  console.log(`  📷 Uploading: ${imageUrl.slice(0, 80)}...`);
  const res = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const filename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
  
  const asset = await sanity.assets.upload('image', buffer, { filename, contentType });
  console.log(`  ✓ Uploaded: ${asset._id}`);
  return asset._id;
}

async function getHeroImageUrl(featuredMediaId) {
  if (!featuredMediaId) return null;
  const res = await fetch(`${WP_API}/media/${featuredMediaId}?_fields=source_url`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.source_url || null;
}

async function processArticle(slug) {
  console.log(`\n=== Processing: ${slug} ===`);
  
  // Get Sanity article
  const article = await sanity.fetch(
    '*[_type=="article" && slug.current==$slug][0]{_id, title, "hasAuthor": defined(author), "hasHero": defined(heroImage), body}',
    { slug }
  );
  if (!article) { console.log('  ✗ Article not found in Sanity'); return false; }
  console.log(`  Sanity ID: ${article._id}, title: ${article.title}`);
  
  // Get WP post data
  const wpRes = await fetch(`${WP_API}/posts?slug=${slug}&_fields=id,slug,author,featured_media,content`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const wpPosts = await wpRes.json();
  if (!wpPosts.length) { console.log('  ✗ Not found in WP API'); return false; }
  const wp = wpPosts[0];
  
  const patches = {};
  
  // 1. Author linking
  if (!article.hasAuthor) {
    const authorId = await getOrCreateAuthor(wp.author);
    if (authorId) {
      patches.author = { _type: 'reference', _ref: authorId };
      console.log(`  → Will set author ref`);
    }
  } else {
    console.log(`  ⏭ Author already set`);
  }
  
  // 2. Hero image
  if (!article.hasHero && wp.featured_media) {
    const imageUrl = await getHeroImageUrl(wp.featured_media);
    if (imageUrl) {
      try {
        const assetId = await uploadImageToSanity(imageUrl);
        patches.heroImage = { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
        console.log(`  → Will set heroImage`);
      } catch (e) {
        console.log(`  ✗ Hero image failed: ${e.message}`);
      }
    }
  } else {
    console.log(`  ⏭ Hero image already set or no featured_media`);
  }
  
  // 3. Inline images - check body for image blocks that reference missing assets
  if (article.body) {
    const imageBlocks = article.body.filter(b => b._type === 'image' && b.asset?._ref);
    if (imageBlocks.length > 0) {
      console.log(`  ℹ Body has ${imageBlocks.length} image blocks (already in portable text)`);
    }
    
    // Also check WP content for images that might not be in Sanity body
    if (wp.content?.rendered) {
      const imgMatches = wp.content.rendered.match(/<img[^>]+src="([^"]+)"[^>]*>/g) || [];
      const wpImgUrls = imgMatches
        .map(tag => tag.match(/src="([^"]+)"/)?.[1])
        .filter(Boolean)
        .filter(url => url.includes('the-triton.com') || url.includes('wp-content'));
      
      if (wpImgUrls.length > imageBlocks.length) {
        console.log(`  ℹ WP has ${wpImgUrls.length} inline images vs ${imageBlocks.length} in Sanity body`);
        // We'll handle inline image injection in the bulk phase - just log for now
      }
    }
  }
  
  // Apply patches
  if (Object.keys(patches).length > 0) {
    await sanity.patch(article._id).set(patches).commit();
    console.log(`  ✅ Patched: ${Object.keys(patches).join(', ')}`);
  } else {
    console.log(`  ℹ No patches needed`);
  }
  
  return true;
}

async function main() {
  console.log('Starting test run on 5 articles...\n');
  
  for (const slug of TEST_SLUGS) {
    try {
      await processArticle(slug);
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n\n=== VERIFICATION ===');
  for (const slug of TEST_SLUGS) {
    const a = await sanity.fetch(
      '*[_type=="article" && slug.current==$slug][0]{title, "authorName": author->name, "hasHero": defined(heroImage)}',
      { slug }
    );
    console.log(`  ${slug}: author=${a?.authorName || 'NONE'}, hero=${a?.hasHero ? 'YES' : 'NO'}`);
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
