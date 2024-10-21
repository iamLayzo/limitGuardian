// src/frameworks/koaRateLimiter.ts
import { rateLimiter } from '../core/rateLimiter';

/**
 * Factory function to create a Koa rate limiter middleware.
 * @param options - The rate limiter options.
 * @returns Middleware function for Koa
 */
export const createKoaRateLimiter = (options: any) => {
  const koaRateLimiter = rateLimiter(options);

  return async (ctx: any, next: any) => {
    await koaRateLimiter(ctx.req, ctx.res, next);
    await next();
  };
};
