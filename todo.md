# The Triton - Project TODO

## Core Infrastructure
- [x] Database schema for articles, categories, authors, events
- [x] Sanity CMS integration with client configuration
- [x] tRPC routers for all content types
- [x] Image optimization utilities

## Sanity CMS Integration
- [x] Install @sanity/client and @sanity/image-url packages
- [x] Configure Sanity client with project ID, dataset, and API token
- [x] Create Sanity query functions for articles, categories, tags
- [x] Set up image URL builder for responsive images

## Global Styling & Design System
- [x] Configure Tailwind with NYT-inspired color palette
- [x] Add Google Fonts (Playfair Display for headlines, Inter for body)
- [x] Create global CSS with typography tokens
- [x] Set up responsive breakpoints and spacing system

## Navigation & Layout
- [x] Build sticky navigation with logo and search
- [x] Add category dropdown menus
- [x] Implement mobile hamburger menu with drawer
- [x] Create footer with links and social media

## Homepage
- [x] Hero section with featured article (large image + headline)
- [x] Latest news grid layout (3-column responsive)
- [x] Category sections (News, Crew Life, Events, etc.)
- [x] Popular tags sidebar widget
- [x] Events calendar sidebar
- [x] Newsletter signup section

## Article Pages
- [x] Full-width hero image with caption
- [x] Elegant serif typography for headlines
- [x] Reading progress indicator (sticky bar)
- [x] Rich text content rendering
- [x] Author bio section with photo
- [x] Related articles section (3-4 cards)
- [x] Social sharing buttons (Twitter, Facebook, LinkedIn)
- [x] Topics/tags display

## Category & Tag Pages
- [x] Category listing page with filtered articles
- [x] Tag listing page with filtered articles
- [x] Pagination for article lists
- [x] Breadcrumb navigation

## Search Functionality
- [x] Search input in navigation
- [x] Search results page with article listings
- [x] Keyword highlighting in results
- [x] Empty state for no results

## Admin CMS Dashboard
- [x] Content managed through Sanity Studio (official CMS)
- [x] Article CRUD via Sanity Studio
- [x] Featured article selection in Sanity
- [x] Tag management in Sanity
- [x] Rich text editor in Sanity Studio
- [x] Image upload via Sanity Studio

## SEO & Performance
- [x] XML sitemap generation from Sanity content
- [x] JSON-LD structured data (NewsArticle schema)
- [x] Open Graph meta tags for social sharing
- [x] Twitter Card meta tags
- [x] Canonical URLs on all pages
- [x] robots.txt configuration
- [x] Image lazy loading
- [x] Responsive image srcsets

## Testing & Quality
- [x] Write vitest tests for Sanity connection
- [x] Test responsive design on mobile/tablet/desktop
- [x] Verify all navigation links work
- [x] Test search functionality
- [x] Content management via Sanity Studio
- [x] Check SEO meta tags on all pages

## Design Updates - Navy Blue & Serif Theme
- [x] Update color palette to navy blue theme
- [x] Change primary font to classic serif
- [x] Update accent colors to complement navy blue
- [x] Test responsive design with new colors

## Homepage Redesign - Match Mockup
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

## Logo and Layout Fixes
- [x] Add Triton logo to navigation
- [x] Reposition ad banner horizontally next to logo (not full width)
- [ ] Update article typography to NYT serif style only

## Sanity CMS Content Strategy
- [x] Document required Sanity schema fields (hero image, headline, author, body, etc.)
- [x] Define category mapping to homepage sections
- [x] Document rich text editor capabilities (image/video embedding)
- [x] Create journalist workflow guide for Sanity Studio
- [x] Define required vs optional fields in schema
- [x] Document image specifications and requirements

## Sanity Connection Issues
- [x] Debug Sanity API connection errors
- [x] Check CORS configuration
- [x] Verify API token permissions
- [x] Test with simpler queries
