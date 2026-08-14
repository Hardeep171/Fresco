import { z } from "zod";

import {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
} from "../constants/category.constants.js";
import {
  booleanQuerySchema,
  createNameSchema,
  objectIdSchema,
} from "../lib/validation.js";

/**
 * Reusable Zod validation schema for creating a new category.
 */
export const createCategorySchema = z.object({
  name: createNameSchema(
    "Category name",
    CATEGORY_NAME_MIN_LENGTH,
    CATEGORY_NAME_MAX_LENGTH,
  ),

  description: z
    .string()
    .trim()
    .max(CATEGORY_DESCRIPTION_MAX_LENGTH, {
      error: `Description cannot exceed ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters.`,
    })
    .optional(),

  icon: z.string().trim().optional(),

  displayOrder: z
    .number({ error: "Display order must be a number." })
    .int({ error: "Display order must be an integer." })
    .min(0, { error: "Display order cannot be negative." })
    .optional(),

  isActive: z.boolean().optional(),
});

/**
 * Reusable Zod validation schema for updating an existing category.
 * All fields are optional and reuse the validation logic from `createCategorySchema`.
 */
export const updateCategorySchema = createCategorySchema.partial();

/** Reusable Zod validation schema for category ID parameter. */
export const categoryIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Reusable Zod validation schema for querying categories list. */
export const getCategoriesQuerySchema = z.object({
  isActive: booleanQuerySchema,
});

/** Strongly typed interface inferred from `createCategorySchema`. */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/** Strongly typed interface inferred from `updateCategorySchema`. */
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/** Strongly typed interface inferred from `categoryIdParamSchema`. */
export type CategoryIdParamInput = z.infer<typeof categoryIdParamSchema>;

/** Strongly typed interface inferred from `getCategoriesQuerySchema`. */
export type GetCategoriesQueryInput = z.infer<typeof getCategoriesQuerySchema>;
