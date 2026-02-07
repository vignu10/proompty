import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/app/lib/rate-limiter';

type RateLimitCategory = keyof typeof RATE_LIMITS;

/**
 * Extract client identifier from request
 * Uses X-Forwarded-For header (for proxies) or falls back to a default
 */
function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback for development
  return 'localhost';
}

/**
 * Rate limit middleware for API routes
 *
 * Usage:
 * ```ts
 * export async function POST(request: Request) {
 *   const rateLimitResponse = await withRateLimit(request, 'ai');
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // ... rest of handler
 * }
 * ```
 */
export async function withRateLimit(
  request: Request,
  category: RateLimitCategory = 'default',
  customIdentifier?: string
): Promise<NextResponse | null> {
  const identifier = customIdentifier || getClientIdentifier(request);
  const result = await checkRateLimit(identifier, category);
  const headers = getRateLimitHeaders(result);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${Math.ceil(result.resetIn / 1000)} seconds.`,
        retryAfter: Math.ceil(result.resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
        },
      }
    );
  }

  return null; // Request is allowed
}

/**
 * Add rate limit headers to a successful response
 */
export async function addRateLimitHeaders(
  response: NextResponse,
  request: Request,
  category: RateLimitCategory = 'default'
): Promise<NextResponse> {
  const identifier = getClientIdentifier(request);
  const result = await checkRateLimit(identifier, category);
  const headers = getRateLimitHeaders(result);

  // Note: We already consumed a token in withRateLimit, so remaining is accurate
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Higher-order function to wrap an entire route handler with rate limiting
 */
export function rateLimited<T extends Request>(
  category: RateLimitCategory,
  handler: (request: T, context?: any) => Promise<NextResponse>
) {
  return async (request: T, context?: any): Promise<NextResponse> => {
    const rateLimitResponse = await withRateLimit(request, category);
    if (rateLimitResponse) return rateLimitResponse;

    const response = await handler(request, context);
    return await addRateLimitHeaders(response, request, category);
  };
}
