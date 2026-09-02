import axios, { AxiosError } from "axios";
import {
  ApiErrorResponse,
  ApiErrorDetail,
  ErrorKind,
  NormalizedApiError,
} from "../types/api.types";

/**
 * Type guard to check if an object is already a NormalizedApiError.
 */
export function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    "statusCode" in error &&
    "message" in error &&
    "rawErrors" in error &&
    "isNetworkError" in error &&
    "isTimeout" in error &&
    "isAuthError" in error
  );
}

/**
 * Transforms any unknown caught error (Axios errors, network errors, timeouts, or exceptions)
 * into a predictable, strongly typed NormalizedApiError structure.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  // If error is already normalized, return as-is
  if (isNormalizedApiError(error)) {
    return error;
  }

  if (axios.isAxiosError(error) || (typeof error === "object" && error !== null && (error as any).isAxiosError)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // 1. Timeout Error
    if (axiosError.code === "ECONNABORTED" || (axiosError.message && axiosError.message.toLowerCase().includes("timeout"))) {
      return {
        kind: "TIMEOUT",
        statusCode: 408,
        message: "Request timed out. Please check your internet connection and try again.",
        rawErrors: [],
        isNetworkError: true,
        isTimeout: true,
        isAuthError: false,
      };
    }

    // 2. Network Disconnection Error (No response received)
    if (!axiosError.response) {
      return {
        kind: "NETWORK_ERROR",
        statusCode: 0,
        message: "Unable to connect to FRESCO server. Please check your internet connection.",
        rawErrors: [],
        isNetworkError: true,
        isTimeout: false,
        isAuthError: false,
      };
    }

    // 3. HTTP Error Response with status code
    const statusCode = axiosError.response.status;
    const responseData = axiosError.response.data;

    let rawErrors: ApiErrorDetail[] = [];
    const fieldErrors: Record<string, string> = {};

    if (Array.isArray(responseData?.errors)) {
      rawErrors = responseData.errors;
      rawErrors.forEach((err) => {
        const fieldName = err.field || (Array.isArray((err as any).path) ? (err as any).path.join(".") : (err as any).path) || (err as any).param;
        if (fieldName && err.message) {
          fieldErrors[fieldName] = err.message;
        }
      });
    } else if (responseData?.errors && typeof responseData.errors === "object") {
      Object.entries(responseData.errors).forEach(([field, msg]) => {
        if (typeof msg === "string") {
          fieldErrors[field] = msg;
          rawErrors.push({ field, message: msg });
        }
      });
    }

    // Semantic error classification
    let kind: ErrorKind = "UNKNOWN";
    let defaultFallbackMessage = "An unexpected error occurred.";

    if (statusCode === 400) {
      kind = "VALIDATION";
      defaultFallbackMessage = "Invalid input data. Please check the entered fields.";
    } else if (statusCode === 401) {
      kind = "UNAUTHORIZED";
      defaultFallbackMessage = "Session expired or invalid credentials.";
    } else if (statusCode === 403) {
      kind = "FORBIDDEN";
      defaultFallbackMessage = "You do not have permission to access this resource.";
    } else if (statusCode === 404) {
      kind = "NOT_FOUND";
      defaultFallbackMessage = "The requested resource was not found.";
    } else if (statusCode === 409) {
      kind = "CONFLICT";
      defaultFallbackMessage = "A conflicting record already exists.";
    } else if (statusCode >= 500) {
      kind = "SERVER_ERROR";
      defaultFallbackMessage = "Server encountered an unexpected error. Please try again later.";
    }

    const message = responseData?.message || defaultFallbackMessage;

    return {
      kind,
      statusCode,
      message,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      rawErrors,
      isNetworkError: false,
      isTimeout: false,
      isAuthError: statusCode === 401,
    };
  }

  // 4. Standard JavaScript Error
  if (error instanceof Error) {
    return {
      kind: "UNKNOWN",
      statusCode: 0,
      message: error.message || "An unexpected application error occurred.",
      rawErrors: [],
      isNetworkError: false,
      isTimeout: false,
      isAuthError: false,
    };
  }

  // 5. Unhandled non-Error throwable
  return {
    kind: "UNKNOWN",
    statusCode: 0,
    message: "An unexpected error occurred. Please try again.",
    rawErrors: [],
    isNetworkError: false,
    isTimeout: false,
    isAuthError: false,
  };
}
