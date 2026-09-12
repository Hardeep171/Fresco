/**
 * FRESCO Web Platform - API Configuration
 * Resolves API Base URL safely across Vite browser runtime and Node/SSR test environments.
 */
export const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) ||
  "http://localhost:5000/api/v1";
