import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/app/utils/auth";

const prisma = new PrismaClient();

// Middleware to verify auth token and ownership
async function verifyAuthAndOwnership(request: Request, promptId: string) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: "Invalid token", status: 401 };
  }

  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) {
    return { error: "Prompt not found", status: 404 };
  }

  if (prompt.userId !== decoded.userId) {
    return { error: "Unauthorized", status: 403 };
  }

  return { userId: decoded.userId, prompt };
}

// Get a single prompt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyAuthAndOwnership(request, params.id);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.prompt);
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
  try {
    const result = await verifyAuthAndOwnership(request, params.id);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { title, content, category, tags } = await request.json();

    // Input validation
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category?.trim() || null,
        tags: Array.isArray(tags)
          ? tags.filter((tag) => tag?.trim())
          : result.prompt.tags,
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedPrompt);
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
  try {
    const result = await verifyAuthAndOwnership(request, params.id);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    await prisma.prompt.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Prompt deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
