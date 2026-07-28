import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { userService } from "../services/user.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  changePasswordSchema,
  updateProfileSchema,
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
};
