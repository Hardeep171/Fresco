/**
 * User-related constants shared across the application.
 */

/** Permitted roles for a FRESCO user. */
export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
  "DELIVERY_PARTNER",
  "CUSTOMER",
] as const;

/** Union of all permitted user roles. */
export type UserRole = (typeof USER_ROLES)[number];

/** Permitted lifecycle statuses for a FRESCO user. */
export const USER_STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;

/** Union of all permitted user statuses. */
export type UserStatus = (typeof USER_STATUSES)[number];

/** Default role assigned when a user is created without an explicit role. */
export const DEFAULT_USER_ROLE: UserRole = "CUSTOMER";

/** Default status assigned when a user is created. */
export const DEFAULT_USER_STATUS: UserStatus = "ACTIVE";