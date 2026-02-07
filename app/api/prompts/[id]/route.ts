import { NextResponse } from "next/server";
import { verifyAuthAndOwnership } from "@/app/middleware/auth";
import { PromptController } from "@/app/controllers/PromptController";
import { withRateLimit } from "@/app/middleware/rateLimit";

// Get a single prompt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResponse = await withRateLimit(request, 'crud');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const result = await verifyAuthAndOwnership(request, params.id);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const promptResult = await PromptController.getPrompt(params.id);
    if ("error" in promptResult) {
      return NextResponse.json(
        { error: promptResult.error },
        { status: promptResult.status }
      );
    }

    return NextResponse.json(promptResult.data, {
      status: promptResult.status,
    });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    );
  }
}

// Update a prompt
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResponse = await withRateLimit(request, 'crud');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const auth = await verifyAuthAndOwnership(request, params.id);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { title, content, category, tags } = await request.json();
    const result = await PromptController.updatePrompt(params.id, {
      title,
      content,
      category,
      tags,
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    );
  }
}

// Delete a prompt
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResponse = await withRateLimit(request, 'crud');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const auth = await verifyAuthAndOwnership(request, params.id);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const result = await PromptController.deletePrompt(params.id);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return new NextResponse(null, { status: result.status });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
