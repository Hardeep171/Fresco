import { z } from "zod";

import {
  ASSIGNMENT_NOTES_MAX_LENGTH,
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_TYPES,
} from "../constants/assignment.constants.js";
import { objectIdSchema } from "../lib/validation.js";

/** Reusable Zod validation schema for creating a new assignment. */
export const createAssignmentSchema = z.object({
  orderId: objectIdSchema,
  partnerId: objectIdSchema,
  assignmentType: z.enum(ASSIGNMENT_TYPES),
  notes: z
    .string()
    .trim()
    .max(ASSIGNMENT_NOTES_MAX_LENGTH, {
      error: `Notes cannot exceed ${ASSIGNMENT_NOTES_MAX_LENGTH} characters.`,
    })
    .optional(),
});

/** Reusable Zod validation schema for updating assignment status. */
export const updateAssignmentStatusSchema = z.object({
  status: z.enum(ASSIGNMENT_STATUSES),
});

/** Reusable Zod validation schema for assignment ID parameter. */
export const assignmentIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Strongly typed interface inferred from `createAssignmentSchema`. */
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

/** Strongly typed interface inferred from `updateAssignmentStatusSchema`. */
export type UpdateAssignmentStatusInput = z.infer<
  typeof updateAssignmentStatusSchema
>;

/** Strongly typed interface inferred from `assignmentIdParamSchema`. */
export type AssignmentIdParamInput = z.infer<typeof assignmentIdParamSchema>;
