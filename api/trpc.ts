import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../server/routers';

export default async function handler(req: Request) {
  // Extract the path after /api/trpc/
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/trpc/', '').replace('/api/trpc', '');

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({ user: null, req: req as any, res: {} as any }),
  });
}

export const config = {
  runtime: 'nodejs',
};
