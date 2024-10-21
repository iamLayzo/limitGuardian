// src/frameworks/fastifyRateLimiter.ts
import { rateLimiter } from '../core/rateLimiter';

/**
 * Factory function to create a Fastify rate limiter middleware.
 * @param options - The rate limiter options.
 * @returns Middleware function for Fastify
 */
export const createFastifyRateLimiter = (options: any) => {
  const fastifyRateLimiter = rateLimiter(options);

  return (req: any, reply: any, done: any) => {
    fastifyRateLimiter(req.raw, reply.raw, done);
  };
};
