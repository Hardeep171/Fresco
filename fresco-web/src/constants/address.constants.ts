export const ADDRESS_TYPES = ["HOME", "WORK", "OTHER"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export const DEFAULT_COUNTRY = "India";
