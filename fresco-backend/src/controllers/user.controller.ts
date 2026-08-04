import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { userService } from "../services/user.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from "../validators/user.validator.js";

/** User controller handling HTTP requests for User profile and management. */
export const userController = {
  /** Fetch current authenticated user's profile. */
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"); 
    }

    const user = await userService.getCurrentUser(userId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "User profile fetched successfully",
      { user },
    );
  }),

  /** Update current authenticated user's profile. */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // Validate request body
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await userService.updateProfile(userId, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Profile updated successfully",
      { user },
    );
  }),

  /** Change password for current authenticated user. */
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // Validate request body
    const validatedData = changePasswordSchema.parse(req.body);

    await userService.changePassword(
      userId,
      validatedData.currentPassword,
      validatedData.newPassword,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Password changed successfully. Please log in again.",
      undefined,
    );
  }),

  /** Handle forgot password request. */
  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(req.body);

    await userService.forgotPassword(validatedData.email);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "If an account exists for this email, a password reset link has been sent.",
      undefined,
    );
  }),

  /** Handle reset password request. */
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = resetPasswordSchema.parse(req.body);

    await userService.resetPassword(
      validatedData.token,
      validatedData.newPassword,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Password reset successfully. Please log in again.",
      undefined,
    );
  }),

  /** Handle email verification request. */
  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = verifyEmailSchema.parse(req.body);

    await userService.verifyEmail(validatedData.token);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Email verified successfully.",
      undefined,
    );
  }),
};

