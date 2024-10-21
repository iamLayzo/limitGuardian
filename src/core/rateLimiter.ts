// src/core/rateLimiter.ts
import { RateLimitOptions, RateLimitInfo } from '../types';
import { setDraft8Headers, setRetryAfterHeader } from './headers';

/**
 * The main rate limiter function.
 * This version is decoupled from any specific framework and works with generic request/response/next.
 * @param options - The rate limiter options.
 * @returns {Function} The middleware function.
 */
export const rateLimiter = (options: RateLimitOptions) => {
  const windowMs = options.windowMs ?? 60 * 1000; // 1 minute default
  const limit = options.limit ?? 5;

  return async (req: any, res: any, next: any) => {
    const key = req.ip ?? 'default_ip'; // Provide a fallback for the IP address
    const store = options.store;

    // Check if the request should be skipped based on the skip logic
    if (options.skip && await options.skip(req)) {
      return next(); // Skip rate limiting if the condition is met
    }

    try {
      // Increment the client's hit count in the store
      const { totalHits, resetTime } = await store.increment(key);
      const remaining = Math.max(limit - totalHits, 0);

      // Prepare rate limit info
      const info: RateLimitInfo = {
        limit,
        remaining,
        resetTime,
        totalHits, // Asegúrate de incluir totalHits aquí
      };

      // Choose the appropriate headers based on the standard
      if (options.standardHeaders === 'draft-8') {
        setDraft8Headers(res, info, windowMs);
      } else if (options.legacyHeaders) {
        // Add logic to support legacy headers if needed
      }

      // If the client exceeded the rate limit
      if (totalHits > limit) {
        setRetryAfterHeader(res, info, windowMs);
        return res.status(429).send('Too many requests');
      }

      // Optionally, if the request was successful/failed, adjust hit count
      if (options.skipFailedRequests || options.skipSuccessfulRequests) {
        res.on('finish', async () => {
          const successful = res.statusCode < 400;
          if (options.skipSuccessfulRequests && successful) {
            await store.decrement(key);
          } else if (options.skipFailedRequests && !successful) {
            await store.decrement(key);
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
