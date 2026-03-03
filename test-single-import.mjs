#!/usr/bin/env node
/**
 * Test import: Fetch 1 latest article from WP REST API,
 * upload featured image to Sanity, convert HTML body to Portable Text,
 * and create the article document.
 */
import { createClient } from '@sanity/client';
import { parseDocument } from 'htmlparser2';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config(); // load .env

const sanity = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '48r6hh2o',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const WP_API = 'https://www.the-triton.com/wp-json/wp/v2';

// ── HTML to Portable Text ──────────────────────────────────────────
function htmlToPortableText(html) {
  if (!html) return [];
  
  const blocks = [];
  let currentBlock = null;
  let markStack = [];
  let markDefs = [];
  let keyCounter = 0;
  
  const key = () => `k${keyCounter++}`;
  
  function flushBlock() {
    if (currentBlock && currentBlock.children.length > 0) {
      // Clean up: remove trailing empty spans
      const lastChild = currentBlock.children[currentBlock.children.length - 1];
      if (lastChild && lastChild.text === '' && currentBlock.children.length > 1) {
        currentBlock.children.pop();
      }
      blocks.push(currentBlock);
    }
    currentBlock = null;
  }
  
  function ensureBlock(style = 'normal') {
    if (!currentBlock) {
      currentBlock = {
        _type: 'block',
        _key: key(),
        style,
        markDefs: [],
        children: [],
      };
      markStack = [];
      markDefs = [];
    }
    return currentBlock;
  }
  
  function addSpan(text) {
    if (!text) return;
    const block = ensureBlock();
    block.children.push({
      _type: 'span',
      _key: key(),
      text,
      marks: [...markStack],
    });
  }
  
  // Simple recursive DOM walker
  function walk(node) {
    if (!node) return;
    
    if (node.type === 'text') {
      const text = node.data;
      // Skip pure whitespace between blocks
      if (!currentBlock && !text.trim()) return;
      addSpan(text);
      return;
    }
    
    if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') {
      if (node.children) node.children.forEach(walk);
      return;
    }
    
    const tag = node.name?.toLowerCase();
    
    // Skip script/style/iframe/noscript entirely
    if (['script', 'style', 'iframe', 'noscript', 'svg'].includes(tag)) return;
    
    switch (tag) {
      case 'p':
      case 'div': {
        flushBlock();
        ensureBlock('normal');
        if (node.children) node.children.forEach(walk);
        flushBlock();
        break;
      }
      
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        flushBlock();
        ensureBlock(tag);
        if (node.children) node.children.forEach(walk);
        flushBlock();
        break;
      }
      
      case 'blockquote': {
        flushBlock();
        ensureBlock('blockquote');
        if (node.children) node.children.forEach(walk);
        flushBlock();
        break;
      }
      
      case 'strong':
      case 'b': {
        markStack.push('strong');
        if (node.children) node.children.forEach(walk);
        markStack.pop();
        break;
      }
      
      case 'em':
      case 'i': {
        markStack.push('em');
        if (node.children) node.children.forEach(walk);
        markStack.pop();
        break;
      }
      
      case 'a': {
        const href = node.attribs?.href;
        if (href) {
          const markKey = key();
          const block = ensureBlock();
          block.markDefs.push({ _type: 'link', _key: markKey, href });
          markStack.push(markKey);
          if (node.children) node.children.forEach(walk);
          markStack.pop();
        } else {
          if (node.children) node.children.forEach(walk);
        }
        break;
      }
      
      case 'br': {
        addSpan('\n');
        break;
      }
      
      case 'ul':
      case 'ol': {
        flushBlock();
        if (node.children) {
          node.children.forEach((li, idx) => {
            if (li.name === 'li') {
              ensureBlock('normal');
              currentBlock.listItem = tag === 'ul' ? 'bullet' : 'number';
              currentBlock.level = 1;
              if (li.children) li.children.forEach(walk);
              flushBlock();
            }
          });
        }
        break;
      }
      
      case 'figure': {
        // Look for img inside figure
        const img = findTag(node, 'img');
        if (img) {
          flushBlock();
          const src = img.attribs?.src || img.attribs?.['data-src'];
          const alt = img.attribs?.alt || '';
          const figcaption = findTag(node, 'figcaption');
          const caption = figcaption ? getTextContent(figcaption) : '';
          if (src) {
            blocks.push({
              _type: 'image',
              _key: key(),
              _sanityAsset: `image@${src}`,
              alt,
              caption,
            });
          }
        } else {
          if (node.children) node.children.forEach(walk);
        }
        break;
      }
      
      case 'img': {
        flushBlock();
        const src = node.attribs?.src || node.attribs?.['data-src'];
        const alt = node.attribs?.alt || '';
        if (src && !src.includes('data:image') && !src.includes('pixel') && !src.includes('tracking')) {
          blocks.push({
            _type: 'image',
            _key: key(),
            _sanityAsset: `image@${src}`,
            alt,
          });
        }
        break;
      }
      
      default: {
        if (node.children) node.children.forEach(walk);
      }
    }
  }
  
  function findTag(node, tagName) {
    if (node.name === tagName) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findTag(child, tagName);
        if (found) return found;
      }
    }
    return null;
  }
  
  function getTextContent(node) {
    if (node.type === 'text') return node.data || '';
    if (node.children) return node.children.map(getTextContent).join('');
    return '';
  }
  
  const doc = parseDocument(html);
  if (doc.children) doc.children.forEach(walk);
  flushBlock();
  
  // Filter out empty blocks and clean up
  return blocks.filter(b => {
    if (b._type === 'image') return true;
    if (b.children && b.children.length === 0) return false;
    if (b.children && b.children.length === 1 && b.children[0].text?.trim() === '') return false;
    return true;
  });
}

// ── Upload image to Sanity ─────────────────────────────────────────
async function uploadImageToSanity(url) {
  try {
    console.log(`  Downloading image: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Get filename from URL
    const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';
    
    console.log(`  Uploading to Sanity (${(buffer.length / 1024).toFixed(0)}KB)...`);
    const asset = await sanity.assets.upload('image', buffer, {
      filename,
      contentType,
    });
    console.log(`  ✓ Uploaded: ${asset._id}`);
    return asset;
  } catch (err) {
    console.error(`  ✗ Image upload failed: ${err.message}`);
    return null;
  }
}

// ── Fetch WP categories ────────────────────────────────────────────
async function fetchWPCategories() {
  const res = await fetch(`${WP_API}/categories?per_page=100&_fields=id,name,slug`);
  return res.json();
}

// ── Ensure category exists in Sanity ───────────────────────────────
async function ensureCategory(wpCat) {
  const id = `category-${wpCat.slug}`;
  const existing = await sanity.getDocument(id);
  if (existing) return id;
  
  // Clean up WP category name (remove leading * or **)
  const title = wpCat.name.replace(/^\*+\s*/, '');
  
  await sanity.createOrReplace({
    _id: id,
    _type: 'category',
    title,
    slug: { _type: 'slug', current: wpCat.slug },
  });
  console.log(`  Created category: ${title}`);
  return id;
}

// ── Ensure author exists in Sanity ─────────────────────────────────
async function ensureAuthor(wpAuthor) {
  if (!wpAuthor?.name) return null;
  const slug = wpAuthor.slug || wpAuthor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = `author-${slug}`;
  const existing = await sanity.getDocument(id);
  if (existing) return id;
  
  await sanity.createOrReplace({
    _id: id,
    _type: 'author',
    name: wpAuthor.name,
    slug: { _type: 'slug', current: slug },
    bio: wpAuthor.description || '',
  });
  console.log(`  Created author: ${wpAuthor.name}`);
  return id;
}

// ── Strip HTML tags for excerpt ────────────────────────────────────
function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim() || '';
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log('=== Test Import: 1 Article from WP → Sanity ===\n');
  
  // 1. Fetch categories
  console.log('Fetching WP categories...');
  const wpCategories = await fetchWPCategories();
  const catMap = Object.fromEntries(wpCategories.map(c => [c.id, c]));
  console.log(`  ${wpCategories.length} categories found\n`);
  
  // 2. Fetch latest article with embedded data
  console.log('Fetching latest article from WP...');
  const res = await fetch(`${WP_API}/posts?per_page=1&orderby=date&order=desc&_embed`);
  const posts = await res.json();
  const post = posts[0];
  
  console.log(`  Title: ${post.title.rendered}`);
  console.log(`  Date: ${post.date}`);
  console.log(`  Slug: ${post.slug}`);
  console.log(`  Content length: ${post.content.rendered.length} chars\n`);
  
  // 3. Handle categories
  const wpCatIds = post.categories || [];
  // Pick the most specific category (not Headlines/Other News)
  const specificCats = wpCatIds.filter(id => {
    const cat = catMap[id];
    return cat && !['headlines', 'other-news'].includes(cat.slug);
  });
  const primaryCatId = specificCats[0] || wpCatIds[0];
  const primaryCat = catMap[primaryCatId];
  
  let categoryRef = null;
  if (primaryCat) {
    console.log(`Processing category: ${primaryCat.name}...`);
    categoryRef = await ensureCategory(primaryCat);
  }
  
  // 4. Handle author
  const wpAuthors = post._embedded?.author || [];
  let authorRef = null;
  if (wpAuthors[0]) {
    console.log(`Processing author: ${wpAuthors[0].name}...`);
    authorRef = await ensureAuthor(wpAuthors[0]);
  }
  
  // 5. Upload featured image
  let heroImageAsset = null;
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  if (featuredMedia?.source_url) {
    console.log('\nUploading featured image...');
    heroImageAsset = await uploadImageToSanity(featuredMedia.source_url);
  }
  
  // 6. Convert body HTML to Portable Text
  console.log('\nConverting HTML to Portable Text...');
  const body = htmlToPortableText(post.content.rendered);
  console.log(`  ${body.length} blocks created`);
  
  // Count inline images that need uploading
  const inlineImages = body.filter(b => b._type === 'image' && b._sanityAsset);
  if (inlineImages.length > 0) {
    console.log(`  ${inlineImages.length} inline images to upload...`);
    for (const img of inlineImages) {
      const url = img._sanityAsset.replace('image@', '');
      const asset = await uploadImageToSanity(url);
      if (asset) {
        delete img._sanityAsset;
        img.asset = { _type: 'reference', _ref: asset._id };
      }
    }
  }
  
  // 7. Build the Sanity document
  const excerpt = stripHtml(post.excerpt?.rendered || '');
  const readingTime = Math.max(1, Math.ceil(stripHtml(post.content.rendered).split(/\s+/).length / 250));
  
  const doc = {
    _type: 'article',
    title: post.title.rendered.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&amp;/g, '&'),
    slug: { _type: 'slug', current: post.slug },
    publishedAt: post.date,
    excerpt,
    readingTimeMinutes: readingTime,
    body,
    wpId: post.id,
  };
  
  if (categoryRef) {
    doc.category = { _type: 'reference', _ref: categoryRef };
  }
  
  if (authorRef) {
    doc.author = { _type: 'reference', _ref: authorRef };
  }
  
  if (heroImageAsset) {
    doc.heroImage = { _type: 'image', asset: { _type: 'reference', _ref: heroImageAsset._id } };
    doc.heroImageUrl = `https://cdn.sanity.io/images/${sanity.config().projectId}/${sanity.config().dataset}/${heroImageAsset._id.replace('image-', '').replace(/-([a-z]+)$/, '.$1')}`;
  }
  
  // 8. Create in Sanity
  console.log('\nCreating article in Sanity...');
  const result = await sanity.create(doc);
  console.log(`  ✓ Created: ${result._id}`);
  console.log(`  Slug: /article/${post.slug}`);
  
  console.log('\n=== Done! Check the article at: ===');
  console.log(`  http://localhost:3000/article/${post.slug}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
