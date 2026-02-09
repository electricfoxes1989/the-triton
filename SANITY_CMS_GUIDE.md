# Triton News - Sanity CMS Content Guide for Journalists

This guide explains how to create and manage articles in Sanity Studio for the Triton News website.

---

## Accessing Sanity Studio

1. Go to **https://www.sanity.io/manage**
2. Log in with your Sanity account
3. Select the **Triton** project (ID: 9w7gje4u)
4. Click **"Open Studio"** to access the content editor

---

## Creating a New Article

### Step 1: Create New Article Document

1. In Sanity Studio, click the **"+"** button or **"Create new document"**
2. Select **"Article"** from the document types
3. You'll see the article editor with all required fields

### Step 2: Fill in Required Fields

#### **Title** (Required)
- The main headline of your article
- Keep it concise and compelling (50-70 characters ideal)
- Example: "2026 Bahamas Charter Yacht Show Cancelled"

#### **Slug** (Required)
- URL-friendly version of the title
- Click **"Generate"** button to auto-create from title
- Example: `2026-bahamas-charter-yacht-show-cancelled`
- **Important:** Once published, don't change the slug (breaks links)

#### **Excerpt** (Required)
- Brief summary of the article (150-200 characters)
- Appears in article cards and search results
- Should entice readers to click and read more
- Example: "The Association of Bahamas Marinas announced that the 2026 Bahamas Charter Yacht Show was cancelled due to circumstances beyond the control of the ABM."

#### **Published At** (Required)
- Date and time the article was published
- Defaults to current date/time
- Articles are sorted by this date on the website

#### **Hero Image URL** (Required)
- Direct URL to the main article image
- Recommended size: **1200x800px** minimum
- Format: JPG or PNG
- Must be publicly accessible URL
- Example: `https://cdn.sanity.io/images/9w7gje4u/production/abc123.jpg`

**How to upload images to Sanity:**
1. In Sanity Studio, go to **Assets** (image icon in left sidebar)
2. Click **"Upload"** and select your image
3. After upload, click the image to view details
4. Copy the **"URL"** field
5. Paste this URL into the **Hero Image URL** field in your article

#### **Category** (Required)
- Select from predefined categories:
  - **News** - General yachting news and industry updates
  - **Captains** - Content specifically for yacht captains
  - **Crew Life** - Lifestyle, tips, and stories for crew members
  - **Magazine** - Long-form editorial content
  - **Events** - Coverage of yachting events and shows

**Category Mapping to Homepage:**
- Articles in each category automatically appear in their respective homepage sections
- **News** → "The Latest News" grid
- **Crew Life** → "Crew Life" section
- **Events** → Events calendar sidebar

#### **Author** (Required)
- Select the article author from the dropdown
- If author doesn't exist, create a new **Author** document first
- Author name and bio will appear at the end of the article

#### **Body** (Required)
- The main article content
- Uses **Portable Text** rich text editor
- Supports:
  - Headings (H2, H3, H4)
  - Bold, italic, underline
  - Bullet lists and numbered lists
  - Links (select text, click link icon)
  - Block quotes
  - Images (see below)

### Step 3: Optional Fields

#### **Featured**
- Toggle this ON to make the article appear in the hero carousel
- Only 1-3 articles should be featured at a time
- Featured articles get prime placement on homepage

#### **Tags**
- Add relevant topic tags (e.g., "Bahamas", "Charter Yachts", "Industry News")
- Tags help readers find related articles
- Appear in the "Popular Tags" sidebar
- Click **"Add item"** to create new tags

---

## Embedding Images in Article Body

1. Place cursor where you want the image
2. Click the **"+"** button in the editor
3. Select **"Image"**
4. Upload image or select from existing assets
5. Add **Alt Text** (describes image for accessibility)
6. Add **Caption** (optional, appears below image)

**Image Best Practices:**
- Use high-resolution images (min 1200px wide)
- Compress images before upload (use TinyPNG or similar)
- Always add descriptive Alt Text
- Use captions to provide context

---

## Embedding Videos in Article Body

### YouTube Videos
1. Get the YouTube video URL (e.g., `https://www.youtube.com/watch?v=abc123`)
2. In article body, click **"+"** button
3. Select **"YouTube"** (if available) or use **"Embed"**
4. Paste the YouTube URL
5. Video will appear embedded in the article

### Other Video Platforms
- For Vimeo, use the embed code provided by Vimeo
- For custom videos, upload to Sanity Assets first, then link

---

## Adding Links

1. Select the text you want to link
2. Click the **link icon** in the toolbar
3. Paste the URL
4. Choose to open in new tab (recommended for external links)
5. Click **"Apply"**

**Link Best Practices:**
- Use descriptive link text (not "click here")
- Link to authoritative sources
- Check links work before publishing

---

## Publishing Workflow

### Draft → Publish
1. Fill in all required fields
2. Click **"Publish"** button (top right)
3. Article immediately appears on the website
4. Changes are live within 30 seconds

### Editing Published Articles
1. Make your changes in Sanity Studio
2. Click **"Publish"** again to update
3. Website updates automatically

### Unpublishing Articles
1. Click the **"..."** menu (top right)
2. Select **"Unpublish"**
3. Article is removed from website but saved as draft

---

## Content Guidelines

### Writing Style
- **Clear and concise** - Get to the point quickly
- **Active voice** - "The marina announced" not "It was announced"
- **Short paragraphs** - 2-3 sentences maximum
- **Subheadings** - Break up long articles with H2/H3 headings

### SEO Best Practices
- Include target keywords in title and excerpt
- Use descriptive headings (H2, H3)
- Add alt text to all images
- Link to related articles when relevant
- Keep URLs (slugs) short and descriptive

### Image Requirements
- **Hero Image:** 1200x800px minimum, landscape orientation
- **In-body Images:** 800px wide minimum
- **File Size:** Under 500KB (compress before upload)
- **Format:** JPG for photos, PNG for graphics/logos
- **Alt Text:** Always required for accessibility

---

## Category Definitions

### News
- Breaking industry news
- Company announcements
- Regulatory changes
- Market trends
- Boat shows and events coverage

### Captains
- Navigation tips
- Weather and safety
- Licensing and regulations
- Captain profiles and interviews
- Technical yacht management

### Crew Life
- Crew lifestyle and culture
- Training and career development
- Crew wellness and health
- Crew accommodations and facilities
- Social events and networking

### Magazine
- Long-form features (1500+ words)
- In-depth interviews
- Destination guides
- Historical pieces
- Photo essays

### Events
- Upcoming yacht shows
- Industry conferences
- Networking events
- Crew parties and gatherings
- Charity events

---

## Common Issues & Solutions

### "Slug already exists"
- Each article needs a unique slug
- Add a number or date to make it unique
- Example: `yacht-show-cancelled-2026`

### "Image not loading"
- Ensure image URL is publicly accessible
- Check image file isn't too large (max 10MB)
- Try re-uploading to Sanity Assets

### "Article not appearing on website"
- Check article is **Published** (not draft)
- Verify **Published At** date is not in the future
- Ensure **Category** is selected
- Wait 30-60 seconds for cache to clear

### "Changes not showing"
- Click **"Publish"** button after making changes
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

---

## Support

For technical issues with Sanity Studio:
- **Sanity Documentation:** https://www.sanity.io/docs
- **Sanity Support:** https://www.sanity.io/help

For website-specific questions:
- Contact the web development team

---

## Quick Reference Checklist

Before publishing an article, ensure:

- [ ] Title is compelling and concise
- [ ] Slug is generated and unique
- [ ] Excerpt summarizes the article (150-200 chars)
- [ ] Published At date is correct
- [ ] Hero Image URL is added (1200x800px min)
- [ ] Category is selected
- [ ] Author is assigned
- [ ] Body content is complete with proper formatting
- [ ] All images have Alt Text
- [ ] Links are working and open correctly
- [ ] Article is proofread for spelling/grammar
- [ ] Click **"Publish"** to make live

---

**Last Updated:** February 2026  
**Version:** 1.0
