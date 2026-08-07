/**
 * Assignment-related constants shared across the application.
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

/** Default assignment type assigned when an assignment is created. */
export const DEFAULT_ASSIGNMENT_TYPE: AssignmentType = "PICKUP";

/** Default assignment status assigned when an assignment is created. */
export const DEFAULT_ASSIGNMENT_STATUS: AssignmentStatus = "ASSIGNED";

/** Default active status assigned to new assignments. */
export const DEFAULT_ASSIGNMENT_ACTIVE_STATUS = true;

/** Maximum length permitted for assignment notes. */
export const ASSIGNMENT_NOTES_MAX_LENGTH = 500;

