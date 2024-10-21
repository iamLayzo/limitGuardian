// src/frameworks/expressRateLimiter.ts
import { rateLimiter } from '../core/rateLimiter';

/**
 * Factory function to create an Express rate limiter middleware.
 * @param options - The rate limiter options.
 * @returns Middleware function for Express
 */
export const createExpressRateLimiter = (options: any) => {
  return rateLimiter(options);
};
