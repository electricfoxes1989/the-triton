// Triton scraper - collects all article URLs from category pages, then scrapes each article
import { writeFileSync, readFileSync, existsSync } from 'fs';

const PROGRESS_FILE = '/Users/elliefoxes/.openclaw/workspace/the-triton/scrape-progress.json';
const OUTPUT_FILE = '/Users/elliefoxes/.openclaw/workspace/the-triton/scraped-articles.json';

// Categories to scrape with their URL paths
const CATEGORIES = [
  { name: 'Stews', path: 'category/crew-life/stews' },
  { name: 'Engineers', path: 'category/crew-life/engineers' },
  { name: 'Captains', path: 'category/crew-life/captains' },
  { name: 'Chefs', path: 'category/crew-life/chefs' },
  { name: 'Deckhands', path: 'category/crew-life/deckhands' },
  { name: 'Destinations', path: 'category/destinations' },
  { name: 'Events', path: 'category/events' },
  { name: 'Photo Galleries', path: 'category/photo-galleries' },
  { name: 'Magazines', path: 'category/magazines' },
  { name: 'Hidden Gems', path: 'category/destinations/hidden-gems' },
  { name: 'Tributes', path: 'category/crew-life/tributes' },
  { name: 'Triton Test Team', path: 'category/crew-life/triton-test-team' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

function extractArticleUrls(html) {
  const urls = new Set();
  // Match links to articles (pattern: /YYYY/MM/slug/)
  const regex = /href="(https:\/\/www\.the-triton\.com\/\d{4}\/\d{2}\/[^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    let url = m[1].replace(/\/$/, '') + '/';
    urls.add(url);
  }
  return [...urls];
}

function extractArticleData(html, url) {
  const article = { url };
  
  // Title - from <h1> or og:title
  let m = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) 
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  article.title = m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
  
  // og:title fallback
  if (!article.title) {
    m = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    article.title = m ? m[1].trim() : '';
  }

  // Author
  m = html.match(/class="author[^"]*"[^>]*>([^<]+)</) 
    || html.match(/<span[^>]*class="[^"]*author[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  article.author = m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
  
  // Also try meta author
  if (!article.author) {
    m = html.match(/<meta\s+name="author"\s+content="([^"]+)"/i);
    article.author = m ? m[1].trim() : '';
  }

  // Publish date
  m = html.match(/<time[^>]*datetime="([^"]+)"/) 
    || html.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/i);
  article.publishDate = m ? m[1] : '';

  // Hero image
  m = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  article.heroImage = m ? m[1] : '';

  // Excerpt
  m = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  article.excerpt = m ? m[1].trim() : '';

  // Category from URL or breadcrumbs
  m = html.match(/<a[^>]*rel="category tag"[^>]*>([^<]+)</g);
  article.categories = m ? m.map(x => x.replace(/<a[^>]*>/, '').trim()) : [];

  // Tags
  m = html.match(/<a[^>]*rel="tag"[^>]*>([^<]+)</g);
  article.tags = m ? m.map(x => x.replace(/<a[^>]*>/, '').trim()) : [];
  // Deduplicate tags vs categories
  article.tags = article.tags.filter(t => !article.categories.includes(t));

  // Body content - try entry-content div
  m = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<footer|<\/article|<section)/i);
  if (!m) {
    m = html.match(/<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<footer)/i);
  }
  article.bodyHtml = m ? m[1].trim() : '';

  // Extract inline images from body
  const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/g;
  article.inlineImages = [];
  let img;
  while ((img = imgRegex.exec(article.bodyHtml)) !== null) {
    article.inlineImages.push(img[1]);
  }

  return article;
}

async function collectAllUrls() {
  const allUrls = new Set();
  
  // First scrape homepage pages
  console.log('Scraping homepage...');
  for (let page = 1; page <= 50; page++) {
    const url = page === 1 ? 'https://www.the-triton.com/' : `https://www.the-triton.com/page/${page}/`;
    const html = await fetchPage(url);
    if (!html) { console.log(`  Homepage page ${page}: no more pages`); break; }
    const urls = extractArticleUrls(html);
    if (urls.length === 0) { console.log(`  Homepage page ${page}: no articles found`); break; }
    const before = allUrls.size;
    urls.forEach(u => allUrls.add(u));
    console.log(`  Homepage page ${page}: found ${urls.length} links (${allUrls.size - before} new, total: ${allUrls.size})`);
    if (allUrls.size - before === 0 && page > 2) break; // No new articles
    await sleep(500);
  }

  // Then scrape each category with pagination
  for (const cat of CATEGORIES) {
    console.log(`Scraping category: ${cat.name}...`);
    for (let page = 1; page <= 30; page++) {
      const url = page === 1 
        ? `https://www.the-triton.com/${cat.path}/` 
        : `https://www.the-triton.com/${cat.path}/page/${page}/`;
      const html = await fetchPage(url);
      if (!html) { console.log(`  ${cat.name} page ${page}: no more pages`); break; }
      const urls = extractArticleUrls(html);
      if (urls.length === 0) break;
      const before = allUrls.size;
      urls.forEach(u => allUrls.add(u));
      console.log(`  ${cat.name} page ${page}: ${urls.length} links (${allUrls.size - before} new, total: ${allUrls.size})`);
      if (allUrls.size - before === 0 && page > 1) break;
      await sleep(500);
    }
  }

  return [...allUrls];
}

async function main() {
  let progress = { urls: [], scraped: [], articles: [] };
  if (existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
    console.log(`Resuming: ${progress.articles.length} already scraped, ${progress.urls.length} total URLs`);
  }

  // Step 1: Collect URLs if not done
  if (progress.urls.length === 0) {
    console.log('=== COLLECTING ARTICLE URLs ===');
    progress.urls = await collectAllUrls();
    console.log(`\nTotal unique article URLs: ${progress.urls.length}`);
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  }

  // Step 2: Scrape each article
  console.log('\n=== SCRAPING ARTICLES ===');
  const scrapedSet = new Set(progress.scraped);
  let count = 0;
  
  for (const url of progress.urls) {
    if (scrapedSet.has(url)) continue;
    count++;
    
    try {
      const html = await fetchPage(url);
      if (!html) {
        console.log(`  FAILED: ${url}`);
        continue;
      }
      const article = extractArticleData(html, url);
      progress.articles.push(article);
      progress.scraped.push(url);
      scrapedSet.add(url);
      console.log(`  [${progress.scraped.length}/${progress.urls.length}] ${article.title || url}`);
      
      // Save every 20 articles
      if (count % 20 === 0) {
        writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      }
      await sleep(300);
    } catch (e) {
      console.log(`  ERROR: ${url}: ${e.message}`);
    }
  }

  // Save final
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  writeFileSync(OUTPUT_FILE, JSON.stringify(progress.articles, null, 2));
  console.log(`\n=== DONE ===`);
  console.log(`Total articles scraped: ${progress.articles.length}`);
  console.log(`Articles with body: ${progress.articles.filter(a => a.bodyHtml).length}`);
  console.log(`Articles with hero image: ${progress.articles.filter(a => a.heroImage).length}`);
  console.log(`Articles with author: ${progress.articles.filter(a => a.author).length}`);
}

main().catch(console.error);
