// src/core/headers.ts
import { Response } from 'express';
import { RateLimitInfo } from '../types';

/**
 * Returns the number of seconds left for the window to reset.
 * @param resetTime - The time the rate limit window resets.
 * @param windowMs - The duration of the window in milliseconds.
 */
const getResetSeconds = (resetTime?: Date, windowMs?: number): number | undefined => {
  if (resetTime) {
    const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    return Math.max(0, deltaSeconds);
  } else if (windowMs) {
    return Math.ceil(windowMs / 1000);
  }
  return undefined;
};

/**
 * Sets the `RateLimit` headers based on the draft-8 specification of the IETF.
 * @param response - The Express response object to set headers on.
 * @param info - The rate limit info, used to set the headers.
 * @param windowMs - The window duration in milliseconds.
 */
export const setDraft8Headers = (response: Response, info: RateLimitInfo, windowMs: number): void => {
  if (response.headersSent) return;

  const windowSeconds = Math.ceil(windowMs / 1000);
  const resetSeconds = getResetSeconds(info.resetTime, windowMs);

  // Construct the RateLimit header according to draft-8
  response.setHeader('RateLimit', `limit=${info.limit}, remaining=${info.remaining}, reset=${resetSeconds ?? 0}`);
  response.setHeader('RateLimit-Policy', `${info.limit}; window=${windowSeconds}`);
};

/**
 * Sets the `Retry-After` header when the rate limit has been exceeded.
 * @param response - The Express response object.
 * @param info - The rate limit info, used to set the headers.
 * @param windowMs - The window duration in milliseconds.
 */
export const setRetryAfterHeader = (response: Response, info: RateLimitInfo, windowMs: number): void => {
  const resetSeconds = getResetSeconds(info.resetTime, windowMs);
  if (resetSeconds !== undefined) {
    response.setHeader('Retry-After', resetSeconds.toString());
  }
};
