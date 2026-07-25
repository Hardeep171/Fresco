import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

/** Authentication controller handling HTTP requests for user authentication. */
export const authController = {
  /** Register a new user. */
  register: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const registerResult = await authService.register(validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "User registered successfully",
      registerResult,
    );
  }),

  /** Authenticate user with email and password. */
  login: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const loginResult = await authService.login(validatedData.email, validatedData.password);

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
