/**
 * Address-related constants mirroring FRESCO backend contracts.
 */

export const ADDRESS_LABELS = ["HOME", "OFFICE", "OTHER"] as const;

export type AddressLabel = (typeof ADDRESS_LABELS)[number];

export const DEFAULT_COUNTRY = "India";
