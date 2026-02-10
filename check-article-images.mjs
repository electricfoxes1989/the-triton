import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '9w7gje4u',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.VITE_SANITY_API_TOKEN,
  useCdn: false,
});

async function checkArticleImages() {
  console.log('Querying Sanity for all articles...\n');
  
  const query = `*[_type == "article"] | order(publishedAt desc) {
    title,
    slug,
    category->{title, slug},
    publishedAt,
    excerpt,
    mainImage
  }`;
  
  const articles = await client.fetch(query);
  
  console.log(`Found ${articles.length} total articles\n`);
  
  // Group by category
  const byCategory = articles.reduce((acc, article) => {
    const catSlug = article.category?.slug?.current || 'uncategorized';
    if (!acc[catSlug]) acc[catSlug] = [];
    acc[catSlug].push(article);
    return acc;
  }, {});
  
  // Check galleries
  console.log('=== GALLERIES ===');
  const galleries = byCategory['galleries'] || [];
  console.log(`Total: ${galleries.length}`);
  const galleriesWithImages = galleries.filter(a => a.mainImage);
  const galleriesWithoutImages = galleries.filter(a => !a.mainImage);
  console.log(`With images: ${galleriesWithImages.length}`);
  console.log(`Without images: ${galleriesWithoutImages.length}`);
  if (galleriesWithoutImages.length > 0) {
    console.log('\nGalleries missing images:');
    galleriesWithoutImages.forEach(a => console.log(`  - ${a.title}`));
  }
  
  // Check expos
  console.log('\n=== EXPOS ===');
  const expos = byCategory['expos'] || [];
  console.log(`Total: ${expos.length}`);
  const exposWithImages = expos.filter(a => a.mainImage);
  const exposWithoutImages = expos.filter(a => !a.mainImage);
  console.log(`With images: ${exposWithImages.length}`);
  console.log(`Without images: ${exposWithoutImages.length}`);
  if (exposWithoutImages.length > 0) {
    console.log('\nExpos missing images:');
    exposWithoutImages.forEach(a => console.log(`  - ${a.title}`));
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total articles needing images: ${galleriesWithoutImages.length + exposWithoutImages.length}`);
  
  return {
    galleries: galleriesWithoutImages,
    expos: exposWithoutImages
  };
}

checkArticleImages().catch(console.error);
