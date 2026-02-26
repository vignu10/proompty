import { NextRequest, NextResponse } from "next/server";
import { RecommendationService } from "@/app/services/RecommendationService";
import { withRateLimit, RateLimitError } from "@/app/lib/rate-limiter";

/**
 * GET /api/prompts/[id]/similar
 * Get prompts similar to a specific prompt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await withRateLimit(request, 'search', async (req) => {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "5", 10);

      const similar = await RecommendationService.getSimilarPrompts(
        params.id,
        Math.min(limit, 20)
      );

      return NextResponse.json({
        similar,
        count: similar.length,
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

    console.error("Error in similar prompts API:", error);
    return NextResponse.json(
      { error: "Failed to get similar prompts" },
      { status: 500 }
    );
  }
}
