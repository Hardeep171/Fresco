/**
 * Assignment-related constants mirroring FRESCO backend contracts.
 */

/** Permitted types for an assignment. */
export const ASSIGNMENT_TYPES = ["PICKUP", "DELIVERY"] as const;

/** Union of all permitted assignment types. */
export type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

/** Permitted lifecycle statuses for an assignment. */
export const ASSIGNMENT_STATUSES = [
  "ASSIGNED",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
] as const;

/** Union of all permitted assignment statuses. */
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

/** Human-readable display labels for assignment types. */
export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  PICKUP: "Pickup Task",
  DELIVERY: "Delivery Task",
};

/** Human-readable display labels for assignment statuses. */
export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted (In Progress)",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Filter tabs supported on partner assignments list. */
export const ASSIGNMENT_FILTER_TABS: (AssignmentStatus | "ALL")[] = [
  "ALL",
  "ASSIGNED",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
];

export type AssignmentFilterTab = (typeof ASSIGNMENT_FILTER_TABS)[number];
