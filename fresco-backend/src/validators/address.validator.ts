import { z } from "zod";

import { ADDRESS_LABELS } from "../constants/address.constants.js";

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
    .min(2, { error: "Full name must be at least 2 characters long." })
    .max(100, { error: "Full name cannot exceed 100 characters." }),

  phone: z
    .string({ error: "Phone number is required." })
    .trim()
    .regex(/^[0-9+\-\s()]+$/, { error: "Invalid phone number." })
    .min(10, { error: "Phone number must be at least 10 characters long." })
    .max(15, { error: "Phone number cannot exceed 15 characters." }),

  addressLine1: z
    .string({ error: "Address line 1 is required." })
    .trim()
    .min(5, { error: "Address line 1 must be at least 5 characters long." })
    .max(200, { error: "Address line 1 cannot exceed 200 characters." }),

  addressLine2: z.string().trim().optional(),

  landmark: z.string().trim().optional(),

  city: z
    .string({ error: "City is required." })
    .trim()
    .min(2, { error: "City must be at least 2 characters long." })
    .max(100, { error: "City cannot exceed 100 characters." }),

  state: z
    .string({ error: "State is required." })
    .trim()
    .min(2, { error: "State must be at least 2 characters long." })
    .max(100, { error: "State cannot exceed 100 characters." }),

  postalCode: z
    .string({ error: "Postal code is required." })
    .trim()
    .regex(/^[A-Za-z0-9\s-]+$/, { error: "Invalid postal code." })
    .min(3, { error: "Postal code must be at least 3 characters long." })
    .max(15, { error: "Postal code cannot exceed 15 characters." }),

  country: z
    .string()
    .trim()
    .min(2, { error: "Country must be at least 2 characters long." })
    .max(100, { error: "Country cannot exceed 100 characters." })
    .optional(),

  latitude: z
    .number({ error: "Latitude must be a number." })
    .min(-90, { error: "Latitude must be between -90 and 90." })
    .max(90, { error: "Latitude must be between -90 and 90." })
    .optional(),

  longitude: z
    .number({ error: "Longitude must be a number." })
    .min(-180, { error: "Longitude must be between -180 and 180." })
    .max(180, { error: "Longitude must be between -180 and 180." })
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
    .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid Address ID format." }),
});

/** Strongly typed interface inferred from `createAddressSchema`. */
export type CreateAddressInput = z.infer<typeof createAddressSchema>;

/** Strongly typed interface inferred from `updateAddressSchema`. */
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

/** Strongly typed interface inferred from `addressIdParamSchema`. */
export type AddressIdParamInput = z.infer<typeof addressIdParamSchema>;
