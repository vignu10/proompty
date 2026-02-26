import { NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { withRateLimit } from "@/app/middleware/rateLimit";
import { CategoryController } from "@/app/controllers/CategoryController";

// Get all categories (public endpoint - no auth required)
export async function GET(request: Request) {
  const rateLimitResponse = await withRateLimit(request, "crud");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const result = await CategoryController.getAllCategories();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Create a new category (requires auth)
export async function POST(request: Request) {
  const rateLimitResponse = await withRateLimit(request, "crud");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, slug, color, icon, sortOrder, isSystem } =
      await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const result = await CategoryController.createCategory({
      name: name.trim(),
      slug,
      color,
      icon,
      sortOrder,
      isSystem: isSystem ?? false,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
