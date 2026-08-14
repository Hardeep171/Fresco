import { z } from "zod";

import {
  GARMENT_DESCRIPTION_MAX_LENGTH,
  GARMENT_NAME_MAX_LENGTH,
  GARMENT_NAME_MIN_LENGTH,
} from "../constants/garment.constants.js";
import {
  booleanQuerySchema,
  createNameSchema,
  objectIdSchema,
} from "../lib/validation.js";

/**
 * Reusable Zod validation schema for creating a new garment.
 */
export const createGarmentSchema = z.object({
  categoryId: objectIdSchema,

  name: createNameSchema(
    "Garment name",
    GARMENT_NAME_MIN_LENGTH,
    GARMENT_NAME_MAX_LENGTH,
  ),

  description: z
    .string()
    .trim()
    .max(GARMENT_DESCRIPTION_MAX_LENGTH, {
      error: `Description cannot exceed ${GARMENT_DESCRIPTION_MAX_LENGTH} characters.`,
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
 * Reusable Zod validation schema for updating an existing garment.
 * All fields are optional and reuse validation rules from `createGarmentSchema`.
 */
export const updateGarmentSchema = createGarmentSchema.partial();

/** Reusable Zod validation schema for garment ID parameter. */
export const garmentIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Reusable Zod validation schema for querying garments list. */
export const getGarmentsQuerySchema = z.object({
  categoryId: objectIdSchema.optional(),
  isActive: booleanQuerySchema,
});

/** Strongly typed interface inferred from `createGarmentSchema`. */
export type CreateGarmentInput = z.infer<typeof createGarmentSchema>;

/** Strongly typed interface inferred from `updateGarmentSchema`. */
export type UpdateGarmentInput = z.infer<typeof updateGarmentSchema>;

/** Strongly typed interface inferred from `garmentIdParamSchema`. */
export type GarmentIdParamInput = z.infer<typeof garmentIdParamSchema>;

/** Strongly typed interface inferred from `getGarmentsQuerySchema`. */
export type GetGarmentsQueryInput = z.infer<typeof getGarmentsQuerySchema>;
