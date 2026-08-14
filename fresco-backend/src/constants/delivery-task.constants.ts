/**
 * Delivery task-related constants shared across the application.
 */

/** Permitted types for a delivery task. */
export const TASK_TYPES = ["PICKUP", "DELIVERY"] as const;

/** Union of all permitted delivery task types. */
export type TaskType = (typeof TASK_TYPES)[number];

/** Permitted lifecycle statuses for a delivery task. */
export const TASK_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

/** Union of all permitted delivery task statuses. */
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Default task status assigned when a task is created. */
export const DEFAULT_TASK_STATUS: TaskStatus = "PENDING";

/** Default active status assigned to new delivery tasks. */
export const DEFAULT_TASK_ACTIVE_STATUS = true;

/** Maximum length permitted for delivery task notes. */
export const DELIVERY_TASK_NOTES_MAX_LENGTH = 500;
