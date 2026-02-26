import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { cache } from "@/app/lib/cache";
import { env } from "@/app/lib/env";
import { NotFoundError, ValidationError } from "@/app/lib/errors";

export interface CategoryData {
  name: string;
  slug?: string;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isSystem?: boolean;
}

export interface CategoryUpdateData {
  name?: string;
  slug?: string;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
}

const defaultInclude = {
  _count: {
    select: {
      prompts: true,
    },
  },
} as const;

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: typeof defaultInclude;
}>;

export class Category {
  static async findAll(): Promise<CategoryWithCount[]> {
    const cacheKey = "categories:all";
    const cached = await cache.get<CategoryWithCount[]>(cacheKey);
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      include: defaultInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    await cache.set(cacheKey, categories, env.CACHE_TTL);
    return categories;
  }

  static async findById(id: string): Promise<CategoryWithCount | null> {
    const cacheKey = `category:${id}`;
    const cached = await cache.get<CategoryWithCount>(cacheKey);
    if (cached) return cached;

    const category = await prisma.category.findUnique({
      where: { id },
      include: defaultInclude,
    });

    if (category) {
      await cache.set(cacheKey, category, env.CACHE_TTL);
    }
    return category;
  }

  static async findBySlug(slug: string): Promise<CategoryWithCount | null> {
    const cacheKey = `category:slug:${slug}`;
    const cached = await cache.get<CategoryWithCount>(cacheKey);
    if (cached) return cached;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: defaultInclude,
    });

    if (category) {
      await cache.set(cacheKey, category, env.CACHE_TTL);
    }
    return category;
  }

  static async create(data: CategoryData): Promise<CategoryWithCount> {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug || this.slugify(data.name) },
    });

    if (existing) {
      throw new ValidationError("A category with this slug already exists");
    }

    const slug = data.slug || this.slugify(data.name);

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        color: data.color || null,
        icon: data.icon || null,
        sortOrder: data.sortOrder ?? 0,
        isSystem: data.isSystem ?? false,
      },
      include: defaultInclude,
    });

    // Invalidate categories list cache
    await cache.delPattern("categories:all");

    return category;
  }

  static async update(
    id: string,
    data: CategoryUpdateData
  ): Promise<CategoryWithCount> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found", "Category");
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    if (data.color !== undefined) {
      updateData.color = data.color;
    }

    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }

    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: defaultInclude,
    });

    // Invalidate caches
    await cache.del(`category:${id}`);
    await cache.del(`category:slug:${existing.slug}`);
    await cache.delPattern("categories:all");

    return category;
  }

  static async delete(id: string): Promise<CategoryWithCount> {
    const category = await prisma.category.delete({
      where: { id },
      include: defaultInclude,
    });

    // Invalidate caches
    await cache.del(`category:${id}`);
    await cache.del(`category:slug:${category.slug}`);
    await cache.delPattern("categories:all");

    return category;
  }

  static async findSystemCategories(): Promise<CategoryWithCount[]> {
    const cacheKey = "categories:system";
    const cached = await cache.get<CategoryWithCount[]>(cacheKey);
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      where: { isSystem: true },
      include: defaultInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    await cache.set(cacheKey, categories, env.CACHE_TTL);
    return categories;
  }

  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
