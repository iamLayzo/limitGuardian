import { RateLimitOptions } from '../types';

/**
 * Validates the rate limit options to ensure they are correctly formatted and within acceptable ranges.
 * 
 * @param options - The rate limiter options to validate.
 * @throws Will throw an error if the options are invalid.
 */
export function validateRateLimitOptions(options: RateLimitOptions): void {
  if (!options.store) {
    throw new Error('A store must be provided for rate limiting.');
  }

  if (options.windowMs && (typeof options.windowMs !== 'number' || options.windowMs <= 0)) {
    throw new Error('windowMs must be a positive number.');
  }

  if (options.limit && (typeof options.limit !== 'number' || options.limit <= 0)) {
    throw new Error('limit must be a positive number.');
  }

  if (options.skip && typeof options.skip !== 'function') {
    throw new Error('skip must be a function that returns a boolean or a Promise<boolean>.');
  }

  if (options.standardHeaders && !['draft-6', 'draft-8'].includes(options.standardHeaders)) {
    throw new Error('standardHeaders must be either "draft-6" or "draft-8".');
  }

  if (options.legacyHeaders !== undefined && typeof options.legacyHeaders !== 'boolean') {
    throw new Error('legacyHeaders must be a boolean value.');
  }
}

/**
 * Validates if the request should be skipped based on the provided skip function.
 * 
 * @param req - The request object.
 * @param options - The rate limiter options containing the skip logic.
 * @returns A promise that resolves to a boolean indicating if the request should be skipped.
 */
export async function shouldSkipRequest(req: any, options: RateLimitOptions): Promise<boolean> {
  if (typeof options.skip === 'function') {
    return await options.skip(req);
  }
  return false;
}
