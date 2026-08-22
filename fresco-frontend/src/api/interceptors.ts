import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { apiClient } from "./client";
import { normalizeApiError } from "./error";
import { secureStorage } from "../services/secureStorage.service";
import { ENV } from "../config/env.config";
import {
  ApiResponse,
  AuthCallbacks,
  NormalizedApiError,
  RefreshTokenResponseData,
} from "../types/api.types";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: NormalizedApiError) => void;
}

// Mutex state tracking for single-flight token refresh
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];
let registeredAuthCallbacks: AuthCallbacks = {};

/**
 * Configure external lifecycle callbacks (e.g. Redux state updates or navigation).
 */
export function setAuthCallbacks(callbacks: AuthCallbacks): void {
  registeredAuthCallbacks = { ...registeredAuthCallbacks, ...callbacks };
}

/**
 * Flushes all queued requests with either the refreshed access token or rejection error.
 */
function processQueue(error: NormalizedApiError | null, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Endpoints that should NOT trigger automatic token refresh upon 401.
 */
const AUTH_BYPASS_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
  "/users/forgot-password",
  "/users/reset-password",
  "/users/verify-email",
];

function shouldBypassRefresh(url?: string): boolean {
  if (!url) return false;
  return AUTH_BYPASS_PATHS.some((path) => url.includes(path));
}

/**
 * Initializes request and response interceptors on the shared apiClient.
 * Returns a cleanup function to eject interceptors if needed (e.g. in tests).
 */
export function setupInterceptors(callbacks?: AuthCallbacks): () => void {
  if (callbacks) {
    setAuthCallbacks(callbacks);
  }

  // 1. REQUEST INTERCEPTOR: Inject Bearer Token
  const requestInterceptorId = apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const accessToken = await secureStorage.getAccessToken();

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: unknown) => {
      return Promise.reject(normalizeApiError(error));
    }
  );

  // 2. RESPONSE INTERCEPTOR: Handle Success, Errors, and 401 Refresh Mutex
  const responseInterceptorId = apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

      // If no config exists, normalize and reject
      if (!originalRequest) {
        return Promise.reject(normalizeApiError(error));
      }

      const statusCode = error.response?.status;
      const isUnauthorized = statusCode === 401;
      const isBypassUrl = shouldBypassRefresh(originalRequest.url);
      const isAlreadyRetried = Boolean(originalRequest._retry);

      // Handle non-401 errors or auth routes directly without token refresh
      if (!isUnauthorized || isBypassUrl || isAlreadyRetried) {
        return Promise.reject(normalizeApiError(error));
      }

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            originalRequest._retry = true;
            return apiClient(originalRequest);
          })
          .catch((queuedError: NormalizedApiError) => {
            return Promise.reject(queuedError);
          });
      }

      // Mark request as retried and lock mutex
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await secureStorage.getRefreshToken();

        if (!storedRefreshToken) {
          throw new Error("No refresh token available");
        }

        // Call backend refresh endpoint using an isolated Axios instance to avoid interceptor loops
        const refreshResponse = await axios.post<ApiResponse<RefreshTokenResponseData>>(
          `${ENV.API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          {
            timeout: ENV.TIMEOUT_MS,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        // Persist rotated tokens to secure storage
        await secureStorage.saveTokens(newAccessToken, newRefreshToken);

        // Notify Redux / session listeners
        registeredAuthCallbacks.onTokenRefreshed?.({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        // Resolve all waiting queued requests
        processQueue(null, newAccessToken);

        // Re-execute the original request with the new access token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        const normalizedRefreshError = normalizeApiError(refreshError);

        // Clear stored credentials on refresh rejection
        await secureStorage.clearTokens();

        // Notify auth failure for session logout
        registeredAuthCallbacks.onAuthFailure?.();

        // Reject all queued requests with the normalized error
        processQueue(normalizedRefreshError, null);

        return Promise.reject(normalizedRefreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return () => {
    apiClient.interceptors.request.eject(requestInterceptorId);
    apiClient.interceptors.response.eject(responseInterceptorId);
  };
}
