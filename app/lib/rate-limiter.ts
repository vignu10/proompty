/**
 * Token Bucket Rate Limiter with Redis Backend
 *
 * Persistent rate limiting using Redis for distributed systems.
 */

import { cache } from './cache';
import { env } from './env';
import { logger } from './logger';

interface RateLimitConfig {
  maxTokens: number;       // Maximum tokens in bucket
  tokensPerRefill: number; // Tokens added per refill
  refillInterval: number;  // Interval between refills in ms
  windowSize: number;      // Time window for expiration in ms
}

// Rate limit configurations by category
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    maxTokens: 5,
    tokensPerRefill: 5,
    refillInterval: 60 * 1000, // 5 requests per minute
    windowSize: 120 * 1000,    // 2 minutes
  },
  crud: {
    maxTokens: 30,
    tokensPerRefill: 30,
    refillInterval: 60 * 1000, // 30 requests per minute
    windowSize: 120 * 1000,    // 2 minutes
  },
  ai: {
    maxTokens: 10,
    tokensPerRefill: 10,
    refillInterval: 60 * 1000, // 10 requests per minute
    windowSize: 120 * 1000,    // 2 minutes
  },
  search: {
    maxTokens: 20,
    tokensPerRefill: 20,
    refillInterval: 60 * 1000, // 20 requests per minute
    windowSize: 120 * 1000,    // 2 minutes
  },
  default: {
    maxTokens: 60,
    tokensPerRefill: 60,
    refillInterval: 60 * 1000, // 60 requests per minute
    windowSize: 120 * 1000,    // 2 minutes
  },
};

export type RateLimitCategory = keyof typeof RATE_LIMITS;

// Lua script for atomic token bucket operations
const TOKEN_BUCKET_LUA = `
  local tokensKey = KEYS[1]
  local lastRefillKey = KEYS[2]
  local now = tonumber(ARGV[1])
  local maxTokens = tonumber(ARGV[2])
  refillInterval = tonumber(ARGV[3])
  local tokensPerRefill = tonumber(ARGV[4])
  local windowSize = tonumber(ARGV[5])

  -- Get current tokens and last refill time
  local tokens = tonumber(redis.call('GET', tokensKey))
  local lastRefill = tonumber(redis.call('GET', lastRefillKey))

  -- Initialize if not exists
  if not tokens then
    tokens = maxTokens
  end
  if not lastRefill then
    lastRefill = now
  end

  -- Calculate tokens to add based on elapsed time
  local elapsed = now - lastRefill
  local refills = math.floor(elapsed / refillInterval)
  local tokensToAdd = refills * tokensPerRefill

  -- Refill tokens
  if tokensToAdd > 0 then
    tokens = math.min(maxTokens, tokens + tokensToAdd)
    lastRefill = lastRefill + (refills * refillInterval)
  end

  -- Check if request is allowed
  if tokens >= 1 then
    -- Consume one token
    tokens = tokens - 1
    redis.call('SET', tokensKey, tokens)
    redis.call('SET', lastRefillKey, lastRefill)
    redis.call('EXPIRE', tokensKey, math.ceil(windowSize / 1000))
    redis.call('EXPIRE', lastRefillKey, math.ceil(windowSize / 1000))
    return {1, tokens, lastRefill}
  else
    -- Not enough tokens
    return {0, tokens, lastRefill}
  end
`;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // milliseconds until next refill
  limit: number;
}

/**
 * Check if a request is allowed under rate limits
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param category - Rate limit category (auth, crud, ai, search)
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  category: RateLimitCategory = 'default'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[category] || RATE_LIMITS.default;

  // If cache is disabled, always allow requests (dev mode fallback)
  if (!env.CACHE_ENABLED) {
    logger.warn('Rate limiting disabled - cache not enabled', { category, identifier });
    return {
      allowed: true,
      remaining: config.maxTokens,
      resetIn: 0,
      limit: config.maxTokens,
    };
  }

  const client = cache.getClient();
  if (!client) {
    logger.error('Redis client not available for rate limiting');
    return {
      allowed: true,
      remaining: config.maxTokens,
      resetIn: 0,
      limit: config.maxTokens,
    };
  }

  const now = Date.now();
  const keyTokens = `ratelimit:${category}:${identifier}:tokens`;
  const keyLastRefill = `ratelimit:${category}:${identifier}:refill`;

  try {
    const result = await client.eval(
      TOKEN_BUCKET_LUA,
      2,
      keyTokens,
      keyLastRefill,
      now,
      config.maxTokens,
      config.refillInterval,
      config.tokensPerRefill,
      config.windowSize
    ) as [number, number, number];

    const [allowed, remaining, lastRefill] = result;
    const resetIn = Math.max(0, (lastRefill + config.refillInterval) - now);

    return {
      allowed: allowed === 1,
      remaining,
      resetIn,
      limit: config.maxTokens,
    };
  } catch (error) {
    logger.error('Rate limit check failed', { category, identifier, error });
    // Fail open - allow request if rate limiter fails
    return {
      allowed: true,
      remaining: config.maxTokens,
      resetIn: 0,
      limit: config.maxTokens,
    };
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + result.resetIn / 1000).toString(),
  };
}

/**
 * Reset rate limit for a specific identifier (admin function)
 */
export async function resetRateLimit(
  identifier: string,
  category: RateLimitCategory = 'default'
): Promise<void> {
  const keyTokens = `ratelimit:${category}:${identifier}:tokens`;
  const keyLastRefill = `ratelimit:${category}:${identifier}:refill`;

  await Promise.all([
    cache.del(keyTokens),
    cache.del(keyLastRefill),
  ]);

  logger.info('Rate limit reset', { category, identifier });
}

/**
 * Get current token count for a user (admin/monitoring)
 */
export async function getRateLimitStatus(
  identifier: string,
  category: RateLimitCategory = 'default'
): Promise<{ tokens: number | null; lastRefill: number | null }> {
  const keyTokens = `ratelimit:${category}:${identifier}:tokens`;
  const keyLastRefill = `ratelimit:${category}:${identifier}:refill`;

  const [tokens, lastRefill] = await Promise.all([
    cache.get<number>(keyTokens),
    cache.get<number>(keyLastRefill),
  ]);

  return {
    tokens,
    lastRefill,
  };
}

/**
 * Legacy synchronous rate limiter for non-async contexts
 * Falls back to in-memory if Redis is not available
 * NOTE: This should be avoided in favor of async checkRateLimit
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const inMemoryBuckets = new Map<string, TokenBucket>();

function getInMemoryBucket(key: string, config: RateLimitConfig): TokenBucket {
  const existing = inMemoryBuckets.get(key);
  const now = Date.now();

  if (existing) {
    const timePassed = now - existing.lastRefill;
    const tokensToAdd = Math.floor(timePassed / config.refillInterval) * config.tokensPerRefill;

    if (tokensToAdd > 0) {
      existing.tokens = Math.min(config.maxTokens, existing.tokens + tokensToAdd);
      existing.lastRefill = now;
    }

    return existing;
  }

  const bucket: TokenBucket = {
    tokens: config.maxTokens,
    lastRefill: now,
  };
  inMemoryBuckets.set(key, bucket);
  return bucket;
}

/**
 * Synchronous rate limit check (fallback for non-async contexts)
 * Uses in-memory storage - not suitable for distributed systems
 */
export function checkRateLimitSync(
  identifier: string,
  category: RateLimitCategory = 'default'
): RateLimitResult {
  const config = RATE_LIMITS[category] || RATE_LIMITS.default;
  const key = `${category}:${identifier}`;
  const bucket = getInMemoryBucket(key, config);

  const now = Date.now();
  const resetIn = Math.max(0, config.refillInterval - (now - bucket.lastRefill));

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetIn,
      limit: config.maxTokens,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetIn,
    limit: config.maxTokens,
  };
}

/**
 * Clean up old in-memory buckets (only used for sync fallback)
 */
export function cleanupInMemoryBuckets(maxAge: number = 5 * 60 * 1000): void {
  const now = Date.now();
  for (const [key, bucket] of inMemoryBuckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      inMemoryBuckets.delete(key);
    }
  }
}

// Cleanup old in-memory buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupInMemoryBuckets(), 5 * 60 * 1000);
}
