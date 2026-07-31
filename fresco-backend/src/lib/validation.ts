import { z } from "zod";

import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  OBJECT_ID_REGEX,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_REGEX,
  POSTAL_CODE_MAX_LENGTH,
  POSTAL_CODE_MIN_LENGTH,
  POSTAL_CODE_REGEX,
} from "../constants/validation.constants.js";

/**
 * Reusable Zod validation schema for MongoDB ObjectId parameters/fields.
 */
export const objectIdSchema = z
  .string({ error: "ID is required." })
  .trim()
  .regex(OBJECT_ID_REGEX, { error: "Invalid ID format." });

/**
 * Reusable Zod validation schema for email address fields.
 */
export const emailSchema = z
  .string({ error: "Email address is required." })
  .trim()
  .toLowerCase()
  .email({ error: "Invalid email address format." });

/**
 * Reusable Zod validation schema for phone number fields.
 * Validates string format, character set, and length limits.
 */
export const phoneSchema = z
  .string({ error: "Phone number is required." })
  .trim()
  .regex(PHONE_REGEX, { error: "Invalid phone number." })
  .min(PHONE_MIN_LENGTH, {
    error: `Phone number must be at least ${PHONE_MIN_LENGTH} characters long.`,
  })
  .max(PHONE_MAX_LENGTH, {
    error: `Phone number cannot exceed ${PHONE_MAX_LENGTH} characters.`,
  });

/**
 * Reusable Zod validation schema for postal code fields.
 * Validates string format, character set, and length limits.
 */
export const postalCodeSchema = z
  .string({ error: "Postal code is required." })
  .trim()
  .regex(POSTAL_CODE_REGEX, { error: "Invalid postal code." })
  .min(POSTAL_CODE_MIN_LENGTH, {
    error: `Postal code must be at least ${POSTAL_CODE_MIN_LENGTH} characters long.`,
  })
  .max(POSTAL_CODE_MAX_LENGTH, {
    error: `Postal code cannot exceed ${POSTAL_CODE_MAX_LENGTH} characters.`,
  });

/**
 * Factory function creating a reusable Zod validation schema for name fields with configurable field names and limits.
 *
 * @param fieldName - Human-readable field label (default: "Name").
 * @param minLength - Minimum character length (default: NAME_MIN_LENGTH).
 * @param maxLength - Maximum character length (default: NAME_MAX_LENGTH).
 */
export const createNameSchema = (
  fieldName = "Name",
  minLength = NAME_MIN_LENGTH,
  maxLength = NAME_MAX_LENGTH,
) =>
  z
    .string({ error: `${fieldName} is required.` })
    .trim()
    .min(minLength, {
      error: `${fieldName} must be at least ${minLength} characters long.`,
    })
    .max(maxLength, {
      error: `${fieldName} cannot exceed ${maxLength} characters.`,
    });

/**
 * Default reusable Zod validation schema for general name fields.
 */
export const nameSchema = createNameSchema();
