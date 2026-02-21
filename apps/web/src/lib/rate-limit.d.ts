/**
 * Sliding window rate limiter using Redis sorted sets
 *
 * @param userId - User ID to rate limit
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSeconds - Time window in seconds (default: 3600 = 1 hour)
 * @returns boolean - true if allowed, false if rate limited
 */
export declare function checkRateLimit(userId: string, limit?: number, windowSeconds?: number): Promise<boolean>;
/**
 * Get remaining rate limit quota for a user
 *
 * @param userId - User ID to check
 * @param limit - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns number - remaining requests in window
 */
export declare function getRateLimitRemaining(userId: string, limit?: number, windowSeconds?: number): Promise<number>;
//# sourceMappingURL=rate-limit.d.ts.map