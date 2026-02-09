import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Sample hero images from yachting industry
const heroImages = [
  'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1535024966711-94d0c1ab6d0c?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&h=800&fit=crop',
];

const categories = [
  { title: 'News', slug: 'news' },
  { title: 'Captains', slug: 'captains' },
  { title: 'Crew Life', slug: 'crew-life' },
  { title: 'Magazine', slug: 'magazine' },
  { title: 'Events', slug: 'events' },
];

const authors = [
  { name: 'Captain James Morrison', slug: 'james-morrison', bio: 'Veteran superyacht captain with 20 years of experience in the Mediterranean and Caribbean.' },
  { name: 'Sarah Chen', slug: 'sarah-chen', bio: 'Chief stew and interior specialist covering luxury yacht hospitality and crew management.' },
  { name: 'Michael Torres', slug: 'michael-torres', bio: 'Marine engineer and technical writer focusing on yacht systems and maintenance.' },
  { name: 'Emma Richardson', slug: 'emma-richardson', bio: 'Deckhand and crew lifestyle journalist documenting life aboard superyachts.' },
];

const sampleArticles = [
  {
    title: 'New Maritime Regulations Set to Transform Superyacht Operations in 2026',
    slug: 'new-maritime-regulations-2026',
    excerpt: 'Industry experts weigh in on upcoming regulatory changes affecting crew certification, environmental compliance, and operational standards across the global superyacht fleet.',
    category: 'news',
    author: 0,
    featured: true,
    heroImage: 0,
  },
  {
    title: 'Captain\'s Corner: Navigating the Challenges of Charter Season',
    slug: 'navigating-charter-season-challenges',
    excerpt: 'Veteran captains share their strategies for managing guest expectations, crew coordination, and operational excellence during peak charter months.',
    category: 'captains',
    author: 0,
    featured: true,
    heroImage: 1,
  },
  {
    title: 'Life Aboard: A Day in the Life of a Superyacht Chef',
    slug: 'day-in-life-superyacht-chef',
    excerpt: 'From provisioning in exotic ports to creating Michelin-star meals at sea, we follow Chef Antoine through a typical day aboard a 60-metre superyacht.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 2,
  },
  {
    title: 'The Future of Green Yachting: Hybrid Propulsion Systems Explained',
    slug: 'future-green-yachting-hybrid-propulsion',
    excerpt: 'Technical deep-dive into the latest hybrid and electric propulsion technologies revolutionising superyacht design and reducing environmental impact.',
    category: 'magazine',
    author: 2,
    featured: false,
    heroImage: 3,
  },
  {
    title: 'Fort Lauderdale Boat Show 2026: What Crew Need to Know',
    slug: 'flibs-2026-crew-guide',
    excerpt: 'Complete guide to networking opportunities, industry seminars, and must-attend events at this year\'s Fort Lauderdale International Boat Show.',
    category: 'events',
    author: 3,
    featured: false,
    heroImage: 4,
  },
  {
    title: 'Crew Wellness: Mental Health Support Programmes Gain Traction',
    slug: 'crew-wellness-mental-health-programmes',
    excerpt: 'Leading yacht management companies introduce comprehensive mental health resources as industry recognises unique challenges of life at sea.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 5,
  },
  {
    title: 'Deck Department Excellence: Advanced Line Handling Techniques',
    slug: 'advanced-line-handling-techniques',
    excerpt: 'Master the art of professional line handling with expert tips from senior deckhands on Mediterranean superyachts.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 6,
  },
  {
    title: 'Refit Season: Planning Your Yacht\'s Annual Maintenance',
    slug: 'refit-season-planning-guide',
    excerpt: 'Comprehensive checklist for captains and crew preparing for yard periods, from budget planning to crew coordination during refit.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 7,
  },
  {
    title: 'Engineering Excellence: Troubleshooting Common Generator Issues',
    slug: 'troubleshooting-generator-issues',
    excerpt: 'Chief engineers share diagnostic techniques and preventive maintenance strategies for keeping generators running smoothly.',
    category: 'magazine',
    author: 2,
    featured: false,
    heroImage: 0,
  },
  {
    title: 'Interior Design Trends: Luxury Yacht Aesthetics for 2026',
    slug: 'luxury-yacht-interior-trends-2026',
    excerpt: 'Top yacht designers reveal the colour palettes, materials, and design philosophies shaping this year\'s most stunning superyacht interiors.',
    category: 'magazine',
    author: 1,
    featured: false,
    heroImage: 1,
  },
  {
    title: 'Crew Training: New STCW Requirements and What They Mean for You',
    slug: 'new-stcw-requirements-explained',
    excerpt: 'Breaking down the latest Standards of Training, Certification and Watchkeeping updates affecting professional yacht crew worldwide.',
    category: 'news',
    author: 0,
    featured: false,
    heroImage: 2,
  },
  {
    title: 'The Mediterranean Season: Best Practices for Summer Cruising',
    slug: 'mediterranean-summer-cruising-guide',
    excerpt: 'From the French Riviera to the Greek Islands, experienced captains share their favourite routes and insider tips for the Med season.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 3,
  },
  {
    title: 'Crew Competitions: Preparing for the Superyacht Cup',
    slug: 'preparing-superyacht-cup-competition',
    excerpt: 'Training regimens, team dynamics, and winning strategies from crews competing in the world\'s most prestigious superyacht regattas.',
    category: 'events',
    author: 3,
    featured: false,
    heroImage: 4,
  },
  {
    title: 'Provisioning Like a Pro: Sourcing Quality Supplies in Remote Locations',
    slug: 'provisioning-remote-locations-guide',
    excerpt: 'Chief stews reveal their secrets for finding premium ingredients and supplies in the world\'s most remote cruising destinations.',
    category: 'crew-life',
    author: 1,
    featured: false,
    heroImage: 5,
  },
  {
    title: 'Safety First: Emergency Response Drills That Actually Work',
    slug: 'effective-emergency-response-drills',
    excerpt: 'How leading superyachts conduct realistic safety training that prepares crews for genuine emergency situations.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 6,
  },
  {
    title: 'Career Pathways: From Deckhand to Captain',
    slug: 'career-pathway-deckhand-to-captain',
    excerpt: 'Successful captains share their journey through the ranks, including essential certifications, experience, and mentorship opportunities.',
    category: 'magazine',
    author: 0,
    featured: false,
    heroImage: 7,
  },
  {
    title: 'The Triton Expo Returns: Networking Opportunities for Fort Lauderdale Crew',
    slug: 'triton-expo-networking-opportunities',
    excerpt: 'Mark your calendar for the industry\'s premier networking event bringing together crew, captains, and marine service providers.',
    category: 'events',
    author: 3,
    featured: false,
    heroImage: 0,
  },
  {
    title: 'Crew Rotation Best Practices: Managing Leave and Handovers',
    slug: 'crew-rotation-best-practices',
    excerpt: 'Strategies for smooth crew changes that maintain operational continuity and preserve institutional knowledge aboard superyachts.',
    category: 'captains',
    author: 0,
    featured: false,
    heroImage: 1,
  },
  {
    title: 'Galley Innovations: Smart Kitchen Technology for Superyachts',
    slug: 'galley-innovations-smart-technology',
    excerpt: 'The latest culinary equipment and galley management systems helping chefs deliver exceptional dining experiences at sea.',
    category: 'magazine',
    author: 1,
    featured: false,
    heroImage: 2,
  },
  {
    title: 'Winter in the Caribbean: Crew Life in Paradise',
    slug: 'caribbean-winter-season-crew-life',
    excerpt: 'Beyond the postcard views: the realities, rewards, and unique challenges of working Caribbean charter season.',
    category: 'crew-life',
    author: 3,
    featured: false,
    heroImage: 3,
  },
];

async function createCategories() {
  console.log('Creating categories...');
  const categoryDocs = [];
  
  for (const cat of categories) {
    const doc = {
      _type: 'category',
      _id: `category-${cat.slug}`,
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
    };
    categoryDocs.push(doc);
  }
  
  return categoryDocs;
}

async function createAuthors() {
  console.log('Creating authors...');
  const authorDocs = [];
  
  for (const author of authors) {
    const doc = {
      _type: 'author',
      _id: `author-${author.slug}`,
      name: author.name,
      slug: { _type: 'slug', current: author.slug },
      bio: author.bio,
    };
    authorDocs.push(doc);
  }
  
  return authorDocs;
}

async function createArticles(categoryDocs, authorDocs) {
  console.log('Creating articles...');
  const articleDocs = [];
  
  for (let i = 0; i < sampleArticles.length; i++) {
    const article = sampleArticles[i];
    const publishDate = new Date();
    publishDate.setDate(publishDate.getDate() - i); // Stagger publish dates
    
    const doc = {
      _type: 'article',
      _id: `article-${article.slug}`,
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
        _ref: `author-${authors[article.author].slug}`,
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
              text: 'This is a sample article created for demonstration purposes. In a production environment, this would contain the full article content with multiple paragraphs, images, and rich formatting.',
              marks: [],
            },
          ],
        },
      ],
    };
    articleDocs.push(doc);
  }
  
  return articleDocs;
}

async function migrate() {
  try {
    console.log('Starting Sanity migration...\n');
    
    // Create all documents
    const categoryDocs = await createCategories();
    const authorDocs = await createAuthors();
    const articleDocs = await createArticles(categoryDocs, authorDocs);
    
    const allDocs = [...categoryDocs, ...authorDocs, ...articleDocs];
    
    console.log(`\nPrepared ${allDocs.length} documents:`);
    console.log(`- ${categoryDocs.length} categories`);
    console.log(`- ${authorDocs.length} authors`);
    console.log(`- ${articleDocs.length} articles`);
    
    // Create transaction
    console.log('\nCreating documents in Sanity...');
    const transaction = client.transaction();
    
    allDocs.forEach(doc => {
      transaction.createOrReplace(doc);
    });
    
    const result = await transaction.commit();
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`Created/updated ${result.results.length} documents in Sanity.`);
    console.log('\nYour website should now display:');
    console.log('- 2 featured articles in the hero carousel');
    console.log('- 7+ articles in Latest News section');
    console.log('- 5+ articles in Trending Now sidebar');
    console.log('- 4+ articles in Triton Spotlight section');
    console.log('- 4+ articles in Crew Life section');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
