import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError, type ApiErrorDetail } from "../utils/api-error.js";

export interface MongoServerError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
  keyPattern?: Record<string, unknown>;
}

export const isMongoDuplicateKeyError = (error: unknown): error is MongoServerError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as MongoServerError).code === 11_000
  );
};

export const extractDuplicateField = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null) {
    const mongoErr = error as MongoServerError;
    if (mongoErr.keyValue && typeof mongoErr.keyValue === "object") {
      const keys = Object.keys(mongoErr.keyValue);
      if (keys.length > 0) return keys[0];
    }
    if (mongoErr.keyPattern && typeof mongoErr.keyPattern === "object") {
      const keys = Object.keys(mongoErr.keyPattern);
      if (keys.length > 0) return keys[0];
    }
    if (typeof mongoErr.message === "string") {
      const match = mongoErr.message.match(/index:\s+([a-zA-Z0-9_]+)_\d+/);
      if (match && match[1]) return match[1];
      const dupMatch = mongoErr.message.match(/dup key:\s*\{\s*([a-zA-Z0-9_]+):/);
      if (dupMatch && dupMatch[1]) return dupMatch[1];
    }
  }
  return undefined;
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

  if (error instanceof Error && error.name === "CastError") {
    return new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID format.");
  }

  if (isMongoDuplicateKeyError(error)) {
    const field = extractDuplicateField(error);
    let message = "A record with this value already exists.";
    let details: ApiErrorDetail[] = [];

    if (field === "email") {
      message = "An account with this email already exists.";
      details = [{ field: "email", message }];
    } else if (field === "phone") {
      message = "An account with this phone number already exists.";
      details = [{ field: "phone", message }];
    } else if (field) {
      message = `${field} already exists.`;
      details = [{ field, message }];
    }

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
