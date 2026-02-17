#!/usr/bin/env node
/**
 * Fast batch import: WP REST API → Sanity
 * Uses Sanity mutations API for batch operations.
 */
import { createClient } from '@sanity/client';
import fs from 'fs';

const SANITY_TOKEN = 'skPOTfGUvSoRQcoIDG2aUgY5IZ3LxRZgUyE8wjGyYD6f48l0twVYbenDvKqKeuxW5is1wtV09I2qBN6vMcp78HDGuNcw7Uzod64EjV8Mla9BCAHC4NkgmAAsSr92nfCsBpvOSKFGpJ3yH2tNcBQyBzUF1T8o1o8yzR7CGF5O0g5qRgZGerSd';
const sanity = createClient({ projectId: '48r6hh2o', dataset: 'production', token: SANITY_TOKEN, apiVersion: '2024-01-01', useCdn: false });
const WP_API = 'https://www.the-triton.com/wp-json/wp/v2';
const PROGRESS_FILE = 'import-progress.json';
const UPDATE = process.argv.includes('--update');

function decodeHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8212;/g, '—').replace(/&#8211;/g, '–')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8230;/g, '…')
    .replace(/&hellip;/g, '…').replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').trim();
}

function htmlToPortableText(html) {
  if (!html) return [];
  const blocks = [];
  const parts = html.split(/(<\/?(?:p|h[1-6]|blockquote|ul|ol|li|figure|figcaption|div)[^>]*>)/gi);
  let buffer = '';
  for (const part of parts) {
    const m = part.match(/^<(\/?)(\w+)/i);
    if (m) {
      if (m[1] && ['p','h1','h2','h3','h4','h5','h6','blockquote','li','div'].includes(m[2].toLowerCase())) {
        const text = decodeHtml(buffer);
        if (text) {
          const lt = m[2].toLowerCase();
          blocks.push({
            _type: 'block', _key: Math.random().toString(36).slice(2,10),
            style: /^h[1-6]$/.test(lt) ? lt : lt === 'blockquote' ? 'blockquote' : 'normal',
            markDefs: [],
            children: [{ _type: 'span', _key: Math.random().toString(36).slice(2,10), marks: [], text }],
          });
        }
        buffer = '';
      } else if (!m[1]) buffer = '';
    } else buffer += part;
  }
  const rem = decodeHtml(buffer);
  if (rem) blocks.push({ _type: 'block', _key: Math.random().toString(36).slice(2,10), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2,10), marks: [], text: rem }] });
  return blocks;
}

async function fetchJSON(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (r.status === 400) return null;
      if (r.status === 429) { await new Promise(r => setTimeout(r, 5000)); continue; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) { if (i === 2) throw e; await new Promise(r => setTimeout(r, 2000)); }
  }
}

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

async function main() {
  console.log('=== Fast Batch Import ===\n');

  const existingSlugs = new Set(await sanity.fetch('*[_type=="article"].slug.current'));
  const existingSlugToId = {};
  if (UPDATE) {
    const existing = await sanity.fetch('*[_type=="article"]{_id, "slug": slug.current}');
    for (const a of existing) existingSlugToId[a.slug] = a._id;
  }
  console.log(`Existing: ${existingSlugs.size}`);

  // WP categories
  const wpCats = {};
  for (let p = 1; p <= 3; p++) {
    const cats = await fetchJSON(`${WP_API}/categories?per_page=100&page=${p}`);
    if (!cats?.length) break;
    for (const c of cats) wpCats[c.id] = c;
  }

  // Pre-create all authors we need
  const authorCache = {};
  const existingAuthors = await sanity.fetch('*[_type=="author"]{_id, "slug": slug.current}');
  for (const a of existingAuthors) authorCache[a.slug] = a._id;

  function getAuthorSlug(name) {
    return name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || null;
  }

  // Load progress
  let progress;
  try { progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); } catch { progress = { imported: {}, failed: {} }; }
  let imported = Object.keys(progress.imported).length;
  let failed = Object.keys(progress.failed).length;
  let skipped = 0;

  console.log(`Resume: ${imported} imported, ${failed} failed`);
  if (UPDATE) console.log('UPDATE MODE enabled');

  // Fetch pages of 100 from WP and batch-create
  for (let page = 1; ; page++) {
    const posts = await fetchJSON(`${WP_API}/posts?per_page=100&page=${page}&_embed&orderby=date&order=desc`);
    if (!posts || !Array.isArray(posts) || !posts.length) break;

    // Collect new authors needed
    const newAuthors = [];
    for (const wp of posts) {
      const name = wp._embedded?.author?.[0]?.name;
      const slug = getAuthorSlug(name);
      if (slug && !authorCache[slug]) {
        newAuthors.push({ name, slug });
        authorCache[slug] = `pending-${slug}`;
      }
    }
    // Create authors
    for (const { name, slug } of newAuthors) {
      if (authorCache[slug]?.startsWith('pending-')) {
        try {
          const doc = await sanity.create({ _type: 'author', name, slug: { _type: 'slug', current: slug }, bio: '' });
          authorCache[slug] = doc._id;
        } catch (e) {
          // might already exist
          const existing = await sanity.fetch('*[_type=="author" && slug.current==$slug][0]._id', { slug });
          authorCache[slug] = existing || null;
        }
      }
    }

    // Batch create/update articles
    let tx = sanity.transaction();
    let txCount = 0;

    for (const wp of posts) {
      const slug = wp.slug;
      if (!slug || progress.imported[slug]) { skipped++; continue; }
      
      const alreadyExists = existingSlugs.has(slug);
      if (alreadyExists && !UPDATE) { skipped++; continue; }

      try {
        const title = decodeHtml(wp.title?.rendered);
        const excerpt = decodeHtml(wp.excerpt?.rendered);
        const body = htmlToPortableText(wp.content?.rendered);
        const authorName = wp._embedded?.author?.[0]?.name;
        const authorSlug = getAuthorSlug(authorName);
        const authorId = authorSlug ? authorCache[authorSlug] : null;
        const featMedia = wp._embedded?.['wp:featuredmedia']?.[0];
        const imageUrl = featMedia?.source_url || featMedia?.media_details?.sizes?.large?.source_url || '';
        const catId = mapCategory(wp.categories, wpCats);

        const data = {
          title, excerpt, body, heroImageUrl: imageUrl, publishedAt: wp.date,
          slug: { _type: 'slug', current: slug },
          category: { _type: 'reference', _ref: catId },
          ...(authorId && !authorId.startsWith?.('pending') ? { author: { _type: 'reference', _ref: authorId } } : {}),
        };

        if (alreadyExists && existingSlugToId[slug]) {
          tx = tx.patch(existingSlugToId[slug], p => p.set(data));
        } else {
          tx = tx.create({ _type: 'article', ...data });
        }
        txCount++;
        progress.imported[slug] = true;
        imported++;
      } catch (e) {
        progress.failed[slug] = e.message;
        failed++;
      }
    }

    if (txCount > 0) {
      try {
        await tx.commit();
        console.log(`Page ${page}: committed ${txCount} articles (total: ${imported})`);
      } catch (e) {
        console.error(`Page ${page} commit failed: ${e.message.slice(0,150)}`);
        // Retry individually
        console.log('Retrying individually...');
        // Reset progress for this batch and redo one by one
        for (const wp of posts) {
          const slug = wp.slug;
          if (!slug || !progress.imported[slug]) continue;
          // Was just marked - try individual create
          const alreadyExists = existingSlugs.has(slug);
          try {
            const title = decodeHtml(wp.title?.rendered);
            const excerpt = decodeHtml(wp.excerpt?.rendered);
            const body = htmlToPortableText(wp.content?.rendered);
            const authorName = wp._embedded?.author?.[0]?.name;
            const authorSlug = getAuthorSlug(authorName);
            const authorId = authorSlug ? authorCache[authorSlug] : null;
            const featMedia = wp._embedded?.['wp:featuredmedia']?.[0];
            const imageUrl = featMedia?.source_url || featMedia?.media_details?.sizes?.large?.source_url || '';
            const catId = mapCategory(wp.categories, wpCats);
            const data = {
              _type: 'article', title, excerpt, body, heroImageUrl: imageUrl, publishedAt: wp.date,
              slug: { _type: 'slug', current: slug },
              category: { _type: 'reference', _ref: catId },
              ...(authorId && !authorId.startsWith?.('pending') ? { author: { _type: 'reference', _ref: authorId } } : {}),
            };
            if (alreadyExists && existingSlugToId[slug]) {
              await sanity.patch(existingSlugToId[slug]).set(data).commit();
            } else {
              await sanity.create(data);
            }
          } catch (e2) {
            delete progress.imported[slug];
            progress.failed[slug] = e2.message;
            imported--;
            failed++;
          }
        }
      }
    } else {
      console.log(`Page ${page}: all ${posts.length} skipped`);
    }

    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
  const total = await sanity.fetch('count(*[_type=="article"])');
  console.log(`\n=== DONE === Imported: ${imported} | Failed: ${failed} | Skipped: ${skipped} | Total: ${total}`);
}

main().catch(console.error);
