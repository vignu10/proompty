import { NextResponse } from 'next/server';
import { Prompt, PromptData, PromptUpdateData } from '@/app/models/Prompt';

export class PromptController {
  static async getAllPrompts(
    userId: string | null,
    visibility: 'all' | 'public' | 'private' | 'starred' = 'all',
    page: number = 1,
    pageSize: number = 10,
    tags: string[] = []
  ) {
    try {
      const { prompts, total } = await Prompt.findByUser(userId, visibility, page, pageSize, tags);
      return { 
        data: { 
          prompts,
          pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
          }
        }, 
        status: 200 
      };
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return { error: 'Failed to fetch prompts', status: 500 };
    }
  }

  static async getPrompt(promptId: string) {
    try {
      const prompt = await Prompt.findById(promptId);
      if (!prompt) {
        return { error: 'Prompt not found', status: 404 };
      }
      return { data: prompt, status: 200 };
    } catch (error) {
      console.error('Error fetching prompt:', error);
      return { error: 'Failed to fetch prompt', status: 500 };
    }
  }

  static async toggleStar(promptId: string, userId: string) {
    try {
      const prompt = await Prompt.toggleStar(promptId, userId);
      return { data: prompt, status: 200 };
    } catch (error) {
      console.error('Error toggling star:', error);
      if (error instanceof Error && error.message === 'Prompt not found') {
        return { error: 'Prompt not found', status: 404 };
      }
      return { error: 'Failed to toggle star', status: 500 };
    }
  }

  static async forkPrompt(promptId: string, userId: string) {
    try {
      const prompt = await Prompt.forkPrompt(promptId, userId);
      return { data: prompt, status: 200 };
    } catch (error) {
      console.error('Error forking prompt:', error);
      if (error instanceof Error && error.message === 'Source prompt not found') {
        return { error: 'Source prompt not found', status: 404 };
      }
      return { error: 'Failed to fork prompt', status: 500 };
    }
  }

  static async createPrompt(data: PromptData) {
    try {
      if (!data.title?.trim()) {
        return { error: 'Title is required', status: 400 };
      }

      if (!data.content?.trim()) {
        return { error: 'Content is required', status: 400 };
      }

      const prompt = await Prompt.create(data);
      return { data: prompt, status: 201 };
    } catch (error) {
      console.error('Error creating prompt:', error);
      return { error: 'Failed to create prompt', status: 500 };
    }
  }

  static async updatePrompt(promptId: string, data: PromptUpdateData) {
    try {
      if (!data.title?.trim()) {
        return { error: 'Title is required', status: 400 };
      }

      if (!data.content?.trim()) {
        return { error: 'Content is required', status: 400 };
      }

      const prompt = await Prompt.update(promptId, data);
      return { data: prompt, status: 200 };
    } catch (error) {
      console.error('Error updating prompt:', error);
      return { error: 'Failed to update prompt', status: 500 };
    }
  }

  static async deletePrompt(promptId: string) {
    try {
      await Prompt.delete(promptId);
      return { data: null, status: 204 };
    } catch (error) {
      console.error('Error deleting prompt:', error);
      return { error: 'Failed to delete prompt', status: 500 };
    }
  }
}
