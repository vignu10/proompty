import { z } from 'zod';

// ============================================
// Auth Validators
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ============================================
// Prompt Validators
// ============================================

export const createPromptSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform((s) => s.trim()),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be 50,000 characters or less')
    .transform((s) => s.trim()),
  category: z
    .string()
    .max(100, 'Category must be 100 characters or less')
    .transform((s) => s.trim())
    .nullable()
    .optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be 50 characters or less'))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),
  isPublic: z.boolean().default(false),
  action: z.enum(['create', 'fork']).optional(),
  promptId: z.string().optional(),
});

export const updatePromptSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform((s) => s.trim())
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be 50,000 characters or less')
    .transform((s) => s.trim())
    .optional(),
  category: z
    .string()
    .max(100, 'Category must be 100 characters or less')
    .transform((s) => s.trim())
    .nullable()
    .optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be 50 characters or less'))
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  isPublic: z.boolean().optional(),
});

export const starPromptSchema = z.object({
  promptId: z.string().min(1, 'Prompt ID is required'),
  action: z.enum(['star', 'fork']),
});

export const promptIdSchema = z.object({
  id: z.string().min(1, 'Prompt ID is required'),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type StarPromptInput = z.infer<typeof starPromptSchema>;

// ============================================
// Search Validators
// ============================================

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(500, 'Query too long'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  mode: z.enum(['semantic', 'keyword', 'hybrid']).default('hybrid'),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ============================================
// AI Validators
// ============================================

export const aiGenerateSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be 2000 characters or less')
    .transform((s) => s.trim()),
  category: z
    .string()
    .max(100, 'Category must be 100 characters or less')
    .transform((s) => s.trim())
    .optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be 50 characters or less'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export const aiRefineSchema = z.object({
  promptId: z.string().min(1, 'Prompt ID is required'),
  instructions: z
    .string()
    .min(5, 'Instructions must be at least 5 characters')
    .max(1000, 'Instructions must be 1000 characters or less')
    .transform((s) => s.trim()),
});

export const aiSuggestSchema = z.object({
  promptId: z.string().min(1, 'Prompt ID is required'),
});

export type AIGenerateInput = z.infer<typeof aiGenerateSchema>;
export type AIRefineInput = z.infer<typeof aiRefineSchema>;
export type AISuggestInput = z.infer<typeof aiSuggestSchema>;

// ============================================
// Pagination Validators
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const promptListQuerySchema = paginationSchema.extend({
  visibility: z.enum(['all', 'public', 'private', 'starred']).default('all'),
  tags: z
    .string()
    .transform((s) => s.split(',').filter(Boolean))
    .default(''),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type PromptListQueryInput = z.infer<typeof promptListQuerySchema>;

// ============================================
// Bulk Action Validators
// ============================================

export const bulkActionSchema = z.object({
  action: z.enum(["delete", "star", "unstar", "export", "addTags", "removeTags", "setCategories"]),
  promptIds: z.array(z.string().min(1, "Invalid prompt ID")).min(1, "At least one prompt ID is required"),
  tags: z.array(z.string().max(50, "Tag must be 50 characters or less")).optional(),
  categoryIds: z.array(z.string().min(1, "Invalid category ID")).optional(),
});

export type BulkActionInput = z.infer<typeof bulkActionSchema>;

// ============================================
// Utility Functions
// ============================================

/**
 * Parse and validate request body with Zod schema
 * Returns parsed data or throws ValidationError
 */
export function parseBody<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten();
    const fieldErrors = Object.entries(errors.fieldErrors).reduce(
      (acc, [field, messages]) => {
        if (messages && messages.length > 0) {
          acc[field] = messages[0];
        }
        return acc;
      },
      {} as Record<string, string>
    );

    const firstError = Object.values(fieldErrors)[0] || 'Validation failed';
    throw new ValidationErrorWithFields(firstError, fieldErrors);
  }

  return result.data;
}

/**
 * Parse query parameters from URL
 */
export function parseQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return parseBody(schema, params);
}

/**
 * Validation error with field details
 */
class ValidationErrorWithFields extends Error {
  public readonly fields: Record<string, string>;
  public readonly statusCode = 400;

  constructor(message: string, fields: Record<string, string>) {
    super(message);
    this.fields = fields;
    this.name = 'ValidationError';
  }
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(
  error: unknown
): error is ValidationErrorWithFields {
  return error instanceof ValidationErrorWithFields;
}
