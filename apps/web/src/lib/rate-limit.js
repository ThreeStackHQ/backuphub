"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
exports.getRateLimitRemaining = getRateLimitRemaining;
const ioredis_1 = __importDefault(require("ioredis"));
let redisClient = null;
function getRedisClient() {
    if (!redisClient) {
        const url = process.env.REDIS_URL;
        if (!url)
            throw new Error('Missing REDIS_URL environment variable');
        redisClient = new ioredis_1.default(url, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });
    }
    return redisClient;
}
/**
 * Sliding window rate limiter using Redis sorted sets
 *
 * @param userId - User ID to rate limit
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSeconds - Time window in seconds (default: 3600 = 1 hour)
 * @returns boolean - true if allowed, false if rate limited
 */
async function checkRateLimit(userId, limit = 10, windowSeconds = 3600) {
    const redis = getRedisClient();
    const key = `rate-limit:download:${userId}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    try {
        // Ensure connection is established
        if (redis.status !== 'ready' && redis.status !== 'connect') {
            await redis.connect();
        }
        // Remove expired entries (older than window)
        await redis.zremrangebyscore(key, '-inf', windowStart);
        // Count current requests in window
        const currentCount = await redis.zcard(key);
        if (currentCount >= limit) {
            return false; // Rate limited
        }
        // Add current request timestamp
        await redis.zadd(key, now, `${now}`);
        // Set expiry on the key (cleanup)
        await redis.expire(key, windowSeconds);
        return true; // Allowed
    }
    catch (err) {
        console.error('[rate-limit] Redis error:', err);
        // On Redis failure, allow the request (fail open)
        return true;
    }
}
/**
 * Get remaining rate limit quota for a user
 *
 * @param userId - User ID to check
 * @param limit - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns number - remaining requests in window
 */
async function getRateLimitRemaining(userId, limit = 10, windowSeconds = 3600) {
    const redis = getRedisClient();
    const key = `rate-limit:download:${userId}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    try {
        if (redis.status !== 'ready' && redis.status !== 'connect') {
            await redis.connect();
        }
        await redis.zremrangebyscore(key, '-inf', windowStart);
        const currentCount = await redis.zcard(key);
        return Math.max(0, limit - currentCount);
    }
    catch (err) {
        console.error('[rate-limit] Redis error:', err);
        return limit; // On error, show full quota
    }
}
//# sourceMappingURL=rate-limit.js.map