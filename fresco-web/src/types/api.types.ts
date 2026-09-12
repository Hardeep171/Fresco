export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiErrorDetail[] | string[];
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
}

export type ErrorKind =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

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

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface AuthCallbacks {
  onTokenRefreshed?: (tokens: RefreshTokenResponseData) => void;
  onAuthFailure?: () => void;
}
