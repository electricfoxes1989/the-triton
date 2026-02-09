# The Triton - Project TODO

## Team Feedback - Latest Website Changes
- [x] Make Triton logo 30% larger
- [x] Change carousel "NEWS" label to triton aqua color
- [x] Make section headings consistent style: "The Latest News", "Trending Now", "Triton Spotlight", "Crew Life"
- [x] Add colored line below section headings
- [x] Add 2 more article boxes in "Latest News" section (1 main story + 2 rows of 3 = 7 total)
- [x] Copy NYT font and style for article cards (Georgia serif with proper sizing)
- [x] Add "5 MIN READ" style reading time
- [x] Align "Trending Now" numbered list vertically (expanded to 5 items)
- [x] Apply same font styles to "Triton Spotlight" and "Crew Life" sections
- [x] Update Media Kit box with provided PDF content
- [x] Confirm bottom banner is standard 728x90 size
- [x] Align footer text rows to top of Triton logo
- [x] Reduce space between footer columns
- [x] Move "Home" and "About Us" rows to right column
- [x] Fix "Destinations" spelling
- [x] Change "YouTube" to "X" (Twitter is now X)
- [x] Typography updated to Georgia serif for article content

## Article Page Template
- [ ] Design article page layout with NYT-style typography
- [ ] Build hero section with full-width image
- [ ] Create article body with proper serif typography
- [ ] Add author byline and metadata
- [ ] Add related articles section
- [ ] Test article display with sample content

## Hero Image Migration
- [ ] Create migration script to add placeholder hero images
- [ ] Run migration on all 302 articles
- [ ] Verify images display correctly on website

## Previously Completed Features

### Core Infrastructure
- [x] Database schema for articles, categories, authors, events
- [x] Sanity CMS integration with client configuration
- [x] tRPC routers for all content types
- [x] Image optimization utilities

### Sanity CMS Integration
- [x] Install @sanity/client and @sanity/image-url packages
- [x] Configure Sanity client with project ID, dataset, and API token
- [x] Create Sanity query functions for articles, categories, tags
- [x] Set up image URL builder for responsive images

### Global Styling & Design System
- [x] Configure Tailwind with navy blue color palette
- [x] Add system fonts (sans-serif for UI, serif for article body)
- [x] Create global CSS with typography tokens
- [x] Set up responsive breakpoints and spacing system

### Navigation & Layout
- [x] Build sticky navigation with logo and search
- [x] Add category dropdown menus
- [x] Implement mobile hamburger menu with drawer
- [x] Create footer with links and social media

### Homepage
- [x] Hero section with featured article carousel
- [x] Latest news grid layout (3-column responsive)
- [x] Category sections (News, Crew Life, Events, etc.)
- [x] Popular tags sidebar widget
- [x] Events calendar sidebar
- [x] Newsletter signup section

### Article Pages
- [x] Full-width hero image with caption
- [x] Elegant typography for headlines
- [x] Reading progress indicator (sticky bar)
- [x] Rich text content rendering
- [x] Author bio section with photo
- [x] Related articles section (3-4 cards)
- [x] Social sharing buttons (Twitter, Facebook, LinkedIn)
- [x] Topics/tags display

### Category & Tag Pages
- [x] Category listing page with filtered articles
- [x] Tag listing page with filtered articles
- [x] Pagination for article lists
- [x] Breadcrumb navigation

### Search Functionality
- [x] Search input in navigation
- [x] Search results page with article listings
- [x] Keyword highlighting in results
- [x] Empty state for no results

### Admin CMS Dashboard
- [x] Content managed through Sanity Studio (official CMS)
- [x] Article CRUD via Sanity Studio
- [x] Featured article selection in Sanity
- [x] Tag management in Sanity
- [x] Rich text editor in Sanity Studio
- [x] Image upload via Sanity Studio

### SEO & Performance
- [x] XML sitemap generation from Sanity content
- [x] JSON-LD structured data (NewsArticle schema)
- [x] Open Graph meta tags for social sharing
- [x] Twitter Card meta tags
- [x] Canonical URLs on all pages
- [x] robots.txt configuration
- [x] Image lazy loading
- [x] Responsive image srcsets

### Testing & Quality
- [x] Write vitest tests for Sanity connection
- [x] Test responsive design on mobile/tablet/desktop
- [x] Verify all navigation links work
- [x] Test search functionality
- [x] Content management via Sanity Studio
- [x] Check SEO meta tags on all pages

### Homepage Redesign - Match Mockup
- [x] Fix Sanity API queries to handle missing schema fields gracefully
- [x] Add ad banner space above navigation
- [x] Rebuild navigation with simplified menu structure
- [x] Create hero carousel with dots navigation
- [x] Build "The Latest News" grid section
- [x] Add "Trending Now" numbered sidebar
- [x] Create "Triton Spotlight" section
- [x] Add turquoise newsletter signup section
- [x] Build "Crew Life" section with cards
- [x] Add statistics section (22k, 25k+, 22k+, 3M+)
- [x] Create media kit banner section
- [x] Update footer with proper links

### Logo and Layout Fixes
- [x] Add Triton logo to navigation
- [x] Reposition ad banner horizontally next to logo (not full width)
- [x] Update article typography to NYT serif style only

### Sanity CMS Content Strategy
- [x] Document required Sanity schema fields (hero image, headline, author, body, etc.)
- [x] Define category mapping to homepage sections
- [x] Document rich text editor capabilities (image/video embedding)
- [x] Create journalist workflow guide for Sanity Studio
- [x] Define required vs optional fields in schema
- [x] Document image specifications and requirements

### Sanity Connection Issues
- [x] Debug Sanity API connection errors
- [x] Check CORS configuration
- [x] Verify API token permissions
- [x] Test with simpler queries

### Typography Update - Match Mockup
- [x] Remove Playfair Display completely
- [x] Use clean sans-serif font for all headlines (matching mockup)
- [x] Use serif font for article body text only
- [x] Update navigation menu font
- [x] Update section headings font

## Media Kit Update
- [x] Extract key information from Media Kit PDF
- [x] Update homepage Media Kit banner section
- [x] Ensure design matches overall site aesthetic

## Article Migration & Population
- [x] Create migration script to add sample articles
- [x] Add articles for Latest News section (7 articles)
- [x] Add articles for Trending Now section (5 articles)
- [x] Add articles for Triton Spotlight section (4 articles)
- [x] Add articles for Crew Life section (4 articles)
- [x] Include proper categories, authors, hero images, and excerpts
- [x] Run migration script and verify articles display correctly

## Sanity API Connection Error Fix
- [x] Diagnose Sanity API connection error
- [x] Check CORS configuration in Sanity project
- [x] Verify API token permissions
- [x] Test direct API connection
- [x] Fix client configuration (CORS origins updated)

## Enhanced Article Migration - Diverse Content
- [x] Create migration script with 40 diverse articles
- [x] Include varied topics (destinations, crew roles, regulations, lifestyle)
- [x] Add articles covering global yachting locations
- [x] Include different crew perspectives (chef, engineer, deckhand, stew)
- [x] Run migration and verify content diversity

## Light Blue Hover Animations
- [x] Add hover effects to navigation menu items
- [x] Add hover effects to article cards
- [x] Add hover effects to buttons and CTAs
- [x] Add hover effects to footer links
- [x] Use triton aqua/light blue color for all hover states

## Original Content Migration
- [ ] Check existing 302 articles in Sanity dataset
- [ ] Verify articles have proper structure and images
- [ ] Ensure old content displays correctly on website

## Backend Proxy for Sanity Articles
- [x] Create tRPC procedures to fetch articles from Sanity (server-side)
- [x] Add procedure for fetching all articles
- [x] Add procedure for fetching article by slug
- [x] Add procedure for fetching articles by category
- [x] Update frontend to use tRPC instead of direct Sanity client calls

## Homepage Design Refinement - Match Mockup Exactly
- [ ] Review mockup PDF for exact layout specifications
- [ ] Verify article grid layout matches mockup
- [ ] Ensure typography matches mockup fonts
- [ ] Check spacing and padding matches mockup
- [ ] Verify color scheme matches mockup
- [ ] Test responsive design on mobile/tablet/desktop

## Article Detail Page
- [x] Create ArticleDetail page component
- [x] Add full-width hero image section
- [x] Implement body content rendering with Portable Text
- [x] Add author bio section with photo
- [x] Create related articles sidebar
- [x] Add social sharing buttons
- [x] Add reading progress indicator
- [x] Style with NYT-inspired typography
- [x] Test article page with sample content

## Bug Fixes and Enhancements
- [x] Fix Trending Now section alignment issue
- [x] Remove "Page not found" articles from Sanity dataset
- [x] Implement hero carousel auto-rotation (5 second intervals)
- [x] Add navigation dots to carousel
- [x] Add arrow controls to carousel
- [x] Add Crew Life section below Media Kit (3 articles + 1 ad)
- [ ] Enhance author bio with social media links
- [ ] Add recent articles list to author bio section

## Homepage Section Reordering and Footer Update
- [x] Move Crew Life section below Media Kit banner
- [x] Update footer to dark blue color scheme

## Banner Images Integration
- [x] Upload AME Solutions banner to S3
- [x] Upload Quantum Marine Stabilizers banner to S3
- [x] Replace top horizontal ad banner with Quantum banner
- [x] Replace Crew Life ad card with AME Solutions banner

## Newsletter Signup Banner Redesign
- [x] Improve visual design with better typography and spacing
- [x] Add professional styling and visual hierarchy
- [x] Enhance overall appearance to match editorial quality

## Newsletter Banner Size Adjustment
- [x] Reduce vertical padding to make banner more compact
- [x] Adjust heading sizes for better proportion
- [x] Optimize spacing between elements

## Logo Size Adjustment
- [x] Reduce logo height by 10% in navigation header

## Article Card Updates
- [x] Remove "5 MIN READ" labels from article cards
- [x] Add author bylines to article cards

## Hero Slideshow Updates
- [x] Add more padding to hero content area
- [x] Reduce font sizes for better proportion

## Navigation and Hero Updates
- [x] Make navigation bar sticky on mobile
- [x] Remove text overlay from hero slideshow

## Content Padding Updates
- [x] Increase horizontal padding on all content sections

## Hero Text Overlay Restoration
- [x] Restore title, author, date, and Read More button to hero slideshow
- [x] Make overlay smaller and more subtle than original

## Statistics Animation
- [x] Add count-up animation to statistics numbers
- [x] Trigger animation when section comes into view

## Image Loading Verification
- [x] Check hero slideshow images
- [x] Check article card images across all sections
- [x] Verify Sanity CMS image URLs are working

## Image Responsiveness Testing
- [x] Test images on mobile viewport (375px)
- [x] Test images on tablet viewport (768px)
- [x] Test images on desktop viewport (1920px)
- [x] Verify aspect ratios maintained across devices
- [x] Check for any layout breaking or overflow issues

## Dynamic Hero Slideshow
- [ ] Update hero to pull latest 5 articles from Sanity CMS
- [ ] Ensure articles are sorted by publishedAt date (newest first)
- [ ] Display article title, author, date, and hero image
- [ ] Maintain slideshow functionality with dynamic content

## Category Pages Development
- [x] Create News page with filtered articles
- [x] Create Captains page with filtered articles
- [x] Create Crew Life page with filtered articles
- [x] Create Magazine page with filtered articles
- [x] Create Events page with filtered articles
- [x] Ensure NavigationNew component appears on all pages
- [x] Add routes in App.tsx for all category pages
- [x] Implement category filtering in backend tRPC procedures

## Advertise With Us Page
- [x] Create AdvertisePage component with NavigationNew and Footer
- [x] Add hero section with compelling headline
- [x] Display reach statistics (22k magazine, 25k+ boat show, 27k+ newsletter, 2.5M+ impressions)
- [x] Create contact form with name, email, company, message fields
- [x] Add media kit download link
- [x] Add route in App.tsx for /advertise
- [x] Implement form submission handling

## Sanity CMS Category System
- [x] Research current Triton News website magazine section
- [x] Create Sanity schema update documentation
- [ ] Implement schema updates in Sanity Studio
- [ ] Add categories to existing articles
- [ ] Mark featured articles for homepage
- [ ] Update homepage to filter featured articles for slideshow
- [ ] Ensure all category pages pull correctly filtered articles

## Magazine Page with Issue Viewer
- [x] Research Triton News magazine section implementation
- [x] Create magazine issue schema in Sanity
- [x] Build magazine archive page with issue grid
- [x] Implement digital magazine viewer with Issuu iframe
- [x] Add year filtering and modal viewer

## Events Calendar System
- [x] Research calendar system options (FullCalendar, React Big Calendar)
- [x] Create events schema in Sanity
- [x] Build events calendar page with month/week/day views
- [x] Add event detail modal with registration links
- [x] Implement color-coded event types and legend

## Sanity Backend Implementation
- [x] Create getMagazineIssues function in server/sanity.ts
- [x] Create getEvents function in server/sanity.ts
- [x] Update magazines.list tRPC router to use Sanity query
- [x] Update events.list tRPC router to use Sanity query
- [ ] Test with sample data once schemas are added to Sanity Studio

## Article Detail Page
- [x] Create ArticlePage component with hero image
- [x] Render article body content from Sanity
- [x] Add author bio card with image and description
- [x] Display related articles sidebar
- [x] Add social sharing buttons
- [x] Show article metadata (date, category, tags)
- [x] Add route in App.tsx for /article/:slug
