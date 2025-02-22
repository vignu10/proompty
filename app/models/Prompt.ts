import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PromptData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  userId: string;
}

export interface PromptUpdateData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export class Prompt {
  static async findById(id: string) {
    return prisma.prompt.findUnique({
      where: { id },
    });
  }

  static async findByUser(userId: string) {
    return prisma.prompt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
  }

  static async create(data: PromptData) {
    return prisma.prompt.create({
      data: {
        title: data.title.trim(),
        content: data.content.trim(),
        category: data.category?.trim() || null,
        tags: Array.isArray(data.tags) ? data.tags.filter(tag => tag?.trim()) : [],
        userId: data.userId,
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
  }

  static async update(id: string, data: PromptUpdateData) {
    return prisma.prompt.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.content && { content: data.content.trim() }),
        ...(data.category && { category: data.category.trim() }),
        ...(data.tags && { tags: data.tags.filter(tag => tag?.trim()) }),
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
  }

  static async delete(id: string) {
    return prisma.prompt.delete({
      where: { id },
    });
  }
}
