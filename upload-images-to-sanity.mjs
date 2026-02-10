import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: '9w7gje4u',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.VITE_SANITY_API_TOKEN,
  useCdn: false,
});

// Mapping of article titles to image filenames
const imageMapping = {
  // Galleries
  "2023 Monaco Yacht Show": "monaco-yacht-show-2023.jpg",
  "2023 Cannes Yachting Festival": "cannes-yachting-festival-2023.jpg",
  "2023 Palm Beach International Boat Show Crew Gallery": "palm-beach-boat-show-2023.jpg",
  "2023 Miami International Boat Show Crew Gallery": "miami-boat-show-2023.jpg",
  "Fort Lauderdale International Boat Show 2022 Crew Gallery": "flibs-2022.jpg",
  "Yacht Chandlers 12th Annual Crew Appreciation Party": "crew-appreciation-party-2024.jpg",
  "Crew, Captains & Cocktails at Lewis Marine": "captains-cocktails-lewis-marine.jpg",
  "2023 Yacht Biker Poker Run by National Marine": "yacht-biker-poker-run-2023.jpg",
  "Yacht Chef & Stew Mixology Competition": "mixology-competition.jpg",
  "2023 International Boatbuilders' Exhibition and Conference": "ibex-2023.jpg",
  
  // Expos
  "Triton Fall Expo 2025 at National Marine Suppliers - Save the Date": "triton-expo-2025-save-date.jpg",
  "Triton Fall Expo 2024: Record Attendance Despite Weather": "triton-fall-expo-2024.jpg",
  "Triton Expo 2024 at Pier Sixty-Six: A Record-Breaking Success": "triton-expo-pier-sixty-six-2024.jpg",
  "Triton Expo North at Derecktor Fort Pierce: Networking Meets Recruitment": "triton-expo-north-derecktor-2023.jpg",
  "Triton Expo 2023: Yachtie Games Crown Red Team Champions": "triton-expo-yachtie-games-2023.jpg",
};

async function uploadImageToSanity(imagePath, filename) {
  console.log(`Uploading ${filename}...`);
  
  const imageBuffer = fs.readFileSync(imagePath);
  const asset = await client.assets.upload('image', imageBuffer, {
    filename: filename,
  });
  
  console.log(`✓ Uploaded ${filename} (ID: ${asset._id})`);
  return asset;
}

async function updateArticleWithImage(articleTitle, imageAsset) {
  console.log(`Updating article: ${articleTitle}`);
  
  // Find the article by title
  const query = `*[_type == "article" && title == $title][0]`;
  const article = await client.fetch(query, { title: articleTitle });
  
  if (!article) {
    console.log(`✗ Article not found: ${articleTitle}`);
    return false;
  }
  
  // Update the article with the image
  await client
    .patch(article._id)
    .set({
      mainImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
    })
    .commit();
  
  console.log(`✓ Updated article: ${articleTitle}\n`);
  return true;
}

async function main() {
  console.log('Starting image upload to Sanity...\n');
  
  const imageDir = '/home/ubuntu/webdev-static-assets';
  let successCount = 0;
  let failCount = 0;
  
  for (const [articleTitle, filename] of Object.entries(imageMapping)) {
    try {
      const imagePath = path.join(imageDir, filename);
      
      if (!fs.existsSync(imagePath)) {
        console.log(`✗ Image file not found: ${filename}\n`);
        failCount++;
        continue;
      }
      
      // Upload image to Sanity
      const imageAsset = await uploadImageToSanity(imagePath, filename);
      
      // Update article with image
      const success = await updateArticleWithImage(articleTitle, imageAsset);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
    } catch (error) {
      console.error(`✗ Error processing ${articleTitle}:`, error.message, '\n');
      failCount++;
    }
  }
  
  console.log('='.repeat(50));
  console.log(`Upload complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${Object.keys(imageMapping).length}`);
}

main().catch(console.error);
