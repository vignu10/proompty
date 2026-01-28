import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const BATCH_SIZE = 100;

function prepareText(title: string, content: string, tags: string[]): string {
  const parts = [`Title: ${title}`];
  if (tags.length > 0) parts.push(`Tags: ${tags.join(', ')}`);
  parts.push(`Content: ${content}`);
  return parts.join('\n');
}

async function backfill() {
  console.log('Starting embedding backfill...');

  const total = await prisma.prompt.count();
  console.log(`Found ${total} prompts total.`);

  // Find prompts without embeddings
  const promptsWithoutEmbeddings = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT p.id FROM prompts p
     LEFT JOIN prompt_embeddings pe ON pe.prompt_id = p.id
     WHERE pe.id IS NULL`
  );

  console.log(`${promptsWithoutEmbeddings.length} prompts need embeddings.`);

  if (promptsWithoutEmbeddings.length === 0) {
    console.log('All prompts already have embeddings. Done.');
    return;
  }

  const ids = promptsWithoutEmbeddings.map((p) => p.id);
  let processed = 0;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    const prompts = await prisma.prompt.findMany({
      where: { id: { in: batchIds } },
      select: { id: true, title: true, content: true, tags: true },
    });

    const texts = prompts.map((p) => prepareText(p.title, p.content, p.tags));

    const response = await openai.embeddings.create({
      model,
      input: texts,
    });

    for (let j = 0; j < prompts.length; j++) {
      const embedding = response.data[j].embedding;
      const vectorStr = `[${embedding.join(',')}]`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO prompt_embeddings (prompt_id, embedding, model)
         VALUES ($1, $2::vector, $3)
         ON CONFLICT (prompt_id) DO UPDATE SET embedding = $2::vector, model = $3, updated_at = CURRENT_TIMESTAMP`,
        prompts[j].id,
        vectorStr,
        model
      );
    }

    processed += prompts.length;
    console.log(`Processed ${processed}/${ids.length} prompts.`);
  }

  console.log('Backfill complete.');
}

backfill()
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
