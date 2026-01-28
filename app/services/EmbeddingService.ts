import { openai } from '@/app/lib/openai';
import { prisma } from '@/app/lib/prisma';
import { env } from '@/app/lib/env';

export class EmbeddingService {
  static preparePromptText(title: string, content: string, tags: string[]): string {
    const parts = [`Title: ${title}`];
    if (tags.length > 0) {
      parts.push(`Tags: ${tags.join(', ')}`);
    }
    parts.push(`Content: ${content}`);
    return parts.join('\n');
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: env.OPENAI_EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  }

  static async storePromptEmbedding(promptId: string, embedding: number[]): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO prompt_embeddings (prompt_id, embedding, model)
       VALUES ($1, $2::vector, $3)
       ON CONFLICT (prompt_id)
       DO UPDATE SET embedding = $2::vector, model = $3, updated_at = CURRENT_TIMESTAMP`,
      promptId,
      vectorStr,
      env.OPENAI_EMBEDDING_MODEL
    );
  }

  static async updatePromptEmbedding(promptId: string, text: string): Promise<void> {
    const embedding = await this.generateEmbedding(text);
    await this.storePromptEmbedding(promptId, embedding);
  }

  static async deletePromptEmbedding(promptId: string): Promise<void> {
    await prisma.$executeRawUnsafe(
      'DELETE FROM prompt_embeddings WHERE prompt_id = $1',
      promptId
    );
  }

  static async findSimilarPrompts(
    queryEmbedding: number[],
    limit: number = 10,
    threshold: number = 0.3,
    excludeId?: string
  ): Promise<Array<{ prompt_id: string; similarity: number }>> {
    const vectorStr = `[${queryEmbedding.join(',')}]`;

    const excludeClause = excludeId ? 'AND pe.prompt_id != $4' : '';
    const params: any[] = [vectorStr, threshold, limit];
    if (excludeId) params.push(excludeId);

    const results = await prisma.$queryRawUnsafe<
      Array<{ prompt_id: string; similarity: number }>
    >(
      `SELECT pe.prompt_id, 1 - (pe.embedding <=> $1::vector) AS similarity
       FROM prompt_embeddings pe
       JOIN prompts p ON p.id = pe.prompt_id
       WHERE 1 - (pe.embedding <=> $1::vector) > $2
       ${excludeClause}
       ORDER BY similarity DESC
       LIMIT $3`,
      ...params
    );

    return results;
  }
}
