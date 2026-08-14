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

/** Administrative roles permitted to execute management actions. */
export const ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
];

/** Permitted lifecycle statuses for a FRESCO user. */
export const USER_STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;

/** Union of all permitted user statuses. */
export type UserStatus = (typeof USER_STATUSES)[number];

/** Default role assigned when a user is created without an explicit role. */
export const DEFAULT_USER_ROLE: UserRole = "CUSTOMER";

/** Default status assigned when a user is created. */
export const DEFAULT_USER_STATUS: UserStatus = "ACTIVE";

/** Expiry duration for password reset token in minutes. */
export const RESET_PASSWORD_TOKEN_EXPIRY_MINUTES = 15;

/** Expiry duration for email verification token in hours. */
export const EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24;