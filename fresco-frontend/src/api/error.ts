import axios, { AxiosError } from "axios";
import {
  ApiErrorResponse,
  ApiErrorDetail,
  ErrorKind,
  NormalizedApiError,
} from "../types/api.types";

/**
 * Transforms any unknown caught error (Axios errors, network errors, timeouts, or exceptions)
 * into a predictable, strongly typed NormalizedApiError structure.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
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

    const rawErrors: ApiErrorDetail[] = Array.isArray(responseData?.errors)
      ? responseData.errors
      : [];

    // Map field errors from backend Zod validation output
    const fieldErrors: Record<string, string> = {};
    rawErrors.forEach((err) => {
      if (err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    });

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
