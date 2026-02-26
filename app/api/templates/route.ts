import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { withRateLimit, RateLimitError } from "@/app/lib/rate-limiter";
import { Prompt } from "@/app/models/Prompt";

/**
 * GET /api/templates
 * Get all templates (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    return await withRateLimit(request, 'crud', async (req) => {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

      const auth = await verifyAuth(req).catch(() => null);
      const userId = auth && !('error' in auth) ? auth.userId : null;

      const result = await Prompt.findTemplates(userId, page, pageSize);

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

    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Save a prompt as a template (requires auth)
 */
export async function POST(request: NextRequest) {
  try {
    return await withRateLimit(request, 'crud', async (req) => {
      const auth = await verifyAuth(req);
      if ('error' in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      const { promptId } = await req.json();

      if (!promptId) {
        return NextResponse.json(
          { error: "promptId is required" },
          { status: 400 }
        );
      }

      // Update the prompt to be a template
      const { prisma } = await import("@/app/lib/prisma");

      // Verify ownership
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
        select: { userId: true },
      });

      if (!prompt) {
        return NextResponse.json(
          { error: "Prompt not found" },
          { status: 404 }
        );
      }

      if (prompt.userId !== auth.userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Set as template
      await prisma.prompt.update({
        where: { id: promptId },
        data: { isTemplate: true, isPublic: true },
      });

      // Invalidate cache
      const { cache } = await import("@/app/lib/cache");
      await cache.invalidatePrompt(promptId, auth.userId);

      return NextResponse.json(
        { message: "Prompt saved as template" },
        { status: 200 }
      );
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

    console.error("Error saving template:", error);
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 }
    );
  }
}
