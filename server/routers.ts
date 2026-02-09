import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getArticles, getArticleBySlug, getArticlesByCategory, searchArticles, getMagazineIssues, getEvents, getAuthorBySlug, getArticlesByAuthor, getFeaturedVideoByCategory, getBannerAds, getAllActiveBanners, getAllAdvertisements, trackBannerImpression, trackBannerClick, trackArticleView, getTrendingArticles } from "./sanity";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Sanity CMS article procedures
  articles: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        return await getArticles(input.limit);
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getArticleBySlug(input.slug);
      }),
    
    byCategory: publicProcedure
      .input(z.object({ 
        categorySlug: z.string(),
        limit: z.number().optional().default(20)
      }))
      .query(async ({ input }) => {
        return await getArticlesByCategory(input.categorySlug, input.limit);
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional().default(20) }))
      .query(async ({ input }) => {
        return await searchArticles(input.query, input.limit);
      }),
    
    trending: publicProcedure
      .input(z.object({ limit: z.number().optional().default(5) }))
      .query(async ({ input }) => {
        return await getTrendingArticles(input.limit);
      }),
    
    trackView: publicProcedure
      .input(z.object({ articleId: z.string() }))
      .mutation(async ({ input }) => {
        return await trackArticleView(input.articleId);
      }),
  }),

  // Magazine issues
  magazines: router({
    list: publicProcedure
      .query(async () => {
        return await getMagazineIssues();
      }),
  }),

  // Events
  events: router({
    list: publicProcedure
      .query(async () => {
        return await getEvents();
      }),
  }),

  // Authors
  authors: router({
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getAuthorBySlug(input.slug);
      }),
    
    articles: publicProcedure
      .input(z.object({ 
        authorSlug: z.string(),
        limit: z.number().optional().default(50)
      }))
      .query(async ({ input }) => {
        return await getArticlesByAuthor(input.authorSlug, input.limit);
      }),
  }),

  // Featured Videos
  videos: router({
    byCategory: publicProcedure
      .input(z.object({ category: z.enum(['crew-life', 'captains']) }))
      .query(async ({ input }) => {
        return await getFeaturedVideoByCategory(input.category);
      }),
  }),

  // Banner Advertisements
  banners: router({
    byPageAndPosition: publicProcedure
      .input(z.object({ 
        page: z.string(),
        position: z.string()
      }))
      .query(async ({ input }) => {
        return await getBannerAds(input.page, input.position);
      }),
    
    allActive: publicProcedure
      .query(async () => {
        return await getAllActiveBanners();
      }),
    
    trackImpression: publicProcedure
      .input(z.object({ adId: z.string() }))
      .mutation(async ({ input }) => {
        return await trackBannerImpression(input.adId);
      }),
    
    trackClick: publicProcedure
      .input(z.object({ adId: z.string() }))
      .mutation(async ({ input }) => {
        return await trackBannerClick(input.adId);
      }),
  }),

  // Advertisement Analytics
  analytics: router({
    allAdvertisements: publicProcedure
      .query(async () => {
        return await getAllAdvertisements();
      }),
  }),
});

export type AppRouter = typeof appRouter;
