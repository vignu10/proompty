import { NextRequest, NextResponse } from "next/server";
import { RecommendationService } from "@/app/services/RecommendationService";
import { withRateLimit, RateLimitError } from "@/app/lib/rate-limiter";

/**
 * GET /api/trending
 * Get trending prompts based on recent interactions
 */
export async function GET(request: NextRequest) {
  try {
    return await withRateLimit(request, 'search', async (req) => {
      const { searchParams } = new URL(req.url);
      const timeWindow = (searchParams.get("timeWindow") || "week") as
        | "day"
        | "week"
        | "month";
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      // Validate timeWindow
      const validTimeWindows = ["day", "week", "month"];
      if (!validTimeWindows.includes(timeWindow)) {
        return NextResponse.json(
          { error: "Invalid timeWindow. Must be one of: day, week, month" },
          { status: 400 }
        );
      }

      const trending = await RecommendationService.getTrendingPrompts({
        timeWindow,
        limit: Math.min(limit, 50),
      });

      return NextResponse.json({
        trending,
        count: trending.length,
        timeWindow,
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

    console.error("Error in trending API:", error);
    return NextResponse.json(
      { error: "Failed to get trending prompts" },
      { status: 500 }
    );
  }
}
