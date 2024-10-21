// src/frameworks/nativeHttpRateLimiter.ts
import { rateLimiter } from '../core/rateLimiter';

/**
 * Factory function to create a native HTTP rate limiter middleware.
 * @param options - The rate limiter options.
 * @returns Middleware function for native HTTP
 */
export const createNativeHttpRateLimiter = (options: any) => {
  const nativeRateLimiter = rateLimiter(options);

  return async (req: any, res: any) => {
    await nativeRateLimiter(req, res, (err: any) => {
      if (err) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Too many requests' }));
      }
    });
  };
};
