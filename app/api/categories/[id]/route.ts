import { NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { withRateLimit } from "@/app/middleware/rateLimit";
import { CategoryController } from "@/app/controllers/CategoryController";

// Get a single category (public endpoint)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResponse = await withRateLimit(request, "crud");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const result = await CategoryController.getCategory(params.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// Update a category (requires auth)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResponse = await withRateLimit(request, "crud");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, slug, color, icon, sortOrder } = await request.json();

    const result = await CategoryController.updateCategory(params.id, {
      name,
      slug,
      color,
      icon,
      sortOrder,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Delete a category (requires auth)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResponse = await withRateLimit(request, "crud");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await CategoryController.deleteCategory(params.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return new NextResponse(null, { status: result.status });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
