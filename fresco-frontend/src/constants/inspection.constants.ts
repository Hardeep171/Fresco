/**
 * Inspection-related constants mirroring FRESCO backend contracts.
 */

export const INSPECTION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export const ITEM_CONDITIONS = [
  "NORMAL",
  "STAINED",
  "DAMAGED",
  "TORN",
  "COLOR_BLEED_RISK",
] as const;

export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  NORMAL: "Normal / Clean",
  STAINED: "Stained Fabric",
  DAMAGED: "Damaged / Pre-existing Wear",
  TORN: "Torn Seam / Fabric",
  COLOR_BLEED_RISK: "Color Bleed Risk",
};
