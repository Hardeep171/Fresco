/**
 * Delivery task-related constants mirroring FRESCO backend contracts.
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

/** Human-readable display labels for delivery task statuses. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Filter tabs supported on partner delivery tasks list. */
export const TASK_FILTER_TABS: (TaskStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export type TaskFilterTab = (typeof TASK_FILTER_TABS)[number];
