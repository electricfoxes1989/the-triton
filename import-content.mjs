import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

const client = createClient({
  projectId: '9w7gje4u',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-02-10'
});

// Load import data
const importData = JSON.parse(readFileSync('/home/ubuntu/sanity-import-data.json', 'utf-8'));

async function importContent() {
  try {
    console.log('Starting Sanity CMS import...\n');

    // Step 1: Create/update categories
    console.log('Step 1: Creating categories...');
    const categories = [
      {
        _type: 'category',
        _id: 'category-galleries',
        title: 'Galleries',
        slug: { _type: 'slug', current: 'galleries' },
        description: 'Photo galleries from boat shows, expos, and industry events'
      },
      {
        _type: 'category',
        _id: 'category-expos',
        title: 'Expos',
        slug: { _type: 'slug', current: 'expos' },
        description: 'Triton Expo announcements, recaps, and exhibitor information'
      }
    ];

    for (const cat of categories) {
      await client.createOrReplace(cat);
      console.log(`✓ Created/updated category: ${cat.title}`);
    }

    // Step 2: Create default author (Triton Staff) if needed
    console.log('\nStep 2: Creating default author...');
    const defaultAuthor = {
      _type: 'author',
      _id: 'author-triton-staff',
      name: 'Triton Staff',
      slug: { _type: 'slug', current: 'triton-staff' },
      bio: 'The Triton editorial team'
    };
    await client.createOrReplace(defaultAuthor);
    console.log('✓ Created/updated author: Triton Staff');

    // Step 3: Import galleries
    console.log('\nStep 3: Importing gallery articles...');
    let galleryCount = 0;
    for (const gallery of importData.galleries) {
      const doc = {
        _type: 'article',
        title: gallery.title,
        slug: { _type: 'slug', current: gallery.slug },
        category: { _type: 'reference', _ref: 'category-galleries' },
        author: { _type: 'reference', _ref: 'author-triton-staff' },
        publishedAt: gallery.publishedAt,
        excerpt: gallery.excerpt,
        body: [
          {
            _type: 'block',
            _key: 'block1',
            children: [{ _type: 'span', _key: 'span1', text: gallery.body, marks: [] }],
            markDefs: [],
            style: 'normal'
          }
        ]
      };

      const result = await client.create(doc);
      galleryCount++;
      console.log(`✓ Imported gallery ${galleryCount}/10: ${gallery.title}`);
    }

    // Step 4: Import expos
    console.log('\nStep 4: Importing expo articles...');
    let expoCount = 0;
    for (const expo of importData.expos) {
      const doc = {
        _type: 'article',
        title: expo.title,
        slug: { _type: 'slug', current: expo.slug },
        category: { _type: 'reference', _ref: 'category-expos' },
        author: { _type: 'reference', _ref: 'author-triton-staff' },
        publishedAt: expo.publishedAt,
        excerpt: expo.excerpt,
        body: [
          {
            _type: 'block',
            _key: 'block1',
            children: [{ _type: 'span', _key: 'span1', text: expo.body, marks: [] }],
            markDefs: [],
            style: 'normal'
          }
        ]
      };

      const result = await client.create(doc);
      expoCount++;
      console.log(`✓ Imported expo ${expoCount}/5: ${expo.title}`);
    }

    console.log('\n✅ Import complete!');
    console.log(`\nSummary:`);
    console.log(`- Categories created: 2`);
    console.log(`- Galleries imported: ${galleryCount}`);
    console.log(`- Expos imported: ${expoCount}`);
    console.log(`- Total articles: ${galleryCount + expoCount}`);
    console.log(`\nNext steps:`);
    console.log(`1. Visit https://your-site.com/galleries to see gallery articles`);
    console.log(`2. Visit https://your-site.com/expos to see expo articles`);
    console.log(`3. Add images to articles in Sanity Studio`);

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

importContent();
