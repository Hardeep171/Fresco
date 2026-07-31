import { z } from "zod";

import { ADDRESS_LABELS } from "../constants/address.constants.js";
import {
  ADDRESS_LINE_MAX_LENGTH,
  ADDRESS_LINE_MIN_LENGTH,
  CITY_MAX_LENGTH,
  CITY_MIN_LENGTH,
  COUNTRY_MAX_LENGTH,
  COUNTRY_MIN_LENGTH,
  FULL_NAME_MAX_LENGTH,
  FULL_NAME_MIN_LENGTH,
  LATITUDE_MAX,
  LATITUDE_MIN,
  LONGITUDE_MAX,
  LONGITUDE_MIN,
  OBJECT_ID_REGEX,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_REGEX,
  POSTAL_CODE_MAX_LENGTH,
  POSTAL_CODE_MIN_LENGTH,
  POSTAL_CODE_REGEX,
  STATE_MAX_LENGTH,
  STATE_MIN_LENGTH,
} from "../constants/validation.constants.js";

/**
 * Reusable Zod validation schema for creating a new address.
 */
export const createAddressSchema = z.object({
  label: z.enum(ADDRESS_LABELS, {
    error: "Label must be one of: HOME, OFFICE, OTHER.",
  }),

  fullName: z
    .string({ error: "Full name is required." })
    .trim()
    .min(FULL_NAME_MIN_LENGTH, { error: "Full name must be at least 2 characters long." })
    .max(FULL_NAME_MAX_LENGTH, { error: "Full name cannot exceed 100 characters." }),

  phone: z
    .string({ error: "Phone number is required." })
    .trim()
    .regex(PHONE_REGEX, { error: "Invalid phone number." })
    .min(PHONE_MIN_LENGTH, { error: "Phone number must be at least 10 characters long." })
    .max(PHONE_MAX_LENGTH, { error: "Phone number cannot exceed 15 characters." }),

  addressLine1: z
    .string({ error: "Address line 1 is required." })
    .trim()
    .min(ADDRESS_LINE_MIN_LENGTH, { error: "Address line 1 must be at least 5 characters long." })
    .max(ADDRESS_LINE_MAX_LENGTH, { error: "Address line 1 cannot exceed 200 characters." }),

  addressLine2: z.string().trim().optional(),

  landmark: z.string().trim().optional(),

  city: z
    .string({ error: "City is required." })
    .trim()
    .min(CITY_MIN_LENGTH, { error: "City must be at least 2 characters long." })
    .max(CITY_MAX_LENGTH, { error: "City cannot exceed 100 characters." }),

  state: z
    .string({ error: "State is required." })
    .trim()
    .min(STATE_MIN_LENGTH, { error: "State must be at least 2 characters long." })
    .max(STATE_MAX_LENGTH, { error: "State cannot exceed 100 characters." }),

  postalCode: z
    .string({ error: "Postal code is required." })
    .trim()
    .regex(POSTAL_CODE_REGEX, { error: "Invalid postal code." })
    .min(POSTAL_CODE_MIN_LENGTH, { error: "Postal code must be at least 3 characters long." })
    .max(POSTAL_CODE_MAX_LENGTH, { error: "Postal code cannot exceed 15 characters." }),

  country: z
    .string()
    .trim()
    .min(COUNTRY_MIN_LENGTH, { error: "Country must be at least 2 characters long." })
    .max(COUNTRY_MAX_LENGTH, { error: "Country cannot exceed 100 characters." })
    .optional(),

  latitude: z
    .number({ error: "Latitude must be a number." })
    .min(LATITUDE_MIN, { error: "Latitude must be between -90 and 90." })
    .max(LATITUDE_MAX, { error: "Latitude must be between -90 and 90." })
    .optional(),

  longitude: z
    .number({ error: "Longitude must be a number." })
    .min(LONGITUDE_MIN, { error: "Longitude must be between -180 and 180." })
    .max(LONGITUDE_MAX, { error: "Longitude must be between -180 and 180." })
    .optional(),

  isDefault: z.boolean().optional(),
});

/**
 * Reusable Zod validation schema for updating an existing address.
 * All fields are optional and reuse the validation logic from `createAddressSchema`.
 */
export const updateAddressSchema = createAddressSchema.partial();

/**
 * Reusable Zod validation schema for address ID parameter.
 * Validates that `id` is a non-empty string.
 */
export const addressIdParamSchema = z.object({
  id: z
    .string({ error: "Address ID is required." })
    .trim()
    .regex(OBJECT_ID_REGEX, { error: "Invalid Address ID format." }),
});

/** Strongly typed interface inferred from `createAddressSchema`. */
export type CreateAddressInput = z.infer<typeof createAddressSchema>;

/** Strongly typed interface inferred from `updateAddressSchema`. */
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

/** Strongly typed interface inferred from `addressIdParamSchema`. */
export type AddressIdParamInput = z.infer<typeof addressIdParamSchema>;
