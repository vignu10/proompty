import { RAGService } from '@/app/services/RAGService';

function classifyError(error: unknown): { error: string; status: number } {
  if (error instanceof Error) {
    if (error.message === 'Prompt not found') {
      return { error: 'Prompt not found', status: 404 };
    }
    // OpenAI API errors typically have a status property
    const apiError = error as Error & { status?: number; code?: string };
    if (apiError.status === 429 || apiError.code === 'insufficient_quota') {
      return { error: 'AI service quota exceeded. Please check your OpenAI API key and billing.', status: 503 };
    }
    if (apiError.status === 401) {
      return { error: 'Invalid OpenAI API key. Please check your configuration.', status: 503 };
    }
    if (apiError.message.includes('quota') || apiError.message.includes('billing')) {
      return { error: 'AI service quota exceeded. Please check your OpenAI API key and billing.', status: 503 };
    }
  }
  return { error: 'An unexpected error occurred', status: 500 };
}

export class AIController {
  static async generate(description: string, category?: string, tags?: string[]) {
    try {
      if (!description?.trim()) {
        return { error: 'Description is required', status: 400 };
      }
      const result = await RAGService.generatePrompt({ description, category, tags });
      return { data: result, status: 200 };
    } catch (error) {
      console.error('AI generation error:', error);
      return classifyError(error);
    }
  }

  static async refine(promptId: string, instructions: string) {
    try {
      if (!promptId?.trim()) {
        return { error: 'Prompt ID is required', status: 400 };
      }
      if (!instructions?.trim()) {
        return { error: 'Instructions are required', status: 400 };
      }
      const result = await RAGService.refinePrompt({ promptId, instructions });
      return { data: result, status: 200 };
    } catch (error) {
      console.error('AI refinement error:', error);
      return classifyError(error);
    }
  }

  static async suggest(promptId: string) {
    try {
      if (!promptId?.trim()) {
        return { error: 'Prompt ID is required', status: 400 };
      }
      const suggestions = await RAGService.suggestImprovements(promptId);
      return { data: { suggestions }, status: 200 };
    } catch (error) {
      console.error('AI suggestion error:', error);
      return classifyError(error);
    }
  }
}
