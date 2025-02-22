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
  category?: string | null;
  tags?: string[];
  userId: string;
  isPublic?: boolean;
}

export interface PromptUpdateData {
  title?: string;
  content?: string;
  category?: string | null;
  tags?: string[];
  isPublic?: boolean;
}

export class Prompt {
  static async findById(id: string): Promise<PromptWithUser | null> {
    return prisma.prompt.findUnique({
      where: { id },
      include: defaultInclude,
    });
  }

  static async findByUser(userId: string | null): Promise<PromptWithUser[]> {
    const whereInput: Prisma.PromptWhereInput = userId
      ? {
          OR: [
            { userId },
            { isPublic: true },
          ],
        }
      : {
          isPublic: true,
        };

    return prisma.prompt.findMany({
      where: whereInput,
      orderBy: { createdAt: "desc" },
      include: defaultInclude,
    });
  }

  static async create(data: PromptData): Promise<PromptWithUser> {
    const createInput: Prisma.PromptUncheckedCreateInput = {
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category?.trim() || null,
      tags: data.tags?.filter((tag) => tag?.trim()) || [],
      userId: data.userId,
      isPublic: data.isPublic ?? false
    };

    return prisma.prompt.create({
      data: createInput,
      include: defaultInclude,
    });
  }

  static async update(id: string, data: PromptUpdateData): Promise<PromptWithUser> {
    const updateInput: Prisma.PromptUpdateInput = {
      ...(data.title && { title: data.title.trim() }),
      ...(data.content && { content: data.content.trim() }),
      ...(data.category !== undefined && {
        category: data.category?.trim() || null,
      }),
      ...(data.tags && { tags: data.tags.filter((tag) => tag?.trim()) }),
      ...(typeof data.isPublic === "boolean" && { isPublic: data.isPublic }),
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
}
