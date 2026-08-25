import { Ionicons } from "@expo/vector-icons";

/**
 * Inspection-related constants matching fresco-backend contracts.
 */

/** Permitted lifecycle statuses for an order inspection. */
export const INSPECTION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

/** Permitted garment item condition types for an order inspection. */
export const ITEM_CONDITIONS = [
  "NORMAL",
  "STAINED",
  "DAMAGED",
  "TORN",
  "COLOR_BLEED_RISK",
] as const;

export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

/** Default status assigned to a newly created inspection. */
export const DEFAULT_INSPECTION_STATUS: InspectionStatus = "DRAFT";

/** Default item condition assigned to inspected items. */
export const DEFAULT_ITEM_CONDITION: ItemCondition = "NORMAL";

/** Maximum length permitted for inspection overall notes. */
export const INSPECTION_NOTES_MAX_LENGTH = 500;

/** Maximum length permitted for item damage notes. */
export const INSPECTION_DAMAGE_NOTES_MAX_LENGTH = 500;

/** Maximum length permitted for inspection financial adjustment reasons. */
export const INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH = 500;

/**
 * Human-friendly labels for inspection lifecycle statuses.
 */
export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  DRAFT: "Draft (In Progress)",
  SUBMITTED: "Inspection Completed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

/**
 * Human-friendly labels for garment item conditions.
 */
export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  NORMAL: "Normal (Good Condition)",
  STAINED: "Pre-existing Stain",
  DAMAGED: "Pre-existing Damage",
  TORN: "Tear / Puncture",
  COLOR_BLEED_RISK: "Color Bleed Risk",
};

/**
 * Descriptive explanations for each garment condition.
 */
export const ITEM_CONDITION_DESCRIPTIONS: Record<ItemCondition, string> = {
  NORMAL: "No visible defects, stains, or fabric tears detected.",
  STAINED: "Pre-existing stain detected on fabric before processing.",
  DAMAGED: "Pre-existing physical damage, loose seams, or hardware defect.",
  TORN: "Visible fabric tear, fraying, or hole detected.",
  COLOR_BLEED_RISK: "Fabric has unstable dye prone to bleeding during wash.",
};

/**
 * Semantic icon mapping for garment item conditions.
 */
export const ITEM_CONDITION_ICONS: Record<
  ItemCondition,
  keyof typeof Ionicons.glyphMap
> = {
  NORMAL: "checkmark-circle",
  STAINED: "water",
  DAMAGED: "alert-circle",
  TORN: "cut",
  COLOR_BLEED_RISK: "color-palette",
};
