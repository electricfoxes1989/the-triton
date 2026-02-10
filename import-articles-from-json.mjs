import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const client = createClient({
  projectId: '9w7gje4u',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.VITE_SANITY_API_TOKEN,
  useCdn: false,
});

// Helper: Download image from URL
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Helper: Upload image to Sanity
async function uploadImageToSanity(imageBuffer, filename) {
  const asset = await client.assets.upload('image', imageBuffer, {
    filename: filename,
  });
  return asset;
}

// Helper: Get or create category by slug
async function getCategoryBySlug(slug) {
  const query = `*[_type == "category" && slug.current == $slug][0]`;
  const category = await client.fetch(query, { slug });
  
  if (!category) {
    throw new Error(`Category not found: ${slug}. Please create it in Sanity Studio first.`);
  }
  
  return category;
}

// Helper: Get or create author by name
async function getOrCreateAuthor(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const query = `*[_type == "author" && slug.current == $slug][0]`;
  let author = await client.fetch(query, { slug });
  
  if (!author) {
    console.log(`Creating author: ${name}`);
    author = await client.create({
      _type: 'author',
      name: name,
      slug: { _type: 'slug', current: slug },
      bio: `Writer at The Triton`,
    });
  }
  
  return author;
}

// Helper: Convert plain text to Portable Text
function textToPortableText(text) {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(paragraph => ({
    _type: 'block',
    _key: Math.random().toString(36).substr(2, 9),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substr(2, 9),
        text: paragraph.trim(),
        marks: [],
      },
    ],
    markDefs: [],
  }));
}

// Main import function
async function importArticle(articleData) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Importing: ${articleData.title}`);
  console.log('='.repeat(60));
  
  try {
    // Get category
    console.log(`📁 Finding category: ${articleData.category}`);
    const category = await getCategoryBySlug(articleData.category);
    
    // Get or create author
    console.log(`👤 Finding/creating author: ${articleData.author}`);
    const author = await getOrCreateAuthor(articleData.author);
    
    // Handle image if URL provided
    let mainImage = null;
    if (articleData.imageUrl) {
      try {
        console.log(`🖼️  Downloading image from: ${articleData.imageUrl}`);
        const imageBuffer = await downloadImage(articleData.imageUrl);
        const filename = path.basename(new URL(articleData.imageUrl).pathname);
        
        console.log(`📤 Uploading image to Sanity: ${filename}`);
        const imageAsset = await uploadImageToSanity(imageBuffer, filename);
        
        mainImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
          alt: articleData.imageAlt || articleData.title,
        };
        console.log(`✓ Image uploaded successfully`);
      } catch (imageError) {
        console.log(`⚠️  Image upload failed: ${imageError.message}`);
        console.log(`   Article will be created without image`);
      }
    }
    
    // Convert body text to Portable Text
    const body = textToPortableText(articleData.body);
    
    // Create article document
    console.log(`📝 Creating article document...`);
    const article = await client.create({
      _type: 'article',
      title: articleData.title,
      slug: {
        _type: 'slug',
        current: articleData.slug,
      },
      category: {
        _type: 'reference',
        _ref: category._id,
      },
      publishedAt: articleData.publishedAt,
      excerpt: articleData.excerpt,
      mainImage: mainImage,
      author: {
        _type: 'reference',
        _ref: author._id,
      },
      body: body,
      tags: articleData.tags || [],
      featured: articleData.featured || false,
    });
    
    console.log(`✅ Article created successfully!`);
    console.log(`   ID: ${article._id}`);
    console.log(`   URL: /article/${articleData.slug}`);
    
    return { success: true, article };
    
  } catch (error) {
    console.error(`❌ Error importing article: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node import-articles-from-json.mjs <json-file>');
    console.error('Example: node import-articles-from-json.mjs sample-articles.json');
    process.exit(1);
  }
  
  const jsonFile = args[0];
  
  if (!fs.existsSync(jsonFile)) {
    console.error(`Error: File not found: ${jsonFile}`);
    process.exit(1);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SANITY ARTICLE IMPORT`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Source file: ${jsonFile}`);
  console.log(`Project: 9w7gje4u`);
  console.log(`Dataset: production`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Load articles from JSON
  const articlesData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  
  if (!Array.isArray(articlesData)) {
    console.error('Error: JSON file must contain an array of articles');
    process.exit(1);
  }
  
  console.log(`Found ${articlesData.length} articles to import\n`);
  
  // Import each article
  const results = [];
  for (const articleData of articlesData) {
    const result = await importArticle(articleData);
    results.push(result);
    
    // Small delay between imports to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`IMPORT COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${results.length}`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (failCount > 0) {
    console.log('Failed articles:');
    results.filter(r => !r.success).forEach((r, i) => {
      console.log(`${i + 1}. ${r.error}`);
    });
  }
}

main().catch(console.error);
