import { NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { PromptController } from "@/app/controllers/PromptController";

// Get prompts - public ones for everyone, private ones only for authenticated users
export async function GET(request: Request) {
  const auth = await verifyAuth(request).catch(() => null);
  const userId = auth && !("error" in auth) ? auth.userId : null;

  // Parse query parameters
  const url = new URL(request.url);
  const visibility =
    (url.searchParams.get("visibility") as
      | "all"
      | "public"
      | "private"
      | "starred") || "all";
  const tags = url.searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

  // Validate pagination parameters
  if (isNaN(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }
  if (isNaN(pageSize) || pageSize < 1 || pageSize > 50) {
    return NextResponse.json({ error: "Invalid page size" }, { status: 400 });
  }

  const result = await PromptController.getAllPrompts(
    userId,
    visibility,
    page,
    pageSize,
    tags
  );
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}

// Star/unstar a prompt
export async function PUT(request: Request) {
  const auth = await verifyAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { promptId, action } = await request.json();
    if (!promptId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let result;
    if (action === "star") {
      result = await PromptController.toggleStar(promptId, auth.userId);
    } else if (action === "fork") {
      result = await PromptController.forkPrompt(promptId, auth.userId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Create a new prompt
export async function POST(request: Request) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const { title, content, tags, isPublic, promptId, action } = body;

    // Validate action type if provided
    if (action && !['create', 'fork'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'create' or 'fork'" },
        { status: 400 }
      );
    }

    // Handle fork action
    if (action === "fork") {
      // Validate promptId for fork action
      if (!promptId) {
        return NextResponse.json(
          { error: "promptId is required for fork action" },
          { status: 400 }
        );
      }

      const result = await PromptController.forkPrompt(promptId, auth.userId);
      if ("error" in result) {
        return NextResponse.json(
          { error: result.error },
          { status: result.status }
        );
      }
      return NextResponse.json(result.data, { status: result.status });
    }

    // Validate required fields for prompt creation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Validate tags format
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags must be an array" },
        { status: 400 }
      );
    }

    // Handle regular prompt creation
    const result = await PromptController.createPrompt({
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string' && tag.trim()) : [],
      userId: auth.userId,
      isPublic: Boolean(isPublic),
      starredBy: [],
      originalPromptId: null,
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    // Log the full error for debugging
    console.error("Error in POST /api/prompts:", error);

    // Check if it's a parsing error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    // Return a generic error for other cases
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request" },
      { status: 500 }
    );
  }
}
