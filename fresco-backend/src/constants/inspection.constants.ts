/**
 * Inspection-related constants shared across the application.
 */

/** Permitted lifecycle statuses for an order inspection. */
export const INSPECTION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

/** Union of all permitted inspection statuses. */
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

/** Permitted garment item condition types for an order inspection. */
export const ITEM_CONDITIONS = [
  "NORMAL",
  "STAINED",
  "DAMAGED",
  "TORN",
  "COLOR_BLEED_RISK",
] as const;

/** Union of all permitted item conditions. */
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

/** Default status assigned to a newly created inspection. */
export const DEFAULT_INSPECTION_STATUS: InspectionStatus = "DRAFT";

/** Default active status assigned to new inspections. */
export const DEFAULT_INSPECTION_ACTIVE_STATUS = true;

/** Default item condition assigned to inspected items. */
export const DEFAULT_ITEM_CONDITION: ItemCondition = "NORMAL";

/** Maximum length permitted for inspection overall notes. */
export const INSPECTION_NOTES_MAX_LENGTH = 500;

/** Maximum length permitted for item damage notes. */
export const INSPECTION_DAMAGE_NOTES_MAX_LENGTH = 500;

/** Maximum length permitted for inspection financial adjustment reasons. */
export const INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH = 500;
