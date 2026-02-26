import { prisma } from "@/app/lib/prisma";
import { EmbeddingService } from "./EmbeddingService";
import { cache } from "@/app/lib/cache";

interface RecommendationOptions {
  limit?: number;
  excludeViewed?: boolean;
  excludeIds?: string[];
}

interface InteractionWeights {
  viewed: number;
  starred: number;
  forked: number;
  used_as_template: number;
}

const DEFAULT_WEIGHTS: InteractionWeights = {
  viewed: 1,
  starred: 3,
  forked: 5,
  used_as_template: 4,
};

/**
 * Service for generating personalized prompt recommendations
 * based on user behavior and semantic similarity
 */
export class RecommendationService {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly USER_PROFILE_CACHE_TTL = 600; // 10 minutes

  /**
   * Get a user's interest profile by averaging embeddings
   * of prompts they've interacted with
   */
  static async getUserProfileEmbedding(userId: string): Promise<number[] | null> {
    const cacheKey = `user_profile:${userId}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as number[];
    }

    try {
      // Get user's interactions with weights
      const interactions = await prisma.promptInteraction.findMany({
        where: { userId },
        include: {
          prompt: {
            select: {
              embedding: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // Consider last 50 interactions
      });

      if (interactions.length === 0) {
        return null;
      }

      // Calculate weighted average embedding
      const weightedEmbeddings: number[][] = [];
      const weights: number[] = [];

      for (const interaction of interactions) {
        if (!interaction.prompt.embedding) continue;

        const weight = DEFAULT_WEIGHTS[interaction.type as keyof InteractionWeights] || 1;
        weightedEmbeddings.push(interaction.prompt.embedding as number[]);
        weights.push(weight);
      }

      if (weightedEmbeddings.length === 0) {
        return null;
      }

      // Compute weighted average
      const dimension = weightedEmbeddings[0].length;
      const profileEmbedding = new Array(dimension).fill(0);
      let totalWeight = 0;

      for (let i = 0; i < weightedEmbeddings.length; i++) {
        const embedding = weightedEmbeddings[i];
        const weight = weights[i];

        for (let j = 0; j < dimension; j++) {
          profileEmbedding[j] += embedding[j] * weight;
        }
        totalWeight += weight;
      }

      // Normalize by total weight
      for (let i = 0; i < dimension; i++) {
        profileEmbedding[i] /= totalWeight;
      }

      // Cache the result
      await cache.set(cacheKey, JSON.stringify(profileEmbedding), this.USER_PROFILE_CACHE_TTL);

      return profileEmbedding;
    } catch (error) {
      console.error("Error getting user profile embedding:", error);
      return null;
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  static async getRecommendedForUser(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<{ id: string; title: string; score: number }[]> {
    const { limit = 10, excludeIds = [] } = options;
    const cacheKey = `recommendations:${userId}:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as { id: string; title: string; score: number }[];
    }

    try {
      const profileEmbedding = await this.getUserProfileEmbedding(userId);

      if (!profileEmbedding) {
        // No profile yet, return trending prompts
        return this.getTrendingPrompts({ limit, timeWindow: "week" });
      }

      // Find similar prompts using vector similarity
      const similarPrompts = await prisma.$queryRaw`
        SELECT
          p.id,
          p.title,
          1 - (p.embedding <=> ${profileEmbedding}::vector) as similarity
        FROM "prompts" p
        WHERE p.embedding IS NOT NULL
          AND p."isPublic" = true
          AND p."userId" != ${userId}
          AND p.id NOT IN (${excludeIds.join(",")}::uuid[])
        ORDER BY p.embedding <=> ${profileEmbedding}::vector
        LIMIT ${limit * 2}
      ` as Array<{ id: string; title: string; similarity: number }>;

      const recommendations = similarPrompts
        .slice(0, limit)
        .map((p) => ({
          id: p.id,
          title: p.title,
          score: p.similarity,
        }));

      await cache.set(cacheKey, JSON.stringify(recommendations), this.CACHE_TTL);

      return recommendations;
    } catch (error) {
      console.error("Error getting recommendations for user:", error);
      return [];
    }
  }

  /**
   * Get prompts similar to a specific prompt
   */
  static async getSimilarPrompts(
    promptId: string,
    limit: number = 5
  ): Promise<{ id: string; title: string; score: number }[]> {
    const cacheKey = `similar:${promptId}:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as { id: string; title: string; score: number }[];
    }

    try {
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
        select: { embedding: true },
      });

      if (!prompt?.embedding) {
        return [];
      }

      const similarPrompts = await prisma.$queryRaw`
        SELECT
          p.id,
          p.title,
          1 - (p.embedding <=> ${prompt.embedding}::vector) as similarity
        FROM "prompts" p
        WHERE p.embedding IS NOT NULL
          AND p."isPublic" = true
          AND p.id != ${promptId}
        ORDER BY p.embedding <=> ${prompt.embedding}::vector
        LIMIT ${limit + 1}
      ` as Array<{ id: string; title: string; similarity: number }>;

      const result = similarPrompts.map((p) => ({
        id: p.id,
        title: p.title,
        score: p.similarity,
      }));

      await cache.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

      return result;
    } catch (error) {
      console.error("Error getting similar prompts:", error);
      return [];
    }
  }

  /**
   * Get trending prompts based on recent interactions
   */
  static async getTrendingPrompts(options: {
    timeWindow?: "day" | "week" | "month";
    limit?: number;
  } = {}): Promise<{ id: string; title: string; score: number }[]> {
    const { timeWindow = "week", limit = 10 } = options;
    const cacheKey = `trending:${timeWindow}:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as { id: string; title: string; score: number }[];
    }

    try {
      const timeWindowMap = {
        day: "1 day",
        week: "7 days",
        month: "30 days",
      };

      const trendingPrompts = await prisma.$queryRaw`
        SELECT
          p.id,
          p.title,
          COUNT(*) as interaction_count,
          SUM(CASE
            WHEN i.type = 'viewed' THEN 1
            WHEN i.type = 'starred' THEN 3
            WHEN i.type = 'forked' THEN 5
            WHEN i.type = 'used_as_template' THEN 4
            ELSE 1
          END) as weighted_score
        FROM "prompts" p
        LEFT JOIN "PromptInteraction" i ON i."promptId" = p.id
          AND i."createdAt" >= NOW() - INTERVAL '${timeWindowMap[timeWindow]}'::interval
        WHERE p."isPublic" = true
        GROUP BY p.id, p.title
        HAVING COUNT(*) > 0 OR p."viewCount" > 0
        ORDER BY weighted_score DESC, p."viewCount" DESC
        LIMIT ${limit * 2}
      ` as Array<{ id: string; title: string; weighted_score: number }>;

      const result = trendingPrompts.slice(0, limit).map((p) => ({
        id: p.id,
        title: p.title,
        score: p.weighted_score,
      }));

      await cache.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

      return result;
    } catch (error) {
      console.error("Error getting trending prompts:", error);
      return [];
    }
  }

  /**
   * Record a user interaction with a prompt
   */
  static async recordInteraction(
    userId: string,
    promptId: string,
    type: "viewed" | "starred" | "forked" | "used_as_template"
  ): Promise<void> {
    try {
      await prisma.promptInteraction.upsert({
        where: {
          promptId_userId_type: {
            promptId,
            userId,
            type,
          },
        },
        create: {
          promptId,
          userId,
          type,
        },
        update: {
          createdAt: new Date(), // Update timestamp for recency
        },
      });

      // Invalidate relevant caches
      await cache.delete(`user_profile:${userId}`);
      await cache.delete(`recommendations:${userId}:*`);

      // Update prompt stats
      const updateData: Record<string, number> = {};
      if (type === "viewed") {
        updateData.viewCount = 1;
      } else if (type === "forked") {
        updateData.forkCount = 1;
      } else if (type === "used_as_template") {
        updateData.useCount = 1;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.prompt.update({
          where: { id: promptId },
          data: {
            ...updateData,
            lastViewedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error recording interaction:", error);
    }
  }
}
