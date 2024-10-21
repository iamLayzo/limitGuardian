// src/frameworks/hapiRateLimiter.ts
import { rateLimiter } from '../core/rateLimiter';

/**
 * Factory function to create a Hapi rate limiter middleware.
 * @param options - The rate limiter options.
 * @returns Middleware function for Hapi
 */
export const createHapiRateLimiter = (options: any) => {
  const hapiRateLimiter = rateLimiter(options);

  return {
    method: async (request: any, h: any) => {
      await hapiRateLimiter(request.raw.req, request.raw.res, (err: any) => {
        if (err) {
          return h
            .response({ message: 'Too many requests' })
            .code(429)
            .takeover();
        }
      });
      return h.continue;
    },
  };
};
