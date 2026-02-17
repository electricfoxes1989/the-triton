#!/usr/bin/env node
import { createClient } from '@sanity/client';
import fs from 'fs';

const SANITY_TOKEN = 'skPOTfGUvSoRQcoIDG2aUgY5IZ3LxRZgUyE8wjGyYD6f48l0twVYbenDvKqKeuxW5is1wtV09I2qBN6vMcp78HDGuNcw7Uzod64EjV8Mla9BCAHC4NkgmAAsSr92nfCsBpvOSKFGpJ3yH2tNcBQyBzUF1T8o1o8yzR7CGF5O0g5qRgZGerSd';
const sanity = createClient({ projectId: '48r6hh2o', dataset: 'production', token: SANITY_TOKEN, apiVersion: '2024-01-01', useCdn: false });

const articles = JSON.parse(fs.readFileSync('/tmp/triton-scraped.json'));

async function getImageUrl(mediaId) {
  try {
    const res = await fetch(`https://www.the-triton.com/wp-json/wp/v2/media/${mediaId}?_fields=source_url,media_details`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await res.json();
    return data.source_url || data.media_details?.sizes?.large?.source_url || null;
  } catch { return null; }
}

async function uploadImage(imageUrl) {
  try {
    const res = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
    const asset = await sanity.assets.upload('image', buffer, { filename });
    return asset._id;
  } catch (e) {
    console.error(`  Upload failed: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('Adding images to 100 articles...\n');
  
  let updated = 0;
  let failed = 0;
  
  for (const wp of articles) {
    const slug = wp.slug;
    const title = wp.title?.rendered?.replace(/<[^>]+>/g, '').slice(0, 50);
    
    if (!wp.featured_media) {
      console.log(`  Skip (no media): ${title}`);
      continue;
    }
    
    // Get image URL from WP media endpoint
    const imageUrl = await getImageUrl(wp.featured_media);
    if (!imageUrl) {
      console.log(`  Skip (no URL): ${title}`);
      failed++;
      continue;
    }
    
    // Upload to Sanity
    console.log(`  Uploading: ${title}...`);
    const assetId = await uploadImage(imageUrl);
    if (!assetId) {
      failed++;
      continue;
    }
    
    // Find the article in Sanity and update it
    const doc = await sanity.fetch('*[_type=="article" && slug.current==$slug][0]._id', { slug });
    if (!doc) {
      console.log(`  Not found in Sanity: ${slug}`);
      failed++;
      continue;
    }
    
    await sanity.patch(doc).set({
      mainImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
      heroImageUrl: imageUrl,
    }).commit();
    
    updated++;
    console.log(`  ✓ ${updated}: ${title}`);
  }
  
  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
}

main().catch(console.error);
