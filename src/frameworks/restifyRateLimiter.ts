// src/frameworks/restifyRateLimiter.ts
import { rateLimiter } from '../core/rateLimiter';

/**
 * Factory function to create a Restify rate limiter middleware.
 * @param options - The rate limiter options.
 * @returns Middleware function for Restify
 */
export const createRestifyRateLimiter = (options: any) => {
  const restifyRateLimiter = rateLimiter(options);

  return (req: any, res: any, next: any) => {
    restifyRateLimiter(req, res, (err: any) => {
      if (err) {
        res.status(429);
        res.send({ message: 'Too many requests' });
      } else {
        next();
      }
    });
  };
};
