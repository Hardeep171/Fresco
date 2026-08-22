/**
 * Standard API response envelopes, error structures, and networking interfaces
 * strictly matching FRESCO backend contracts.
 */

/**
 * Standard backend success envelope.
 */
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * Detailed validation/field error object returned from backend.
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/**
 * Standard backend error envelope.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
}

/**
 * Semantic classifications for frontend errors.
 */
export type ErrorKind =
  | "VALIDATION"    // HTTP 400 with Zod/field errors
  | "UNAUTHORIZED"  // HTTP 401 JWT expired or invalid
  | "FORBIDDEN"     // HTTP 403 Role / IDOR permission denied
  | "NOT_FOUND"     // HTTP 404 Entity does not exist
  | "CONFLICT"      // HTTP 409 Duplicate key / conflict
  | "SERVER_ERROR"  // HTTP 500+ Internal server error
  | "NETWORK_ERROR" // No internet connection / unreachable host
  | "TIMEOUT"       // Request timed out
  | "UNKNOWN";      // Other unhandled errors

/**
 * Normalized application-level error structure consumed by Redux thunks and UI components.
 */
export interface NormalizedApiError {
  kind: ErrorKind;
  statusCode: number;
  message: string;
  fieldErrors?: Record<string, string>;
  rawErrors: ApiErrorDetail[];
  isNetworkError: boolean;
  isTimeout: boolean;
  isAuthError: boolean;
}

/**
 * Data payload returned by POST /api/v1/auth/refresh-token.
 */
export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Callbacks for coordinating session lifecycle events between Axios and Redux/Navigation.
 */
export interface AuthCallbacks {
  onTokenRefreshed?: (tokens: RefreshTokenResponseData) => void;
  onAuthFailure?: () => void;
}
