import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { verifyAccessToken } from "../utils/jwt.js";

/** Authentication middleware verifying JWT access token in Authorization header. */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Read authorization header
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Authorization header is required.");
    }

    // Validate Bearer format
    if (!authorizationHeader.startsWith("Bearer ")) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Authorization header format must be Bearer <token>.",
      );
    }

    // Extract access token
    const accessToken = authorizationHeader.slice(7).trim();
    if (!accessToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Access token is required.");
    }

    // Verify access token
    const decodedToken = await verifyAccessToken(accessToken);

    // Attach user
    req.user = {
      userId: decodedToken.userId,
      role: decodedToken.role,
    };

    next();
  },
);

/** Role authorization middleware factory enforcing user role permissions. */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are not authorized to perform this action",
      );
    }

    next();
  };
};
