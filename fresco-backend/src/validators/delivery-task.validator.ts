import { z } from "zod";

import {
  DELIVERY_TASK_NOTES_MAX_LENGTH,
  TASK_STATUSES,
  TASK_TYPES,
} from "../constants/delivery-task.constants.js";
import { booleanQuerySchema, objectIdSchema } from "../lib/validation.js";

/** Reusable Zod validation schema for creating a new delivery task. */
export const createDeliveryTaskSchema = z.object({
  assignmentId: objectIdSchema,
  notes: z
    .string()
    .trim()
    .max(DELIVERY_TASK_NOTES_MAX_LENGTH, {
      error: `Notes cannot exceed ${DELIVERY_TASK_NOTES_MAX_LENGTH} characters.`,
    })
    .optional(),
});

/** Reusable Zod validation schema for updating delivery task status. */
export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

/** Reusable Zod validation schema for delivery task ID parameter. */
export const deliveryTaskIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Reusable Zod validation schema for querying delivery tasks. */
export const getDeliveryTasksQuerySchema = z.object({
  partnerId: objectIdSchema.optional(),
  taskType: z.enum(TASK_TYPES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  isActive: booleanQuerySchema,
});

/** Strongly typed interface inferred from `createDeliveryTaskSchema`. */
export type CreateDeliveryTaskInput = z.infer<typeof createDeliveryTaskSchema>;

/** Strongly typed interface inferred from `updateTaskStatusSchema`. */
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

/** Strongly typed interface inferred from `deliveryTaskIdParamSchema`. */
export type DeliveryTaskIdParamInput = z.infer<
  typeof deliveryTaskIdParamSchema
>;

/** Strongly typed interface inferred from `getDeliveryTasksQuerySchema`. */
export type GetDeliveryTasksQueryInput = z.infer<
  typeof getDeliveryTasksQuerySchema
>;
