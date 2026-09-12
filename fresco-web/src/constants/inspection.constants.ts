/**
 * Inspection-related constants matching fresco-backend contracts.
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

export const DEFAULT_INSPECTION_STATUS: InspectionStatus = "DRAFT";
export const DEFAULT_ITEM_CONDITION: ItemCondition = "NORMAL";

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  DRAFT: "Draft (In Progress)",
  SUBMITTED: "Inspection Completed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  NORMAL: "Normal (Good Condition)",
  STAINED: "Pre-existing Stain",
  DAMAGED: "Damaged Fabric",
  TORN: "Torn / Ripped",
  COLOR_BLEED_RISK: "Color Bleed Risk",
};
