import { z } from "zod";

import {
  SERVICE_DESCRIPTION_MAX_LENGTH,
  SERVICE_NAME_MAX_LENGTH,
  SERVICE_NAME_MIN_LENGTH,
} from "../constants/service.constants.js";
import {
  booleanQuerySchema,
  createNameSchema,
  objectIdSchema,
} from "../lib/validation.js";

/**
 * Reusable Zod validation schema for creating a new service.
 */
export const createServiceSchema = z.object({
  name: createNameSchema(
    "Service name",
    SERVICE_NAME_MIN_LENGTH,
    SERVICE_NAME_MAX_LENGTH,
  ),

  description: z
    .string()
    .trim()
    .max(SERVICE_DESCRIPTION_MAX_LENGTH, {
      error: `Description cannot exceed ${SERVICE_DESCRIPTION_MAX_LENGTH} characters.`,
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
 * Reusable Zod validation schema for updating an existing service.
 * All fields are optional and reuse validation rules from `createServiceSchema`.
 */
export const updateServiceSchema = createServiceSchema.partial();

/** Reusable Zod validation schema for service ID parameter. */
export const serviceIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Reusable Zod validation schema for querying services list. */
export const getServicesQuerySchema = z.object({
  isActive: booleanQuerySchema,
});

/** Strongly typed interface inferred from `createServiceSchema`. */
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

/** Strongly typed interface inferred from `updateServiceSchema`. */
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

/** Strongly typed interface inferred from `serviceIdParamSchema`. */
export type ServiceIdParamInput = z.infer<typeof serviceIdParamSchema>;

/** Strongly typed interface inferred from `getServicesQuerySchema`. */
export type GetServicesQueryInput = z.infer<typeof getServicesQuerySchema>;
