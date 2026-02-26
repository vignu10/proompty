import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { EmbeddingService } from "@/app/services/EmbeddingService";
import { cache } from "@/app/lib/cache";
import { env } from "@/app/lib/env";

type UserSelect = {
  name: true;
  email: true;
};

type PromptInclude = {
  user: {
    select: UserSelect;
  };
};

const defaultInclude = {
  user: {
    select: {
      name: true,
      email: true,
    },
  },
} as const;

type PromptWithUser = Prisma.PromptGetPayload<{
  include: typeof defaultInclude;
}>;

export interface PromptData {
  title: string;
  content: string;
  categoryIds?: string[]; // Array of category IDs instead of single category
  tags?: string[];
  userId: string;
  isPublic?: boolean;
  originalPromptId?: string | null; // For forked prompts
  starredBy?: string[]; // Array of user IDs who starred this prompt
  isTemplate?: boolean;
}

export interface PromptUpdateData {
  title?: string;
  content?: string;
  categoryIds?: string[]; // Array of category IDs instead of single category
  tags?: string[];
  isPublic?: boolean;
  starredBy?: string[];
  isTemplate?: boolean;
}

export class Prompt {
  static async findById(id: string): Promise<PromptWithUser | null> {
    const cacheKey = `prompt:${id}`;
    const cached = await cache.get<PromptWithUser>(cacheKey);
    if (cached) return cached;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: defaultInclude,
    });

    if (prompt) {
      await cache.set(cacheKey, prompt, env.CACHE_TTL);
    }
    return prompt;
  }

  static async findByUser(
    userId: string | null,
    visibility: "all" | "public" | "private" | "starred" = "all",
    page: number = 1,
    pageSize: number = 10,
    tags: string[] = [],
    categoryIds: string[] = []
  ): Promise<{ prompts: PromptWithUser[]; total: number }> {
    const skip = (page - 1) * pageSize;

    // Create cache key from query params
    const cacheKey = `prompts:byUser:${userId ?? 'anon'}:${visibility}:${page}:${pageSize}:${tags.sort().join(',')}:${categoryIds.sort().join(',')}`;
    const cached = await cache.get<{ prompts: PromptWithUser[]; total: number }>(cacheKey);
    if (cached) return cached;

    let whereInput: Prisma.PromptWhereInput = {};

    // Apply tag filters if provided
    if (tags.length > 0) {
      whereInput.tags = {
        hasEvery: tags,
      };
    }

    // Apply category filters if provided
    if (categoryIds.length > 0) {
      whereInput.categories = {
        some: {
          categoryId: {
            in: categoryIds,
          },
        },
      };
    }

    if (!userId) {
      // Not logged in - only show public prompts
      whereInput.isPublic = true;
    } else {
      // Logged in - filter based on visibility
      switch (visibility) {
        case "public":
          whereInput.isPublic = true;
          break;
        case "private":
          // Show all prompts by the user (both public and private)
          whereInput.userId = userId;
          break;
        case "starred":
          whereInput.starredBy = {
            has: userId,
          };
          break;
        default: // 'all'
          whereInput.OR = [{ userId }, { isPublic: true }];
      }
    }

    const includeWithCategories = {
      ...defaultInclude,
      categories: {
        include: {
          category: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    } as const;

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where: whereInput,
        orderBy: { createdAt: "desc" },
        include: includeWithCategories,
        skip,
        take: pageSize,
      }),
      prisma.prompt.count({ where: whereInput }),
    ]);

    const result = { prompts: prompts as PromptWithUser[], total };
    await cache.set(cacheKey, result, 300); // 5 minutes
    return result;
  }

  static async create(data: PromptData): Promise<PromptWithUser> {
    const createInput: Prisma.PromptUncheckedCreateInput = {
      title: data.title.trim(),
      content: data.content.trim(),
      tags: data.tags?.filter((tag) => tag?.trim()) || [],
      userId: data.userId,
      isPublic: data.isPublic ?? false,
      originalPromptId: data.originalPromptId ?? null,
      starredBy: data.starredBy || [],
      isTemplate: data.isTemplate ?? false,
    };

    // Handle categories if provided
    if (data.categoryIds && data.categoryIds.length > 0) {
      createInput.categories = {
        create: data.categoryIds.map((categoryId, index) => ({
          categoryId,
          sortOrder: index,
        })),
      };
    }

    const prompt = await prisma.prompt.create({
      data: createInput,
      include: {
        ...defaultInclude,
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    // Invalidate relevant caches
    await cache.invalidatePrompts(data.userId);

    // Fire-and-forget embedding generation
    const text = EmbeddingService.preparePromptText(
      prompt.title,
      prompt.content,
      prompt.tags
    );
    EmbeddingService.updatePromptEmbedding(prompt.id, text).catch((err) =>
      console.error("Failed to generate embedding for prompt:", prompt.id, err)
    );

    return prompt as PromptWithUser;
  }

  static async update(
    id: string,
    data: PromptUpdateData
  ): Promise<PromptWithUser> {
    const updateInput: Prisma.PromptUpdateInput = {
      ...(data.title && { title: data.title.trim() }),
      ...(data.content && { content: data.content.trim() }),
      ...(data.tags && { tags: data.tags.filter((tag) => tag?.trim()) }),
      ...(typeof data.isPublic === "boolean" && { isPublic: data.isPublic }),
      ...(data.starredBy && { starredBy: data.starredBy }),
      ...(typeof data.isTemplate === "boolean" && { isTemplate: data.isTemplate }),
    };

    // Handle categories update if provided
    if (data.categoryIds !== undefined) {
      // Delete existing categories and create new ones
      updateInput.categories = {
        deleteMany: {},
        ...(data.categoryIds.length > 0 && {
          create: data.categoryIds.map((categoryId, index) => ({
            categoryId,
            sortOrder: index,
          })),
        }),
      };
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: updateInput,
      include: {
        ...defaultInclude,
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    // Invalidate caches
    await cache.invalidatePrompt(id, prompt.userId);

    // Re-generate embedding after update
    const text = EmbeddingService.preparePromptText(
      prompt.title,
      prompt.content,
      prompt.tags
    );
    EmbeddingService.updatePromptEmbedding(prompt.id, text).catch((err) =>
      console.error("Failed to update embedding for prompt:", prompt.id, err)
    );

    return prompt as PromptWithUser;
  }

  static async delete(id: string): Promise<PromptWithUser> {
    // Delete embedding (cascade should handle it, but be explicit)
    EmbeddingService.deletePromptEmbedding(id).catch((err) =>
      console.error("Failed to delete embedding for prompt:", id, err)
    );

    const prompt = await prisma.prompt.delete({
      where: { id },
      include: defaultInclude,
    });

    // Invalidate caches
    await cache.invalidatePrompt(id, prompt.userId);

    return prompt;
  }

  static async toggleStar(
    promptId: string,
    userId: string
  ): Promise<PromptWithUser> {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { starredBy: true, userId: true },
    });

    if (!prompt) {
      throw new Error("Prompt not found");
    }

    const starredBy = prompt.starredBy || [];
    const isStarred = starredBy.includes(userId);

    const updated = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        starredBy: isStarred
          ? { set: starredBy.filter((id) => id !== userId) }
          : { push: userId },
      },
      include: defaultInclude,
    });

    // Invalidate caches
    await cache.invalidatePrompt(promptId, prompt.userId);
    await cache.invalidatePrompts(userId);

    return updated;
  }

  static async forkPrompt(
    promptId: string,
    userId: string
  ): Promise<PromptWithUser> {
    const sourcePrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: {
        title: true,
        content: true,
        tags: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!sourcePrompt) {
      throw new Error("Source prompt not found");
    }

    // Increment fork count on source prompt
    await prisma.prompt.update({
      where: { id: promptId },
      data: {
        forkCount: {
          increment: 1,
        },
      },
    });

    // Extract category IDs from source prompt
    const categoryIds = sourcePrompt.categories.map((pc) => pc.categoryId);

    return this.create({
      title: `${sourcePrompt.title} (Fork)`,
      content: sourcePrompt.content,
      categoryIds,
      tags: sourcePrompt.tags,
      userId: userId,
      isPublic: false,
      originalPromptId: promptId,
      starredBy: [],
    });
  }

  static async findByCategory(
    categoryId: string,
    userId: string | null,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ prompts: PromptWithUser[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const cacheKey = `prompts:byCategory:${categoryId}:${userId ?? "anon"}:${page}:${pageSize}`;
    const cached = await cache.get<{ prompts: PromptWithUser[]; total: number }>(cacheKey);
    if (cached) return cached;

    let whereInput: Prisma.PromptWhereInput = {
      categories: {
        some: {
          categoryId,
        },
      },
    };

    if (!userId) {
      whereInput.isPublic = true;
    } else {
      whereInput.OR = [{ userId }, { isPublic: true }];
    }

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where: whereInput,
        orderBy: { createdAt: "desc" },
        include: {
          ...defaultInclude,
          categories: {
            include: {
              category: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        skip,
        take: pageSize,
      }),
      prisma.prompt.count({ where: whereInput }),
    ]);

    const result = { prompts, total };
    await cache.set(cacheKey, result, 300);
    return result;
  }

  static async incrementViewCount(id: string): Promise<void> {
    await prisma.prompt.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
        lastViewedAt: new Date(),
      },
    });
    await cache.invalidatePrompt(id);
  }

  static async incrementUseCount(id: string): Promise<void> {
    await prisma.prompt.update({
      where: { id },
      data: {
        useCount: {
          increment: 1,
        },
      },
    });
    await cache.invalidatePrompt(id);
  }

  static async findTemplates(
    userId: string | null,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ prompts: PromptWithUser[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const cacheKey = `prompts:templates:${userId ?? "anon"}:${page}:${pageSize}`;
    const cached = await cache.get<{ prompts: PromptWithUser[]; total: number }>(cacheKey);
    if (cached) return cached;

    let whereInput: Prisma.PromptWhereInput = {
      isTemplate: true,
      isPublic: true,
    };

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where: whereInput,
        orderBy: { useCount: "desc" },
        include: {
          ...defaultInclude,
          categories: {
            include: {
              category: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        skip,
        take: pageSize,
      }),
      prisma.prompt.count({ where: whereInput }),
    ]);

    const result = { prompts, total };
    await cache.set(cacheKey, result, 300);
    return result;
  }

  static async createFromTemplate(
    templateId: string,
    userId: string
  ): Promise<PromptWithUser> {
    const template = await prisma.prompt.findUnique({
      where: { id: templateId },
      select: {
        title: true,
        content: true,
        tags: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    const categoryIds = template.categories.map((pc) => pc.categoryId);

    // Increment use count on template
    await this.incrementUseCount(templateId);

    return this.create({
      title: `${template.title}`,
      content: template.content,
      categoryIds,
      tags: template.tags,
      userId,
      isPublic: false,
      originalPromptId: null,
      starredBy: [],
    });
  }

  // ============ BULK OPERATIONS ============

  static async bulkDelete(
    promptIds: string[],
    userId: string
  ): Promise<{ success: number; failed: string[]; errors: string[] }> {
    const failed: string[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // First, verify ownership of all prompts
    const prompts = await prisma.prompt.findMany({
      where: {
        id: { in: promptIds },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    const ownedPromptIds = prompts
      .filter((p) => p.userId === userId)
      .map((p) => p.id);

    // Delete owned prompts
    for (const promptId of ownedPromptIds) {
      try {
        await this.delete(promptId);
        successCount++;
      } catch (error) {
        failed.push(promptId);
        errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return {
      success: successCount,
      failed,
      errors,
    };
  }

  static async bulkStar(
    promptIds: string[],
    userId: string
  ): Promise<{ success: number; failed: string[]; errors: string[] }> {
    const failed: string[] = [];
    const errors: string[] = [];
    let successCount = 0;

    for (const promptId of promptIds) {
      try {
        await this.toggleStar(promptId, userId);
        successCount++;
      } catch (error) {
        failed.push(promptId);
        errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return {
      success: successCount,
      failed,
      errors,
    };
  }

  static async bulkUnstar(
    promptIds: string[],
    userId: string
  ): Promise<{ success: number; failed: string[]; errors: string[] }> {
    const failed: string[] = [];
    const errors: string[] = [];
    let successCount = 0;

    for (const promptId of promptIds) {
      try {
        const prompt = await prisma.prompt.findUnique({
          where: { id: promptId },
          select: { starredBy: true },
        });

        if (!prompt) {
          failed.push(promptId);
          errors.push("Prompt not found");
          continue;
        }

        const starredBy = prompt.starredBy || [];
        if (starredBy.includes(userId)) {
          await prisma.prompt.update({
            where: { id: promptId },
            data: {
              starredBy: {
                set: starredBy.filter((id) => id !== userId),
              },
            },
          });
        }
        successCount++;
      } catch (error) {
        failed.push(promptId);
        errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    // Invalidate caches
    await cache.invalidatePrompts(userId);

    return {
      success: successCount,
      failed,
      errors,
    };
  }

  static async bulkAddTags(
    promptIds: string[],
    tags: string[],
    userId: string
  ): Promise<{ success: number; failed: string[]; errors: string[] }> {
    const failed: string[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // Verify ownership first
    const prompts = await prisma.prompt.findMany({
      where: {
        id: { in: promptIds },
        userId,
      },
      select: {
        id: true,
        tags: true,
      },
    });

    for (const prompt of prompts) {
      try {
        const existingTags = prompt.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];

        await prisma.prompt.update({
          where: { id: prompt.id },
          data: { tags: newTags },
        });

        // Invalidate cache for this prompt
        await cache.invalidatePrompt(prompt.id, userId);

        successCount++;
      } catch (error) {
        failed.push(prompt.id);
        errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return {
      success: successCount,
      failed,
      errors,
    };
  }

  static async bulkRemoveTags(
    promptIds: string[],
    tags: string[],
    userId: string
  ): Promise<{ success: number; failed: string[]; errors: string[] }> {
    const failed: string[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // Verify ownership first
    const prompts = await prisma.prompt.findMany({
      where: {
        id: { in: promptIds },
        userId,
      },
      select: {
        id: true,
        tags: true,
      },
    });

    for (const prompt of prompts) {
      try {
        const existingTags = prompt.tags || [];
        const newTags = existingTags.filter((tag) => !tags.includes(tag));

        await prisma.prompt.update({
          where: { id: prompt.id },
          data: { tags: newTags },
        });

        // Invalidate cache for this prompt
        await cache.invalidatePrompt(prompt.id, userId);

        successCount++;
      } catch (error) {
        failed.push(prompt.id);
        errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return {
      success: successCount,
      failed,
      errors,
    };
  }

  static async bulkSetCategories(
    promptIds: string[],
    categoryIds: string[],
    userId: string
  ): Promise<{ success: number; failed: string[]; errors: string[] }> {
    const failed: string[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // Verify ownership first
    const prompts = await prisma.prompt.findMany({
      where: {
        id: { in: promptIds },
        userId,
      },
      select: {
        id: true,
      },
    });

    for (const prompt of prompts) {
      try {
        // Delete existing categories
        await prisma.promptCategory.deleteMany({
          where: { promptId: prompt.id },
        });

        // Add new categories
        if (categoryIds.length > 0) {
          await prisma.promptCategory.createMany({
            data: categoryIds.map((categoryId, index) => ({
              promptId: prompt.id,
              categoryId,
              sortOrder: index,
            })),
          });
        }

        // Invalidate cache for this prompt
        await cache.invalidatePrompt(prompt.id, userId);

        successCount++;
      } catch (error) {
        failed.push(prompt.id);
        errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return {
      success: successCount,
      failed,
      errors,
    };
  }

  static async exportPrompts(
    promptIds: string[],
    userId: string
  ): Promise<{ prompts: PromptWithUser[]; failed: string[] }> {
    // Get all prompts (both owned and public)
    const prompts = await prisma.prompt.findMany({
      where: {
        id: { in: promptIds },
        OR: [{ userId }, { isPublic: true }],
      },
      include: {
        ...defaultInclude,
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    const failed = promptIds.filter(
      (id) => !prompts.find((p) => p.id === id)
    );

    return {
      prompts: prompts as PromptWithUser[],
      failed,
    };
  }
}
