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
