import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { RecommendationService } from "@/app/services/RecommendationService";
import { withRateLimit, RateLimitError } from "@/app/lib/rate-limiter";

/**
 * GET /api/recommendations
 * Get personalized recommendations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    return await withRateLimit(request, 'search', async (req) => {
      const auth = await verifyAuth(req);
      if ('error' in auth) {
        return NextResponse.json(auth.error, { status: auth.status });
      }

      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const refresh = searchParams.get("refresh") === "true";

      const options = {
        limit: Math.min(limit, 50), // Max 50 recommendations
      };

      const recommendations = await RecommendationService.getRecommendedForUser(
        auth.userId,
        options
      );

      return NextResponse.json({
        recommendations,
        count: recommendations.length,
      });
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Too many requests', message: error.message },
        {
          status: 429,
          headers: {
            'Retry-After': error.retryAfter.toString(),
            'X-RateLimit-Limit': error.limit.toString(),
            'X-RateLimit-Remaining': error.remaining.toString(),
          },
        }
      );
    }

    console.error("Error in recommendations API:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
