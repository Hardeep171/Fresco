import type { ErrorRequestHandler } from "express";

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

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (isMongoDuplicateKeyError(error)) {
    const field = Object.keys(error.keyValue ?? {})[0];
    const message = field ? `${field} already exists.` : "A record with this value already exists.";
    const details: ApiErrorDetail[] = field ? [{ field, message }] : [];

    return new ApiError(409, message, details);
  }

  return new ApiError(500, "Internal server error.");
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
