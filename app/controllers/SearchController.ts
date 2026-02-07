import { EmbeddingService } from '@/app/services/EmbeddingService';
import { prisma } from '@/app/lib/prisma';
import { cache } from '@/app/lib/cache';
import { createHash } from 'crypto';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  userId: string;
  starredBy: string[];
  originalPromptId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string | null; email: string };
  similarity?: number;
}

export class SearchController {
  /**
   * Create a consistent hash for search query caching
   */
  private static hashSearchQuery(query: string, mode: string, limit: number, userId: string | null): string {
    const str = JSON.stringify({ query, mode, limit, userId });
    return createHash('md5').update(str).digest('hex');
  }

  static async semanticSearch(
    query: string,
    userId: string | null,
    limit: number = 10
  ): Promise<{ data: SearchResult[]; status: number } | { error: string; status: number }> {
    try {
      const cacheKey = `search:semantic:${this.hashSearchQuery(query, 'semantic', limit, userId)}`;
      const cached = await cache.get<SearchResult[]>(cacheKey);
      if (cached) {
        return { data: cached, status: 200 };
      }

      const queryEmbedding = await EmbeddingService.generateEmbedding(query);
      const similar = await EmbeddingService.findSimilarPrompts(queryEmbedding, limit, 0.1);

      if (similar.length === 0) {
        return { data: [], status: 200 };
      }

      const promptIds = similar.map((s) => s.prompt_id);
      const similarityMap = new Map(similar.map((s) => [s.prompt_id, s.similarity]));

      const prompts = await prisma.prompt.findMany({
        where: {
          id: { in: promptIds },
          OR: userId
            ? [{ isPublic: true }, { userId }]
            : [{ isPublic: true }],
        },
        include: { user: { select: { name: true, email: true } } },
      });

      const results: SearchResult[] = prompts
        .map((p) => ({
          ...p,
          similarity: similarityMap.get(p.id) ?? 0,
        }))
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));

      await cache.set(cacheKey, results, 300); // 5 minutes
      return { data: results, status: 200 };
    } catch (error) {
      console.error('Semantic search error:', error);
      return { error: 'Semantic search failed', status: 500 };
    }
  }

  static async hybridSearch(
    query: string,
    userId: string | null,
    limit: number = 10
  ): Promise<{ data: SearchResult[]; status: number } | { error: string; status: number }> {
    try {
      // Run keyword and semantic searches in parallel
      const [keywordResults, semanticResult] = await Promise.all([
        this.keywordSearch(query, userId, limit),
        this.semanticSearch(query, userId, limit),
      ]);

      if ('error' in keywordResults) return keywordResults;
      if ('error' in semanticResult) return semanticResult;

      // Reciprocal Rank Fusion
      const k = 60;
      const scoreMap = new Map<string, { score: number; prompt: SearchResult }>();

      keywordResults.data.forEach((prompt, rank) => {
        const rrf = 1 / (k + rank + 1);
        scoreMap.set(prompt.id, { score: rrf, prompt });
      });

      semanticResult.data.forEach((prompt, rank) => {
        const rrf = 1 / (k + rank + 1);
        const existing = scoreMap.get(prompt.id);
        if (existing) {
          existing.score += rrf;
        } else {
          scoreMap.set(prompt.id, { score: rrf, prompt });
        }
      });

      const fused = Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => entry.prompt);

      return { data: fused, status: 200 };
    } catch (error) {
      console.error('Hybrid search error:', error);
      return { error: 'Search failed', status: 500 };
    }
  }

  static async keywordSearch(
    query: string,
    userId: string | null,
    limit: number = 10
  ): Promise<{ data: SearchResult[]; status: number } | { error: string; status: number }> {
    try {
      const cacheKey = `search:keyword:${this.hashSearchQuery(query, 'keyword', limit, userId)}`;
      const cached = await cache.get<SearchResult[]>(cacheKey);
      if (cached) {
        return { data: cached, status: 200 };
      }

      const visibilityFilter = userId
        ? [{ isPublic: true }, { userId }]
        : [{ isPublic: true }];

      const prompts = await prisma.prompt.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
          AND: { OR: visibilityFilter },
        },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      await cache.set(cacheKey, prompts, 300); // 5 minutes
      return { data: prompts, status: 200 };
    } catch (error) {
      console.error('Keyword search error:', error);
      return { error: 'Keyword search failed', status: 500 };
    }
  }
}
