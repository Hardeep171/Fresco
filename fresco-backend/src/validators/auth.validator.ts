import { z } from "zod";

/**
 * Reusable Zod validation schema for email address field.
 */
export const emailSchema = z
  .string({ error: "Email address is required." })
  .trim()
  .toLowerCase()
  .email({ error: "Invalid email address format." });

/**
 * Reusable Zod validation schema for password field.
 */
export const passwordSchema = z
  .string({ error: "Password is required." })
  .trim()
  .min(8, { error: "Password must be at least 8 characters long." })
  .max(128, { error: "Password cannot exceed 128 characters." });

/**
 * Reusable Zod validation schema for user registration requests.
 * Validates, trims, and normalizes input data prior to controller/service processing.
 */
export const registerSchema = z.object({
  firstName: z
    .string({ error: "First name is required." })
    .trim()
    .min(2, { error: "First name must be at least 2 characters long." })
    .max(50, { error: "First name cannot exceed 50 characters." }),

  lastName: z
    .string({ error: "Last name is required." })
    .trim()
    .min(2, { error: "Last name must be at least 2 characters long." })
    .max(50, { error: "Last name cannot exceed 50 characters." }),

  email: emailSchema,

  password: passwordSchema,

  phone: z
    .string({ error: "Phone number is required." })
    .trim()
    .min(10, { error: "Phone number must be at least 10 digits long." })
    .max(15, { error: "Phone number cannot exceed 15 digits." })
    .regex(/^\+?[1-9]\d{7,14}$|^\d{10,15}$/, {
      error: "Phone number must be a valid phone number.",
    }),
});

/**
 * Reusable Zod validation schema for user login requests.
 * Uses the exact same email and password validation rules as registerSchema.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Reusable Zod validation schema for token refresh requests.
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required." })
    .trim()
    .min(1, { error: "Refresh token is required." }),
});

/**
 * Strongly typed TypeScript interface inferred from `registerSchema`.
 */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Strongly typed TypeScript interface inferred from `loginSchema`.
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Strongly typed TypeScript interface inferred from `refreshTokenSchema`.
 */
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
