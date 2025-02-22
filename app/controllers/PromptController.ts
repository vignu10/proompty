import { NextResponse } from 'next/server';
import { Prompt, PromptData, PromptUpdateData } from '@/app/models/Prompt';

export class PromptController {
  static async getAllPrompts(userId: string | null) {
    try {
      const prompts = await Prompt.findByUser(userId);
      return { data: prompts, status: 200 };
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
