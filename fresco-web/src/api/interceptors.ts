import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config/api.config";
import { normalizeApiError } from "./error";
import { storageService } from "../services/storage.service";
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

// Track registered interceptor IDs for idempotency
let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;
let boundClient: AxiosInstance | null = null;

export function setAuthCallbacks(callbacks: AuthCallbacks): void {
  registeredAuthCallbacks = { ...registeredAuthCallbacks, ...callbacks };
}

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
 * Public authentication and utility paths that should NEVER send an Authorization header
 * and should NEVER trigger a 401 refresh attempt.
 */
export const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
  "/users/forgot-password",
  "/users/reset-password",
  "/users/verify-email",
];

export function isPublicAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

export function shouldBypassRefresh(url?: string): boolean {
  return isPublicAuthEndpoint(url);
}

/**
 * Sets up request and response interceptors on the specified Axios client.
 * Idempotent: ejects any existing interceptors registered by this module before adding new ones.
 */
export function setupInterceptors(
  client?: AxiosInstance,
  callbacks?: AuthCallbacks
): () => void {
  if (callbacks) {
    setAuthCallbacks(callbacks);
  }

  const targetClient = client || boundClient;
  if (!targetClient) {
    return () => {};
  }
  boundClient = targetClient;

  // Eject previous interceptors if already registered to prevent duplicates
  if (requestInterceptorId !== null) {
    targetClient.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
  }
  if (responseInterceptorId !== null) {
    targetClient.interceptors.response.eject(responseInterceptorId);
    responseInterceptorId = null;
  }

  // 1. REQUEST INTERCEPTOR: Inject Bearer Token for protected endpoints
  requestInterceptorId = targetClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 1. If public auth endpoint, NEVER attach Authorization header
      if (isPublicAuthEndpoint(config.url)) {
        if (config.headers) {
          delete (config.headers as any).Authorization;
          delete (config.headers as any).authorization;
        }
        return config;
      }

      // 2. Read access token from storage
      const accessToken = storageService.getAccessToken();

      if (accessToken) {
        if (!config.headers) {
          config.headers = new axios.AxiosHeaders();
        }
        if (typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${accessToken}`);
        } else {
          (config.headers as any).Authorization = `Bearer ${accessToken}`;
        }
      }

      return config;
    },
    (error: unknown) => {
      return Promise.reject(normalizeApiError(error));
    }
  );

  // 2. RESPONSE INTERCEPTOR: Handle 401 Unauthorized with single-flight mutex refresh
  responseInterceptorId = targetClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

      if (!originalRequest) {
        return Promise.reject(normalizeApiError(error));
      }

      const statusCode = error.response?.status;
      const isUnauthorized = statusCode === 401;
      const isBypassUrl = shouldBypassRefresh(originalRequest.url);
      const isAlreadyRetried = Boolean(originalRequest._retry);

      // If not 401, or is an unauthenticated bypass URL, or was already retried, do not refresh
      if (!isUnauthorized || isBypassUrl || isAlreadyRetried) {
        return Promise.reject(normalizeApiError(error));
      }

      // If there is no refresh token in storage, user is unauthenticated - do not attempt refresh
      const storedRefreshToken = storageService.getRefreshToken();
      if (!storedRefreshToken) {
        return Promise.reject(normalizeApiError(error));
      }

      // If a refresh is already in flight, queue this request to await new token
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            if (!originalRequest.headers) {
              originalRequest.headers = new axios.AxiosHeaders();
            }
            if (typeof originalRequest.headers.set === "function") {
              originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
            } else {
              (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;
            }
            originalRequest._retry = true;
            return targetClient(originalRequest);
          })
          .catch((queuedError: NormalizedApiError) => {
            return Promise.reject(queuedError);
          });
      }

      // First 401: Acquire mutex and execute single-flight token refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<RefreshTokenResponseData>>(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        // Persist new tokens to storage
        storageService.saveTokens(newAccessToken, newRefreshToken);

        // Notify Redux listener
        registeredAuthCallbacks.onTokenRefreshed?.({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        // Flush queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        if (!originalRequest.headers) {
          originalRequest.headers = new axios.AxiosHeaders();
        }
        if (typeof originalRequest.headers.set === "function") {
          originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        } else {
          (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;
        }

        return targetClient(originalRequest);
      } catch (refreshError: unknown) {
        const normalizedRefreshError = normalizeApiError(refreshError);

        // Refresh failed (e.g. refresh token expired or revoked)
        storageService.clearTokens();
        registeredAuthCallbacks.onAuthFailure?.();
        processQueue(normalizedRefreshError, null);

        return Promise.reject(normalizedRefreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return () => {
    if (requestInterceptorId !== null) {
      targetClient.interceptors.request.eject(requestInterceptorId);
      requestInterceptorId = null;
    }
    if (responseInterceptorId !== null) {
      targetClient.interceptors.response.eject(responseInterceptorId);
      responseInterceptorId = null;
    }
  };
}
