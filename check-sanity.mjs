import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

console.log('Sanity Configuration:');
console.log('Project ID:', process.env.VITE_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.VITE_SANITY_DATASET);
console.log('Token:', process.env.SANITY_API_TOKEN ? '✓ Set' : '✗ Missing');
console.log('\n---\n');

async function checkSanity() {
  try {
    // Check all document types
    console.log('Checking document types...');
    const types = await client.fetch(`
      array::unique(*[]._type)
    `);
    console.log('Document types found:', types);
    console.log('\n---\n');

    // Count documents by type
    for (const type of types) {
      const count = await client.fetch(`count(*[_type == $type])`, { type });
      console.log(`${type}: ${count} documents`);
    }
    console.log('\n---\n');

    // If articles exist, show first one
    if (types.includes('article')) {
      console.log('Sample article:');
      const article = await client.fetch(`*[_type == "article"][0]`);
      console.log(JSON.stringify(article, null, 2));
    } else {
      console.log('⚠️  No "article" type found in dataset');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
  }
}

checkSanity();
