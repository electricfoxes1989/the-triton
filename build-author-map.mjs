#!/usr/bin/env node
/**
 * Build a mapping of WP author IDs to author names
 * by scraping the meta author tag from article pages.
 */
import fs from 'fs';

async function main() {
  // Step 1: Get unique author IDs from WP API
  const authorIds = new Set();
  const authorToPost = {}; // authorId -> first post URL
  
  for (let page = 1; page <= 78; page++) {
    const r = await fetch(`https://www.the-triton.com/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=author,link`, 
      { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) break;
    const posts = await r.json();
    if (!posts.length) break;
    
    for (const p of posts) {
      if (!authorIds.has(p.author)) {
        authorIds.add(p.author);
        authorToPost[p.author] = p.link;
      }
    }
    
    if (authorIds.size >= 100) break; // Probably found them all
    process.stdout.write(`Page ${page}: ${authorIds.size} unique authors\r`);
  }
  
  console.log(`\nFound ${authorIds.size} unique author IDs`);
  
  // Step 2: Scrape meta author from one page per author
  const authorMap = {};
  for (const [authorId, postUrl] of Object.entries(authorToPost)) {
    try {
      const r = await fetch(postUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await r.text();
      
      // Try meta author tag
      const metaMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
      if (metaMatch) {
        authorMap[authorId] = metaMatch[1];
        console.log(`  Author ${authorId}: ${metaMatch[1]}`);
        continue;
      }
      
      // Try schema.org JSON-LD
      const schemaMatch = html.match(/"@type":"Person"[^}]*"name":"([^"]+)"/);
      if (schemaMatch) {
        authorMap[authorId] = schemaMatch[1];
        console.log(`  Author ${authorId}: ${schemaMatch[1]}`);
        continue;
      }
      
      // Try "View all posts by" link
      const viewMatch = html.match(/View all posts by ([^<&]+)/);
      if (viewMatch) {
        authorMap[authorId] = viewMatch[1].trim();
        console.log(`  Author ${authorId}: ${viewMatch[1].trim()}`);
        continue;
      }
      
      console.log(`  Author ${authorId}: NOT FOUND`);
    } catch (e) {
      console.error(`  Author ${authorId}: ERROR ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  fs.writeFileSync('wp-author-map.json', JSON.stringify(authorMap, null, 2));
  console.log(`\nSaved ${Object.keys(authorMap).length} author mappings to wp-author-map.json`);
}

main().catch(console.error);
