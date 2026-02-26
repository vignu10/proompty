import { NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { withRateLimit } from "@/app/middleware/rateLimit";
import { Prompt } from "@/app/models/Prompt";
import { parseBody } from "@/app/lib/validators";
import { bulkActionSchema } from "@/app/lib/validators";

export async function POST(request: Request) {
  const rateLimitResponse = await withRateLimit(request, "crud");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { action, promptIds, tags, categoryIds } = parseBody(
      bulkActionSchema,
      body
    );

    let result;

    switch (action) {
      case "delete":
        result = await Prompt.bulkDelete(promptIds, auth.userId);
        break;

      case "star":
        result = await Prompt.bulkStar(promptIds, auth.userId);
        break;

      case "unstar":
        result = await Prompt.bulkUnstar(promptIds, auth.userId);
        break;

      case "export":
        result = await Prompt.exportPrompts(promptIds, auth.userId);
        break;

      case "addTags":
        if (!tags || tags.length === 0) {
          return NextResponse.json(
            { error: "Tags are required for addTags action" },
            { status: 400 }
          );
        }
        result = await Prompt.bulkAddTags(promptIds, tags, auth.userId);
        break;

      case "removeTags":
        if (!tags || tags.length === 0) {
          return NextResponse.json(
            { error: "Tags are required for removeTags action" },
            { status: 400 }
          );
        }
        result = await Prompt.bulkRemoveTags(promptIds, tags, auth.userId);
        break;

      case "setCategories":
        result = await Prompt.bulkSetCategories(
          promptIds,
          categoryIds || [],
          auth.userId
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in bulk action:", error);

    if (error.fields) {
      return NextResponse.json(
        { error: error.message, fields: error.fields },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
