import { z } from "zod";

/**
 * Reusable Zod validation schema for updating user profile.
 * Requires at least one updatable field (firstName, lastName, or phone).
 */
export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, { error: "First name must be at least 2 characters long." })
      .max(50, { error: "First name cannot exceed 50 characters." })
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, { error: "Last name must be at least 2 characters long." })
      .max(50, { error: "Last name cannot exceed 50 characters." })
      .optional(),

    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, { error: "Phone number must be a valid 10-digit mobile number." })
      .optional(),
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.phone !== undefined,
    {
      error: "At least one field (firstName, lastName, or phone) must be provided.",
    },
  );

/** Strongly typed interface inferred from `updateProfileSchema`. */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Reusable Zod validation schema for changing password.
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current password is required." })
    .min(8, { error: "Current password must be at least 8 characters long." }),

  newPassword: z
    .string({ error: "New password is required." })
    .min(8, { error: "New password must be at least 8 characters long." }),
});

/** Strongly typed interface inferred from `changePasswordSchema`. */
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Reusable Zod validation schema for forgot password request.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "Email address is required." })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address format." }),
});

/** Strongly typed interface inferred from `forgotPasswordSchema`. */
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reusable Zod validation schema for reset password request.
 */
export const resetPasswordSchema = z.object({
  token: z
    .string({ error: "Password reset token is required." })
    .trim()
    .min(1, { error: "Password reset token is required." }),

  newPassword: z
    .string({ error: "New password is required." })
    .min(8, { error: "New password must be at least 8 characters long." }),
});

/** Strongly typed interface inferred from `resetPasswordSchema`. */
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;


