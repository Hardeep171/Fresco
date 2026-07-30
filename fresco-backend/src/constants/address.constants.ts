/**
 * Address-related constants shared across the application.
 */

/** Permitted labels for an Address. */
export const ADDRESS_LABELS = ["HOME", "OFFICE", "OTHER"] as const;

/** Union of all permitted address labels. */
export type AddressLabel = (typeof ADDRESS_LABELS)[number];

/** Default country assigned when an address is created without an explicit country. */
export const DEFAULT_COUNTRY = "India";
