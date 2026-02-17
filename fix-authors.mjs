#!/usr/bin/env node
/**
 * Fix all article author references by matching WP slugs
 */
import { createClient } from '@sanity/client';

const SANITY_TOKEN = 'skPOTfGUvSoRQcoIDG2aUgY5IZ3LxRZgUyE8wjGyYD6f48l0twVYbenDvKqKeuxW5is1wtV09I2qBN6vMcp78HDGuNcw7Uzod64EjV8Mla9BCAHC4NkgmAAsSr92nfCsBpvOSKFGpJ3yH2tNcBQyBzUF1T8o1o8yzR7CGF5O0g5qRgZGerSd';
const sanity = createClient({ projectId: '48r6hh2o', dataset: 'production', token: SANITY_TOKEN, apiVersion: '2024-01-01', useCdn: false });
const WP_API = 'https://www.the-triton.com/wp-json/wp/v2';

async function main() {
  // Get all authors
  const authors = await sanity.fetch('*[_type=="author"]{_id, "slug": slug.current}');
  const authorMap = {};
  for (const a of authors) authorMap[a.slug] = a._id;
  console.log(`${authors.length} authors`);

  // Get ALL article slugs and IDs (including those with null author)
  const articles = await sanity.fetch('*[_type=="article" && !defined(author)]{_id, "slug": slug.current}');
  const slugToId = {};
  for (const a of articles) slugToId[a.slug] = a._id;
  console.log(`${articles.length} articles need authors`);

  let fixed = 0;
  let remaining = articles.length;

  for (let page = 1; remaining > 0; page++) {
    let posts;
    try {
      const r = await fetch(`${WP_API}/posts?per_page=100&page=${page}&_embed&_fields=slug,_embedded`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (r.status === 400) break;
      if (!r.ok) { console.error(`HTTP ${r.status} on page ${page}`); break; }
      posts = await r.json();
    } catch (e) { console.error(`Fetch error page ${page}:`, e.message); break; }
    if (!Array.isArray(posts) || !posts.length) break;

    let tx = sanity.transaction();
    let txCount = 0;

    for (const wp of posts) {
      const articleId = slugToId[wp.slug];
      if (!articleId) continue;

      const authorName = wp._embedded?.author?.[0]?.name;
      if (!authorName) continue;

      const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      if (!authorMap[authorSlug]) {
        try {
          const doc = await sanity.create({ _type: 'author', name: authorName, slug: { _type: 'slug', current: authorSlug }, bio: '' });
          authorMap[authorSlug] = doc._id;
        } catch {
          const existing = await sanity.fetch('*[_type=="author" && slug.current==$slug][0]._id', { slug: authorSlug });
          if (existing) authorMap[authorSlug] = existing;
        }
      }

      const authorId = authorMap[authorSlug];
      if (!authorId) continue;

      tx = tx.patch(articleId, p => p.set({ author: { _type: 'reference', _ref: authorId } }));
      txCount++;
      delete slugToId[wp.slug];
      remaining--;
    }

    if (txCount > 0) {
      try {
        await tx.commit();
        fixed += txCount;
        console.log(`Page ${page}: fixed ${txCount} (total: ${fixed}, remaining: ${remaining})`);
      } catch (e) {
        console.error(`Page ${page} commit failed: ${e.message.slice(0,100)}`);
        remaining += txCount; // undo
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone! Fixed ${fixed}/${articles.length}`);
}

main().catch(console.error);
