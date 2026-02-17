# The Triton — Project Status Report

**Date:** 2026-02-17  
**Stack:** React 19 + Vite 7 + tRPC + Express + Sanity CMS + Tailwind 4 + wouter  
**Repo:** electricfoxes1989/the-triton

---

## Current State

The project is a **fully functional** Manus-built news/magazine site for the superyacht industry. It builds successfully, runs locally, and has a working Sanity CMS connection with ~302 articles.

### What Works ✅

- **Build passes** — `pnpm build` completes cleanly (Vite client + esbuild server)
- **Dev server runs** — `pnpm dev` starts on `localhost:3000`
- **Sanity CMS connected** — project `48r6hh2o`, dataset `production`, API token present
- **16 routes** — Home, Article, Author, News, Captains, Crew Life, Magazine, Events, Advertise, Ad Analytics, Galleries, Expos, Category, Tag, Search, 404
- **Full UI component library** — shadcn/ui (Radix) with 40+ components
- **tRPC API** — Articles CRUD, search, categories, trending, banner ads, events, authors, magazine issues
- **Sitemap generation** — server/sitemap.ts
- **Portable Text rendering** — Sanity rich content support
- **Dark/light theme** — via ThemeProvider
- **Vercel deployment configured** — `.vercel/project.json` exists (project: `the-triton`, ID: `prj_iTc4AcJPt2Zj45N6B5Gmq81ac8Zv`)

### What's Broken/Missing ⚠️

1. **OAuth not configured** — `OAUTH_SERVER_URL` not set; auth/login won't work (but public site doesn't need it)
2. **Analytics env vars missing** — `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` referenced in `index.html` but undefined (causes build warnings)
3. **Database optional but unconfigured** — MySQL/Drizzle setup exists (`DATABASE_URL`) for user accounts; lazy-loads so site works without it
4. **Large JS bundle** — 618KB main chunk (needs code-splitting via dynamic imports)
5. **Hardcoded fallback project ID** — `server/sanity.ts` has fallback `9w7gje4u` which differs from env value `48r6hh2o`; should be cleaned up
6. **Manus artifacts** — `vite-plugin-manus-runtime` in devDeps, various import/scrape scripts in root (cosmetic, not blocking)
7. **Duplicate page files** — `Home.tsx` vs `HomeNew.tsx`, `Events.tsx` vs `EventsPageNew.tsx`, `Article.tsx` vs `ArticleDetail.tsx` vs `ArticlePage.tsx`, `Category.tsx` vs `CategoryPage.tsx` — dead code should be pruned
8. **No SSR/SEO** — SPA-only; search engines won't index article content without SSR or prerendering

---

## Environment Variables

### Required (already in `.env`)
```
VITE_SANITY_PROJECT_ID=48r6hh2o
VITE_SANITY_DATASET=production
SANITY_API_TOKEN=sk...  (present)
```

### Optional / Missing
```
DATABASE_URL=           # MySQL connection string (for user accounts)
JWT_SECRET=             # Cookie signing for auth
OAUTH_SERVER_URL=       # Manus OAuth (not needed for public site)
OWNER_OPEN_ID=          # Owner identification
VITE_ANALYTICS_ENDPOINT=  # Umami/analytics endpoint
VITE_ANALYTICS_WEBSITE_ID= # Analytics site ID
VITE_APP_ID=            # Manus app ID
BUILT_IN_FORGE_API_URL= # Manus Forge API
BUILT_IN_FORGE_API_KEY= # Manus Forge API key
VERCEL_TOKEN=           # Already in .env (for deployment)
```

---

## Deployment

- **Vercel** is configured:
  - `vercel.json` present with SPA rewrite rules
  - `.vercel/project.json` linked to project `the-triton`
  - Build: `npx vite build` → output: `dist/public`
  - `VERCEL_TOKEN` in `.env`
- **Current deployment status unknown** — check `vercel ls` or the Vercel dashboard
- **Note:** `vercel.json` uses client-only build (`npx vite build`), not the full `pnpm build` which also builds the server. This means **Vercel serves it as a static SPA** (no server-side tRPC). The tRPC API calls would need a separate backend or Vercel serverless functions.

### ⚠️ Critical Deploy Issue

The `vercel.json` only builds the Vite client. The Express/tRPC server won't run on Vercel with this config. Options:
1. **Add Vercel serverless function** — there's an `api/index.js` file (needs checking if it proxies tRPC)
2. **Deploy server elsewhere** — Railway, Fly.io, Render
3. **Use Sanity directly from client** — bypass tRPC for read-only queries (significant refactor)

---

## Steps to Get Presentable

### Quick wins (< 1 hour)
1. ~~Verify Sanity data~~ — articles are there (302 imported)
2. Remove analytics warnings — either add Umami or strip the tags from `index.html`
3. Clean hardcoded Sanity fallback project ID in `server/sanity.ts`

### Before showing to team (1-2 hours)
4. Test all routes end-to-end with live Sanity data
5. Verify images load (Sanity image pipeline)
6. Check mobile responsiveness
7. Remove dead page files and Manus artifacts from root

### Before production (larger effort)
8. Resolve Vercel deployment — either add serverless API adapter or deploy server separately
9. Add SSR or prerendering for SEO
10. Code-split the 618KB bundle
11. Set up proper analytics
12. Configure auth if needed (or remove auth code)

---

## Blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| Server not deployed on Vercel | **High** | tRPC calls will fail on static deploy |
| No SSR | Medium | SEO impact — articles won't be indexed |
| Bundle size | Low | Works, just slow on mobile |

---

## File Structure (Key Paths)

```
client/          → React SPA (Vite)
  src/pages/     → 24 page components
  src/components/→ UI + feature components
  src/lib/       → Sanity client helpers
server/          → Express + tRPC backend
  _core/         → Server bootstrap, auth, OAuth
  routers.ts     → tRPC router definitions
  sanity.ts      → Sanity CMS queries
  db.ts          → MySQL/Drizzle (optional)
shared/          → Shared types/constants
dist/            → Build output (exists)
vercel.json      → Vercel config (SPA-only)
```
