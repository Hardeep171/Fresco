import { z } from "zod";

import {
  INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH,
  INSPECTION_DAMAGE_NOTES_MAX_LENGTH,
  INSPECTION_NOTES_MAX_LENGTH,
  ITEM_CONDITIONS,
} from "../constants/inspection.constants.js";
import { objectIdSchema } from "../lib/validation.js";

/** Reusable Zod schema for individual inspection item input validation. */
export const inspectionItemInputSchema = z.object({
  garmentId: objectIdSchema,
  serviceId: objectIdSchema,
  initialQuantity: z
    .number({ error: "Initial quantity must be a number." })
    .int({ error: "Initial quantity must be an integer." })
    .min(1, { error: "Initial quantity must be at least 1." }),
  inspectedQuantity: z
    .number({ error: "Inspected quantity must be a number." })
    .int({ error: "Inspected quantity must be an integer." })
    .min(0, { error: "Inspected quantity must be non-negative." }),
  condition: z.enum(ITEM_CONDITIONS, {
    error: "Invalid item condition.",
  }),
  damageNotes: z
    .string()
    .trim()
    .max(INSPECTION_DAMAGE_NOTES_MAX_LENGTH, {
      error: `Damage notes cannot exceed ${INSPECTION_DAMAGE_NOTES_MAX_LENGTH} characters.`,
    })
    .optional(),
  imageUrls: z.array(z.string().trim()).optional(),
});

/** Reusable Zod schema for extra service input validation. */
export const inspectionExtraServiceInputSchema = z.object({
  serviceId: objectIdSchema,
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be an integer." })
    .min(1, { error: "Quantity must be at least 1." }),
});

/** Reusable Zod schema for creating a new order inspection. */
export const createInspectionSchema = z.object({
  orderId: objectIdSchema,
  items: z
    .array(inspectionItemInputSchema)
    .min(1, { error: "Inspection must contain at least one item." }),
  extraServices: z.array(inspectionExtraServiceInputSchema).optional(),
  adjustmentAmount: z
    .number({ error: "Adjustment amount must be a number." })
    .optional(),
  adjustmentReason: z
    .string()
    .trim()
    .max(INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH, {
      error: `Adjustment reason cannot exceed ${INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH} characters.`,
    })
    .optional(),
  notes: z
    .string()
    .trim()
    .max(INSPECTION_NOTES_MAX_LENGTH, {
      error: `Notes cannot exceed ${INSPECTION_NOTES_MAX_LENGTH} characters.`,
    })
    .optional(),
});

/** Reusable Zod schema for updating an existing order inspection. */
export const updateInspectionSchema = z.object({
  items: z
    .array(inspectionItemInputSchema)
    .min(1, { error: "Inspection must contain at least one item." })
    .optional(),
  extraServices: z.array(inspectionExtraServiceInputSchema).optional(),
  adjustmentAmount: z
    .number({ error: "Adjustment amount must be a number." })
    .optional(),
  adjustmentReason: z
    .string()
    .trim()
    .max(INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH, {
      error: `Adjustment reason cannot exceed ${INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH} characters.`,
    })
    .optional(),
  notes: z
    .string()
    .trim()
    .max(INSPECTION_NOTES_MAX_LENGTH, {
      error: `Notes cannot exceed ${INSPECTION_NOTES_MAX_LENGTH} characters.`,
    })
    .optional(),
});

/** Reusable Zod schema for inspection ID route parameters. */
export const inspectionIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Reusable Zod schema for order ID route parameters in inspection routes. */
export const orderIdParamSchema = z.object({
  orderId: objectIdSchema,
});

/** Strongly typed interface inferred from `createInspectionSchema`. */
export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;

/** Strongly typed interface inferred from `updateInspectionSchema`. */
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;

/** Strongly typed interface inferred from `inspectionIdParamSchema`. */
export type InspectionIdParamInput = z.infer<typeof inspectionIdParamSchema>;

/** Strongly typed interface inferred from `orderIdParamSchema`. */
export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;
