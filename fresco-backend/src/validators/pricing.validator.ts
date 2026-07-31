import { z } from "zod";

import { PRICE_MIN_VALUE } from "../constants/pricing.constants.js";
import { objectIdSchema } from "../lib/validation.js";

/**
 * Reusable Zod validation schema for creating a new pricing entry.
 */
export const createPricingSchema = z.object({
  garmentId: objectIdSchema,

  serviceId: objectIdSchema,

  price: z
    .number({ error: "Price must be a number." })
    .min(PRICE_MIN_VALUE, {
      error: `Price cannot be less than ${PRICE_MIN_VALUE}.`,
    }),

  currency: z.string().trim().optional(),

  isActive: z.boolean().optional(),
});

/**
 * Reusable Zod validation schema for updating an existing pricing entry.
 * All fields are optional and reuse validation rules from `createPricingSchema`.
 */
export const updatePricingSchema = createPricingSchema.partial();

/**
 * Reusable Zod validation schema for pricing ID parameter.
 * Validates that `id` is a valid MongoDB ObjectId.
 */
export const pricingIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Strongly typed interface inferred from `createPricingSchema`. */
export type CreatePricingInput = z.infer<typeof createPricingSchema>;

/** Strongly typed interface inferred from `updatePricingSchema`. */
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;

/** Strongly typed interface inferred from `pricingIdParamSchema`. */
export type PricingIdParamInput = z.infer<typeof pricingIdParamSchema>;
