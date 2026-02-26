import { NextResponse } from "next/server";
import { Category, CategoryData, CategoryUpdateData } from "@/app/models/Category";
import { ValidationError, NotFoundError } from "@/app/lib/errors";

export class CategoryController {
  static async getAllCategories() {
    try {
      const categories = await Category.findAll();
      return { data: categories, status: 200 };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { error: "Failed to fetch categories", status: 500 };
    }
  }

  static async getCategory(categoryId: string) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return { error: "Category not found", status: 404 };
      }
      return { data: category, status: 200 };
    } catch (error) {
      console.error("Error fetching category:", error);
      return { error: "Failed to fetch category", status: 500 };
    }
  }

  static async getCategoryBySlug(slug: string) {
    try {
      const category = await Category.findBySlug(slug);
      if (!category) {
        return { error: "Category not found", status: 404 };
      }
      return { data: category, status: 200 };
    } catch (error) {
      console.error("Error fetching category:", error);
      return { error: "Failed to fetch category", status: 500 };
    }
  }

  static async createCategory(data: CategoryData) {
    try {
      if (!data.name?.trim()) {
        return { error: "Name is required", status: 400 };
      }

      const category = await Category.create(data);
      return { data: category, status: 201 };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { error: error.message, status: 400 };
      }
      console.error("Error creating category:", error);
      return { error: "Failed to create category", status: 500 };
    }
  }

  static async updateCategory(categoryId: string, data: CategoryUpdateData) {
    try {
      const category = await Category.update(categoryId, data);
      return { data: category, status: 200 };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return { error: error.message, status: 404 };
      }
      console.error("Error updating category:", error);
      return { error: "Failed to update category", status: 500 };
    }
  }

  static async deleteCategory(categoryId: string) {
    try {
      await Category.delete(categoryId);
      return { data: null, status: 204 };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return { error: error.message, status: 404 };
      }
      console.error("Error deleting category:", error);
      return { error: "Failed to delete category", status: 500 };
    }
  }
}
