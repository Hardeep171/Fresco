import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/** Authentication controller handling HTTP requests for user authentication. */
export const authController = {
  /** Register a new user. */
  register: asyncHandler(async (req: Request, res: Response) => {
    // Register user
    const registerResult = await authService.register(req.body);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "User registered successfully",
      registerResult,
    );
  }),

  /** Authenticate user with email and password. */
  login: asyncHandler(async (req: Request, res: Response) => {
    // Login user
    const { email, password } = req.body;
    const loginResult = await authService.login(email, password);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Login successful",
      loginResult,
    );
  }),

  /** Refresh access token using refresh token. */
  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    // Refresh access token
    const { refreshToken } = req.body;
    const refreshResult = await authService.refreshToken(refreshToken);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Token refreshed successfully",
      refreshResult,
    );
  }),

  /** Logout user and clear session. */
  logout: asyncHandler(async (req: Request, res: Response) => {
    // Logout user
    const userId = req.user?.userId || req.body.userId;

    if (!userId) {
      throw new Error("User id is required");
    }

    const logoutResult = await authService.logout(userId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Logged out successfully",
      logoutResult,
    );
  }),
};
