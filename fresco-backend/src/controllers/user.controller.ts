import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { userService } from "../services/user.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

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
};
