import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

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
  tags?: string[];
  userId: string;
  isPublic?: boolean;
  originalPromptId?: string | null; // For forked prompts
  starredBy?: string[]; // Array of user IDs who starred this prompt
}

export interface PromptUpdateData {
  title?: string;
  content?: string;
  tags?: string[];
  isPublic?: boolean;
  starredBy?: string[];
}

export class Prompt {
  static async findById(id: string): Promise<PromptWithUser | null> {
    return prisma.prompt.findUnique({
      where: { id },
      include: defaultInclude,
    });
  }

  static async findByUser(
    userId: string | null,
    visibility: "all" | "public" | "private" | "starred" = "all",
    page: number = 1,
    pageSize: number = 10,
    tags: string[] = []
  ): Promise<{ prompts: PromptWithUser[]; total: number }> {
    const skip = (page - 1) * pageSize;

    let whereInput: Prisma.PromptWhereInput = {};

    // Apply tag filters if provided
    if (tags.length > 0) {
      whereInput.tags = {
        hasEvery: tags,
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

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where: whereInput,
        orderBy: { createdAt: "desc" },
        include: defaultInclude,
        skip,
        take: pageSize,
      }),
      prisma.prompt.count({ where: whereInput }),
    ]);

    return { prompts, total };
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
    };

    return prisma.prompt.create({
      data: createInput,
      include: defaultInclude,
    });
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
    };

    return prisma.prompt.update({
      where: { id },
      data: updateInput,
      include: defaultInclude,
    });
  }

  static async delete(id: string): Promise<PromptWithUser> {
    return prisma.prompt.delete({
      where: { id },
      include: defaultInclude,
    });
  }

  static async toggleStar(
    promptId: string,
    userId: string
  ): Promise<PromptWithUser> {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { starredBy: true },
    });

    if (!prompt) {
      throw new Error("Prompt not found");
    }

    const starredBy = prompt.starredBy || [];
    const isStarred = starredBy.includes(userId);

    return prisma.prompt.update({
      where: { id: promptId },
      data: {
        starredBy: isStarred
          ? { set: starredBy.filter((id) => id !== userId) }
          : { push: userId },
      },
      include: defaultInclude,
    });
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
      },
    });

    if (!sourcePrompt) {
      throw new Error("Source prompt not found");
    }

    return this.create({
      title: `${sourcePrompt.title} (Fork)`,
      content: sourcePrompt.content,
      tags: sourcePrompt.tags,
      userId: userId,
      isPublic: false,
      originalPromptId: promptId,
      starredBy: [],
    });
  }
}
