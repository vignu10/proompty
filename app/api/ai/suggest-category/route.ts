import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { RAGService } from "@/app/services/RAGService";
import { withRateLimit, RateLimitError } from "@/app/lib/rate-limiter";

/**
 * POST /api/ai/suggest-category
 * Suggest a category for a prompt based on its content
 */
export async function POST(request: NextRequest) {
  try {
    return await withRateLimit(request, 'ai', async (req) => {
      const auth = await verifyAuth(req);
      if (auth.error) {
        return NextResponse.json(auth.error, { status: auth.status });
      }

      const body = await req.json();
      const { content, title } = body;

      if (!content || typeof content !== "string") {
        return NextResponse.json(
          { error: "Content is required and must be a string" },
          { status: 400 }
        );
      }

      if (content.length < 10) {
        return NextResponse.json(
          { error: "Content is too short to generate meaningful suggestions" },
          { status: 400 }
        );
      }

      if (content.length > 5000) {
        return NextResponse.json(
          { error: "Content is too long (max 5000 characters)" },
          { status: 400 }
        );
      }

      const suggestion = await RAGService.suggestCategory(content, title);

      return NextResponse.json({
        category: suggestion.category,
        confidence: suggestion.confidence,
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

    console.error("Error in suggest-category API:", error);
    return NextResponse.json(
      { error: "Failed to generate category suggestion" },
      { status: 500 }
    );
  }
}
