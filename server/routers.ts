import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getArticles, getArticleBySlug, getArticlesByCategory, searchArticles } from "./sanity";

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
      .input(z.object({ 
        query: z.string(),
        limit: z.number().optional().default(20)
      }))
      .query(async ({ input }) => {
        return await searchArticles(input.query, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
