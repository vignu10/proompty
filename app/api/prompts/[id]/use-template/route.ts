import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { withRateLimit, RateLimitError } from "@/app/lib/rate-limiter";
import { Prompt } from "@/app/models/Prompt";

/**
 * POST /api/prompts/[id]/use-template
 * Use a template to create a new prompt
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await withRateLimit(request, 'crud', async (req) => {
      const auth = await verifyAuth(req);
      if ('error' in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      const result = await Prompt.createFromTemplate(
        params.id,
        auth.userId
      );

      return NextResponse.json(result, { status: 200 });
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

    console.error("Error using template:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Template not found") {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to use template" },
      { status: 500 }
    );
  }
}
