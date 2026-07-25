import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError, type ApiErrorDetail } from "../utils/api-error.js";

interface MongoServerError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

const isMongoDuplicateKeyError = (error: unknown): error is MongoServerError => {
  return error instanceof Error && "code" in error && error.code === 11_000;
};

const isJwtError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")
  );
};

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    const details: ApiErrorDetail[] = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return new ApiError(StatusCodes.BAD_REQUEST, "Validation failed.", details);
  }

  if (isJwtError(error)) {
    return new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token.");
  }

  if (isMongoDuplicateKeyError(error)) {
    const field = Object.keys(error.keyValue ?? {})[0];
    const message = field ? `${field} already exists.` : "A record with this value already exists.";
    const details: ApiErrorDetail[] = field ? [{ field, message }] : [];

    return new ApiError(StatusCodes.CONFLICT, message, details);
  }

  return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error.");
};

export const errorMiddleware: ErrorRequestHandler = (error, request, response, _next) => {
  const apiError = toApiError(error);

  logger.error("Request failed", {
    method: request.method,
    path: request.originalUrl,
    statusCode: apiError.statusCode,
    error,
  });

  const message =
    apiError.statusCode >= 500 && env.nodeEnv === "production"
      ? "Internal server error."
      : apiError.message;

  response.status(apiError.statusCode).json({
    success: false,
    message,
    errors: apiError.errors,
  });
};
