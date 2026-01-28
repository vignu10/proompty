import { NextResponse } from "next/server";
import { verifyAuth } from "@/app/middleware/auth";
import { prisma } from "@/app/lib/prisma";

// GET /api/embeddings - View embedding stats and data
export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Get embeddings with prompt info (without the actual vector data which is huge)
    const embeddings = await prisma.$queryRaw<Array<{
      id: string;
      prompt_id: string;
      title: string;
      category: string | null;
      tags: string[];
      model: string;
      created_at: Date;
      vector_dimensions: number;
    }>>`
      SELECT
        pe.id,
        pe.prompt_id,
        p.title,
        p.category,
        p.tags,
        pe.model,
        pe.created_at,
        vector_dims(pe.embedding) as vector_dimensions
      FROM prompt_embeddings pe
      JOIN prompts p ON pe.prompt_id = p.id
      ORDER BY pe.created_at DESC
    `;

    // Get stats
    const stats = await prisma.$queryRaw<Array<{
      total: bigint;
      models_used: bigint;
    }>>`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT model) as models_used
      FROM prompt_embeddings
    `;

    return NextResponse.json({
      stats: {
        totalEmbeddings: Number(stats[0]?.total || 0),
        modelsUsed: Number(stats[0]?.models_used || 0),
      },
      embeddings: embeddings.map(e => ({
        ...e,
        created_at: e.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    return NextResponse.json(
      { error: "Failed to fetch embeddings" },
      { status: 500 }
    );
  }
}
