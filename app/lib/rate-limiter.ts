/**
 * Token Bucket Rate Limiter
 *
 * In-memory implementation for development.
 * For production, consider using Redis with sliding window or token bucket.
 */

interface RateLimitConfig {
  maxTokens: number;      // Maximum tokens in bucket
  refillRate: number;     // Tokens added per interval
  refillInterval: number; // Interval in milliseconds
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store for rate limit buckets
const buckets = new Map<string, TokenBucket>();

// Rate limit configurations by category
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    maxTokens: 5,
    refillRate: 5,
    refillInterval: 60 * 1000, // 5 requests per minute
  },
  crud: {
    maxTokens: 30,
    refillRate: 30,
    refillInterval: 60 * 1000, // 30 requests per minute
  },
  ai: {
    maxTokens: 10,
    refillRate: 10,
    refillInterval: 60 * 1000, // 10 requests per minute
  },
  search: {
    maxTokens: 20,
    refillRate: 20,
    refillInterval: 60 * 1000, // 20 requests per minute
  },
  default: {
    maxTokens: 60,
    refillRate: 60,
    refillInterval: 60 * 1000, // 60 requests per minute
  },
};

function getBucket(key: string, config: RateLimitConfig): TokenBucket {
  const existing = buckets.get(key);
  const now = Date.now();

  if (existing) {
    // Calculate tokens to add based on time passed
    const timePassed = now - existing.lastRefill;
    const tokensToAdd = Math.floor(timePassed / config.refillInterval) * config.refillRate;

    if (tokensToAdd > 0) {
      existing.tokens = Math.min(config.maxTokens, existing.tokens + tokensToAdd);
      existing.lastRefill = now;
    }

    return existing;
  }

  // Create new bucket
  const bucket: TokenBucket = {
    tokens: config.maxTokens,
    lastRefill: now,
  };
  buckets.set(key, bucket);
  return bucket;
}

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
export function checkRateLimit(
  identifier: string,
  category: keyof typeof RATE_LIMITS = 'default'
): RateLimitResult {
  const config = RATE_LIMITS[category] || RATE_LIMITS.default;
  const key = `${category}:${identifier}`;
  const bucket = getBucket(key, config);

  const now = Date.now();
  const resetIn = config.refillInterval - (now - bucket.lastRefill);

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetIn: Math.max(0, resetIn),
      limit: config.maxTokens,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetIn: Math.max(0, resetIn),
    limit: config.maxTokens,
  };
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
 * Clean up old buckets (call periodically to prevent memory leaks)
 */
export function cleanupBuckets(maxAge: number = 5 * 60 * 1000): void {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(key);
    }
  }
}

// Cleanup old buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupBuckets(), 5 * 60 * 1000);
}
