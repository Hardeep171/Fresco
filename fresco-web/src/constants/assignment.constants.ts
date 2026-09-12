/**
 * Assignment-related constants mirroring FRESCO backend contracts.
 */

export const ASSIGNMENT_TYPES = ["PICKUP", "DELIVERY"] as const;
export type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

export const ASSIGNMENT_STATUSES = [
  "ASSIGNED",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  PICKUP: "Visit 1: Customer Pickup",
  DELIVERY: "Visit 2: Customer Delivery",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted (En Route)",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ASSIGNMENT_FILTER_TABS: (AssignmentStatus | "ALL")[] = [
  "ALL",
  "ASSIGNED",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
];

export type AssignmentFilterTab = (typeof ASSIGNMENT_FILTER_TABS)[number];
