import { openai } from '@/app/lib/openai';
import { prisma } from '@/app/lib/prisma';
import { env } from '@/app/lib/env';
import { EmbeddingService } from '@/app/services/EmbeddingService';

interface GenerateInput {
  description: string;
  category?: string;
  tags?: string[];
}

interface RefineInput {
  promptId: string;
  instructions: string;
}

interface ContextPrompt {
  title: string;
  content: string;
  tags: string[];
}

export class RAGService {
  private static async buildContext(query: string, limit: number = 5): Promise<ContextPrompt[]> {
    const queryEmbedding = await EmbeddingService.generateEmbedding(query);
    const similar = await EmbeddingService.findSimilarPrompts(queryEmbedding, limit, 0.1);

    if (similar.length === 0) return [];

    const prompts = await prisma.prompt.findMany({
      where: { id: { in: similar.map((s) => s.prompt_id) } },
      select: { title: true, content: true, tags: true },
    });

    return prompts;
  }

  private static async callLLM(
    system: string,
    user: string,
    temperature: number = 0.7
  ): Promise<string> {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_CHAT_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '';
  }

  static async generatePrompt(input: GenerateInput): Promise<{ title: string; content: string; tags: string[]; category: string }> {
    const contextPrompts = await this.buildContext(input.description);

    const contextSection = contextPrompts.length > 0
      ? `\n\nHere are some similar existing prompts for reference:\n${contextPrompts.map((p, i) =>
          `--- Example ${i + 1} ---\nTitle: ${p.title}\nTags: ${p.tags.join(', ')}\nContent: ${p.content}`
        ).join('\n\n')}`
      : '';

    const system = `You are a prompt engineering expert. Generate high-quality AI prompt templates.
Your output must be valid JSON with this exact structure:
{"title": "...", "content": "...", "category": "...", "tags": ["tag1", "tag2"]}

Rules for metadata (IMPORTANT - these must be unique and specific to THIS prompt):
- Title: Create a unique, specific title that clearly describes what this prompt does (max 60 chars). Avoid generic titles like "Writing Assistant" - be specific like "Technical Blog Post Outline Generator"
- Category: Choose ONE specific category that best fits this prompt. Use consistent categories like: "Writing", "Coding", "Marketing", "Business", "Education", "Creative", "Analysis", "Communication", "Productivity", "Research"
- Tags: Generate 3-5 unique, specific tags that help categorize and search for this prompt. Tags should be lowercase, specific keywords (e.g., "email-writing", "python", "seo-optimization", "code-review"). Avoid generic tags like "ai" or "prompt"

Rules for content:
- Content should be a well-structured prompt template with clear instructions
- Use {{placeholders}} for variable parts the user should fill in
- Include context, role, task, and output format sections where appropriate
- The prompt should be practical and immediately usable${contextSection}`;

    const userMsg = `Generate a prompt template for the following description:
${input.description}${input.category ? `\nCategory: ${input.category}` : ''}${input.tags?.length ? `\nSuggested tags: ${input.tags.join(', ')}` : ''}`;

    const result = await this.callLLM(system, userMsg, 0.7);

    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        title: 'Generated Prompt',
        content: result,
        category: input.category || '',
        tags: input.tags || [],
      };
    }
  }

  static async refinePrompt(input: RefineInput): Promise<{ title: string; content: string; category: string; tags: string[] }> {
    const prompt = await prisma.prompt.findUnique({
      where: { id: input.promptId },
      select: { title: true, content: true, category: true, tags: true },
    });

    if (!prompt) throw new Error('Prompt not found');

    const contextPrompts = await this.buildContext(prompt.content);

    const contextSection = contextPrompts.length > 0
      ? `\n\nHere are some similar prompts for reference:\n${contextPrompts.map((p, i) =>
          `--- Example ${i + 1} ---\nTitle: ${p.title}\nContent: ${p.content}`
        ).join('\n\n')}`
      : '';

    const system = `You are a prompt engineering expert. Refine the given prompt based on user instructions.
Your output must be valid JSON with this exact structure:
{"title": "...", "content": "...", "category": "...", "tags": ["tag1", "tag2"]}

Rules:
- Keep the core intent of the original prompt
- Apply the user's refinement instructions precisely
- Improve clarity and structure where possible
- Use {{placeholders}} for variable parts
- Title: Keep it unique and specific to this prompt (max 60 chars)
- Category: Use one of: "Writing", "Coding", "Marketing", "Business", "Education", "Creative", "Analysis", "Communication", "Productivity", "Research"
- Tags: Generate 3-5 specific, lowercase tags that help categorize this prompt${contextSection}`;

    const userMsg = `Original prompt:
Title: ${prompt.title}
Content: ${prompt.content}
Category: ${prompt.category || 'Not set'}
Tags: ${prompt.tags.join(', ')}

Refinement instructions: ${input.instructions}`;

    const result = await this.callLLM(system, userMsg, 0.3);

    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        title: prompt.title,
        content: result,
        category: prompt.category || '',
        tags: prompt.tags,
      };
    }
  }

  static async suggestImprovements(promptId: string): Promise<string[]> {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { title: true, content: true, tags: true },
    });

    if (!prompt) throw new Error('Prompt not found');

    const system = `You are a prompt engineering expert. Analyze the given prompt and suggest improvements.
Your output must be a valid JSON array of strings, each being a specific, actionable improvement suggestion.
Return 3-5 suggestions. Example: ["Add a role/persona for the AI to adopt", "Include output format specification"]`;

    const userMsg = `Analyze this prompt and suggest improvements:
Title: ${prompt.title}
Content: ${prompt.content}
Tags: ${prompt.tags.join(', ')}`;

    const result = await this.callLLM(system, userMsg, 0.3);

    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return [result];
    }
  }

  static async *generatePromptStream(input: GenerateInput): AsyncGenerator<string> {
    const contextPrompts = await this.buildContext(input.description);

    const contextSection = contextPrompts.length > 0
      ? `\n\nHere are some similar existing prompts for reference:\n${contextPrompts.map((p, i) =>
          `--- Example ${i + 1} ---\nTitle: ${p.title}\nTags: ${p.tags.join(', ')}\nContent: ${p.content}`
        ).join('\n\n')}`
      : '';

    const system = `You are a prompt engineering expert. Generate a high-quality AI prompt template.
Write just the prompt content directly - no JSON wrapping, no title, no tags. Write a well-structured prompt template with clear instructions. Use {{placeholders}} for variable parts the user should fill in.${contextSection}`;

    const userMsg = `Generate a prompt template for: ${input.description}${input.category ? `\nCategory: ${input.category}` : ''}`;

    const stream = await openai.chat.completions.create({
      model: env.OPENAI_CHAT_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}
