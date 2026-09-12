/**
 * User-related constants mirroring FRESCO backend contracts.
 */

export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
  "DELIVERY_PARTNER",
  "CUSTOMER",
] as const;

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const DEFAULT_USER_ROLE: UserRole = "CUSTOMER";
export const DEFAULT_USER_STATUS: UserStatus = "ACTIVE";
