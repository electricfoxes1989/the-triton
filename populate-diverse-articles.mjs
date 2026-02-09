import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Expanded hero images from yachting industry
const heroImages = [
  'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1535024966711-94d0c1ab6d0c?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1566024287286-457247b70310?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=1200&h=800&fit=crop',
];

const diverseArticles = [
  // News Category
  {
    title: 'Monaco Yacht Show 2026: Record-Breaking Attendance Expected',
    slug: 'monaco-yacht-show-2026-preview',
    excerpt: 'Industry insiders predict this year\'s Monaco Yacht Show will showcase over 125 superyachts as global demand for luxury vessels continues to surge.',
    category: 'news',
    author: 0,
    featured: true,
    heroImage: 0,
  },
  {
    title: 'New EU Environmental Regulations Impact Superyacht Operations',
    slug: 'eu-environmental-regulations-impact',
    excerpt: 'Brussels announces stricter emissions standards for superyachts operating in European waters, prompting industry-wide discussions on compliance strategies.',
    category: 'news',
    author: 0,
    featured: false,
    heroImage: 1,
  },
  {
    title: 'Crew Wages Rise 15% Across Mediterranean Fleet',
    slug: 'crew-wages-rise-mediterranean',
    excerpt: 'Labour shortages and increased demand drive significant salary increases for experienced yacht crew working the Mediterranean season.',
    category: 'news',
    author: 3,
    featured: false,
    heroImage: 2,
  },
  {
    title: 'Superyacht Industry Faces Cyber Security Challenges',
    slug: 'superyacht-cyber-security-challenges',
    excerpt: 'Maritime security experts warn of increasing cyber threats targeting superyacht systems, urging enhanced digital protection measures.',
    category: 'news',
    author: 2,
    featured: false,
    heroImage: 3,
  },
  
  // Captains Category
  {
    title: 'Navigating the Suez Canal: A Captain\'s Comprehensive Guide',
    slug: 'navigating-suez-canal-guide',
    excerpt: 'Veteran captain shares essential procedures, documentation requirements, and insider tips for safely transiting the Suez Canal with a superyacht.',
    category: 'captains',
    author: 0,
    featured: true,
    heroImage: 4,
  },
  {
    title: 'Weather Routing: Advanced Strategies for Atlantic Crossings',
    slug: 'weather-routing-atlantic-crossings',
    excerpt: 'Expert captains reveal their approaches to planning optimal routes across the Atlantic, balancing safety, comfort, and efficiency.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 5,
  },
  {
    title: 'Managing Owner Expectations During Extended Cruises',
    slug: 'managing-owner-expectations-cruises',
    excerpt: 'Communication strategies and best practices for maintaining positive owner relationships during long-range voyages.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 6,
  },
  {
    title: 'Emergency Towing Procedures: Lessons from Real Incidents',
    slug: 'emergency-towing-procedures',
    excerpt: 'Case studies and practical guidance on safely executing emergency towing operations in challenging conditions.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 7,
  },
  
  // Crew Life Category
  {
    title: 'From Galley to Glory: A Chef\'s Journey Through the Ranks',
    slug: 'chef-journey-through-ranks',
    excerpt: 'Award-winning superyacht chef shares her path from commis to head chef, including the challenges and triumphs along the way.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 8,
  },
  {
    title: 'Deckhand Diaries: Life Aboard During Caribbean Charter Season',
    slug: 'deckhand-diaries-caribbean-season',
    excerpt: 'A day-by-day account of the demanding yet rewarding life of a deckhand navigating back-to-back charters in the Caribbean.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 9,
  },
  {
    title: 'Interior Excellence: The Art of Five-Star Service at Sea',
    slug: 'interior-excellence-five-star-service',
    excerpt: 'Chief stews from leading superyachts share their secrets for delivering impeccable hospitality in a maritime environment.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 10,
  },
  {
    title: 'Engineering Life: Maintaining Complex Systems in Remote Waters',
    slug: 'engineering-life-remote-waters',
    excerpt: 'Chief engineer recounts the challenges of keeping a 70-metre yacht operational during an extended Pacific crossing.',
    category: 'crew-life',
    author: 2,
    featured: false,
    heroImage: 11,
  },
  {
    title: 'Crew Fitness: Staying Healthy During Long Contracts',
    slug: 'crew-fitness-long-contracts',
    excerpt: 'Personal trainers and crew wellness experts share practical exercise routines and nutrition advice for life aboard.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 0,
  },
  {
    title: 'Romance at Sea: Navigating Crew Relationships',
    slug: 'romance-at-sea-crew-relationships',
    excerpt: 'Honest conversations about the realities, challenges, and rewards of maintaining relationships whilst working aboard superyachts.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 1,
  },
  
  // Magazine Category
  {
    title: 'The Rise of Expedition Yachts: Exploring Earth\'s Final Frontiers',
    slug: 'rise-of-expedition-yachts',
    excerpt: 'In-depth analysis of the growing expedition yacht sector, from Antarctica to the Northwest Passage.',
    category: 'magazine',
    author: 0,
    featured: false,
    heroImage: 2,
  },
  {
    title: 'Sustainable Yachting: Beyond Hybrid Propulsion',
    slug: 'sustainable-yachting-beyond-hybrid',
    excerpt: 'Exploring innovative eco-friendly technologies including hydrogen fuel cells, solar sails, and waste management systems.',
    category: 'magazine',
    author: 2,
    featured: false,
    heroImage: 3,
  },
  {
    title: 'The New Wave: Young Captains Reshaping Maritime Leadership',
    slug: 'young-captains-reshaping-leadership',
    excerpt: 'Profile of five captains under 35 who are bringing fresh perspectives to traditional maritime command.',
    category: 'magazine',
    author: 0,
    featured: false,
    heroImage: 4,
  },
  {
    title: 'Luxury Redefined: The Latest in Yacht Interior Design',
    slug: 'luxury-redefined-yacht-interiors',
    excerpt: 'Top designers reveal 2026\'s most stunning yacht interiors, from minimalist Scandinavian to opulent Art Deco.',
    category: 'magazine',
    author: 1,
    featured: false,
    heroImage: 5,
  },
  {
    title: 'The Economics of Superyacht Ownership in 2026',
    slug: 'economics-superyacht-ownership-2026',
    excerpt: 'Comprehensive analysis of ownership costs, charter income potential, and investment considerations for prospective owners.',
    category: 'magazine',
    author: 0,
    featured: false,
    heroImage: 6,
  },
  {
    title: 'Yacht Toys: The Ultimate Guide to Water Sports Equipment',
    slug: 'yacht-toys-water-sports-guide',
    excerpt: 'From jet skis to submersibles, a comprehensive review of the latest toys and tenders transforming guest experiences.',
    category: 'magazine',
    author: 3,
    featured: false,
    heroImage: 7,
  },
  
  // Events Category
  {
    title: 'Antigua Charter Yacht Show: The Caribbean\'s Premier Event',
    slug: 'antigua-charter-yacht-show-2026',
    excerpt: 'Everything crew need to know about participating in the Caribbean\'s most important charter yacht showcase.',
    category: 'events',
    author: 3,
    featured: false,
    heroImage: 8,
  },
  {
    title: 'Crew Training Expo: New Courses for 2026',
    slug: 'crew-training-expo-2026',
    excerpt: 'Highlights from this year\'s training expo including advanced firefighting, medical care, and leadership development.',
    category: 'events',
    author: 3,
    featured: false,
    heroImage: 9,
  },
  {
    title: 'Palma Superyacht Show: Mediterranean Season Kickoff',
    slug: 'palma-superyacht-show-2026',
    excerpt: 'The essential guide to networking opportunities, yacht displays, and industry parties at Palma\'s premier event.',
    category: 'events',
    author: 0,
    featured: false,
    heroImage: 10,
  },
  {
    title: 'METSTRADE Amsterdam: Innovation in Marine Equipment',
    slug: 'metstrade-amsterdam-2026',
    excerpt: 'Engineers and technical crew explore cutting-edge marine technology at the world\'s largest trade show.',
    category: 'events',
    author: 2,
    featured: false,
    heroImage: 11,
  },
  
  // Additional diverse articles
  {
    title: 'Greek Islands Cruising: Hidden Gems Beyond Mykonos',
    slug: 'greek-islands-hidden-gems',
    excerpt: 'Experienced captains reveal lesser-known Greek anchorages offering stunning beauty without the crowds.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 0,
  },
  {
    title: 'Provisioning in the South Pacific: A Logistical Challenge',
    slug: 'provisioning-south-pacific',
    excerpt: 'Chief stew shares strategies for sourcing quality provisions in remote Pacific islands during extended cruises.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 1,
  },
  {
    title: 'Night Watch: The Unsung Heroes of 24/7 Operations',
    slug: 'night-watch-unsung-heroes',
    excerpt: 'Exploring the critical role of night watch crew and the unique challenges they face keeping yachts safe.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 2,
  },
  {
    title: 'Yacht Refits: Planning for Success in European Yards',
    slug: 'yacht-refits-european-yards',
    excerpt: 'Comprehensive guide to selecting yards, managing budgets, and coordinating major refit projects.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 3,
  },
  {
    title: 'Wine Service Excellence: Sommelier Skills for Superyacht Stews',
    slug: 'wine-service-excellence-stews',
    excerpt: 'Master sommelier teaches essential wine knowledge and service techniques for interior crew.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 4,
  },
  {
    title: 'Diesel Engine Diagnostics: Troubleshooting Common Issues',
    slug: 'diesel-engine-diagnostics',
    excerpt: 'Senior engineers share systematic approaches to identifying and resolving engine problems at sea.',
    category: 'magazine',
    author: 2,
    featured: false,
    heroImage: 5,
  },
  {
    title: 'Crew Recruitment: Finding Your Dream Yacht Position',
    slug: 'crew-recruitment-dream-position',
    excerpt: 'Industry recruiters reveal what they look for in candidates and how to stand out in a competitive market.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 6,
  },
  {
    title: 'Bahamas Cruising Guide: From Nassau to the Exumas',
    slug: 'bahamas-cruising-guide',
    excerpt: 'Complete navigation guide to the Bahamas including anchorages, marinas, customs procedures, and local insights.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 7,
  },
  {
    title: 'Tender Operations: Safety and Best Practices',
    slug: 'tender-operations-safety',
    excerpt: 'Essential training for deck crew on safe tender operations, from launching to guest transfers in various conditions.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 8,
  },
  {
    title: 'The Art of Table Setting: Formal Dining Aboard',
    slug: 'art-of-table-setting-formal-dining',
    excerpt: 'Chief stews demonstrate proper table settings for various dining occasions, from casual lunches to formal dinners.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 9,
  },
  {
    title: 'Satellite Communications: Staying Connected Offshore',
    slug: 'satellite-communications-offshore',
    excerpt: 'Technical overview of satellite systems, bandwidth management, and troubleshooting connectivity issues.',
    category: 'magazine',
    author: 2,
    featured: false,
    heroImage: 10,
  },
  {
    title: 'Crew Contracts: Understanding Your Rights and Obligations',
    slug: 'crew-contracts-rights-obligations',
    excerpt: 'Maritime lawyer explains essential contract terms, common pitfalls, and how to protect yourself legally.',
    category: 'news',
    author: 0,
    featured: false,
    heroImage: 11,
  },
  {
    title: 'Southeast Asia Cruising: Thailand to Indonesia',
    slug: 'southeast-asia-cruising-guide',
    excerpt: 'Captains share their favourite routes through Southeast Asian waters, including visa requirements and local customs.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 0,
  },
  {
    title: 'Crew Savings: Financial Planning for Maritime Professionals',
    slug: 'crew-savings-financial-planning',
    excerpt: 'Financial advisors specialising in maritime careers offer practical advice on saving, investing, and tax planning.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 1,
  },
  {
    title: 'The Future of Autonomous Yachts: Technology Meets Tradition',
    slug: 'future-autonomous-yachts',
    excerpt: 'Exploring emerging autonomous navigation systems and their potential impact on traditional yacht operations.',
    category: 'magazine',
    author: 2,
    featured: false,
    heroImage: 2,
  },
  {
    title: 'Crew Turnover: Strategies for Retention and Team Building',
    slug: 'crew-turnover-retention-strategies',
    excerpt: 'Captains and management companies share successful approaches to reducing turnover and building cohesive teams.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 3,
  },
];

async function migrate() {
  try {
    console.log('Starting enhanced Sanity migration with diverse articles...\n');
    
    const articleDocs = [];
    
    for (let i = 0; i < diverseArticles.length; i++) {
      const article = diverseArticles[i];
      const publishDate = new Date();
      publishDate.setDate(publishDate.getDate() - i); // Stagger publish dates
      
      const doc = {
        _type: 'article',
        _id: `article-diverse-${article.slug}`,
        title: article.title,
        slug: { _type: 'slug', current: article.slug },
        excerpt: article.excerpt,
        publishedAt: publishDate.toISOString(),
        heroImageUrl: heroImages[article.heroImage],
        featured: article.featured,
        category: {
          _type: 'reference',
          _ref: `category-${article.category}`,
        },
        author: {
          _type: 'reference',
          _ref: article.author === 0 ? 'author-james-morrison' :
                article.author === 1 ? 'author-sarah-chen' :
                article.author === 2 ? 'author-michael-torres' :
                'author-emma-richardson',
        },
        body: [
          {
            _type: 'block',
            _key: `block-${i}-1`,
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: `span-${i}-1`,
                text: article.excerpt,
                marks: [],
              },
            ],
          },
          {
            _type: 'block',
            _key: `block-${i}-2`,
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: `span-${i}-2`,
                text: 'This article provides comprehensive coverage of the topic with insights from industry professionals. Content includes practical advice, real-world examples, and expert analysis to help yacht crew and captains navigate the challenges and opportunities in today\'s superyacht industry.',
                marks: [],
              },
            ],
          },
          {
            _type: 'block',
            _key: `block-${i}-3`,
            style: 'h2',
            children: [
              {
                _type: 'span',
                _key: `span-${i}-3`,
                text: 'Key Takeaways',
                marks: [],
              },
            ],
          },
          {
            _type: 'block',
            _key: `block-${i}-4`,
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: `span-${i}-4`,
                text: 'Industry experts emphasise the importance of continuous professional development, maintaining high safety standards, and fostering positive crew dynamics. Whether you\'re a seasoned professional or new to the industry, staying informed about latest trends and best practices is essential for career success in the superyacht sector.',
                marks: [],
              },
            ],
          },
        ],
      };
      articleDocs.push(doc);
    }
    
    console.log(`\nPrepared ${articleDocs.length} diverse articles:`);
    console.log(`- News: ${diverseArticles.filter(a => a.category === 'news').length}`);
    console.log(`- Captains: ${diverseArticles.filter(a => a.category === 'captains').length}`);
    console.log(`- Crew Life: ${diverseArticles.filter(a => a.category === 'crew-life').length}`);
    console.log(`- Magazine: ${diverseArticles.filter(a => a.category === 'magazine').length}`);
    console.log(`- Events: ${diverseArticles.filter(a => a.category === 'events').length}`);
    
    // Create transaction
    console.log('\nCreating documents in Sanity...');
    const transaction = client.transaction();
    
    articleDocs.forEach(doc => {
      transaction.createOrReplace(doc);
    });
    
    const result = await transaction.commit();
    
    console.log('\n✅ Enhanced migration completed successfully!');
    console.log(`Created/updated ${result.results.length} diverse articles in Sanity.`);
    console.log('\nYour website now features:');
    console.log('- Comprehensive coverage of global yachting destinations');
    console.log('- Diverse crew perspectives (captains, chefs, engineers, deckhands, stews)');
    console.log('- Technical articles on systems and maintenance');
    console.log('- Lifestyle and career development content');
    console.log('- Event coverage and industry news');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
