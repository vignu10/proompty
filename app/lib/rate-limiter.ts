/**
 * In-Memory Token Bucket Rate Limiter
 *
 * Rate limiting using in-memory storage.
 */

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
export function resetRateLimit(
  identifier: string,
  category: RateLimitCategory = 'default'
): void {
  const key = `${category}:${identifier}`;
  inMemoryBuckets.delete(key);
}

/**
 * Get current token count for a user (admin/monitoring)
 */
export function getRateLimitStatus(
  identifier: string,
  category: RateLimitCategory = 'default'
): { tokens: number | null; lastRefill: number | null } {
  const key = `${category}:${identifier}`;
  const bucket = inMemoryBuckets.get(key);
  if (!bucket) {
    return { tokens: null, lastRefill: null };
  }
  return { tokens: bucket.tokens, lastRefill: bucket.lastRefill };
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
 * Synchronous rate limit check
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
 * Clean up old in-memory buckets
 */
export function cleanupInMemoryBuckets(maxAge: number = 5 * 60 * 1000): void {
  const now = Date.now();
  for (const [key, bucket] of inMemoryBuckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      inMemoryBuckets.delete(key);
    }
  }
}

/**
 * Rate limit middleware wrapper for Next.js API routes
 * Usage: withRateLimit(request, 'ai', handler) or withRateLimit(request, handler, 'ai')
 */
export async function withRateLimit<T>(
  request: Request,
  categoryOrHandler: RateLimitCategory | ((request: Request) => Promise<T>),
  handlerOrCategory?: ((request: Request) => Promise<T>) | RateLimitCategory
): Promise<T> {
  // Parse arguments (support both orderings for backwards compatibility)
  let category: RateLimitCategory = 'default';
  let handler: (request: Request) => Promise<T>;

  if (typeof categoryOrHandler === 'string') {
    category = categoryOrHandler;
    handler = handlerOrCategory as (request: Request) => Promise<T>;
  } else {
    handler = categoryOrHandler;
    category = (handlerOrCategory as RateLimitCategory) || 'default';
  }

  // Get identifier from IP or user token
  const identifier = getIdentifier(request);

  // Check rate limit
  const result = await checkRateLimit(identifier, category);

  if (!result.allowed) {
    throw new RateLimitError('Too many requests', result);
  }

  // Call the original handler
  return handler(request);
}

export class RateLimitError extends Error {
  public readonly retryAfter: number;
  public readonly limit: number;
  public readonly remaining: number;

  constructor(message: string, result: RateLimitResult) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = Math.ceil(result.resetIn / 1000);
    this.limit = result.limit;
    this.remaining = result.remaining;
  }
}

/**
 * Extract identifier from request for rate limiting
 * Priority: user token > IP address
 */
function getIdentifier(request: Request): string {
  // Try to get user ID from authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Use token as identifier (could decode JWT to get user ID)
    return `user:${token.substring(0, 10)}`;
  }

  // Fall back to IP address
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';
  return `ip:${ip}`;
}

// Cleanup old in-memory buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupInMemoryBuckets(), 5 * 60 * 1000);
}
