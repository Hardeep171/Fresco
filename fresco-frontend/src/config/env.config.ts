/**
 * Environment configuration for FRESCO mobile application.
 * Reads environment variables from Expo config or process.env with fallbacks.
 */

const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  // Default to localhost backend
  return "http://localhost:5000/api/v1";
};

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || "development",
  IS_PRODUCTION: process.env.EXPO_PUBLIC_APP_ENV === "production",
  IS_DEVELOPMENT: (process.env.EXPO_PUBLIC_APP_ENV || "development") === "development",
  TIMEOUT_MS: 15000,
} as const;
