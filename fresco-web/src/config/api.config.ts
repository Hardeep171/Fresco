/**
 * FRESCO Web Platform - API Configuration
 *
 * In local development (browser), requests use the relative `/api/v1` path,
 * which Vite dev server proxies to http://localhost:5000 (defined in vite.config.ts).
 *
 * In production (Render deployment), requests target the deployed Render backend URL
 * configured via the `VITE_API_BASE_URL` environment variable (e.g. in Render Static Site dashboard).
 * If VITE_API_BASE_URL is omitted in production, it safely falls back to `/api/v1`.
 *
 * In Node test environments, requests default to the active local backend service.
 */

function resolveApiBaseUrl(): string {
  // 1. Check for explicit environment variable (Vite browser runtime or Node process)
  const envUrl =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    (typeof process !== "undefined" && process.env && process.env.VITE_API_BASE_URL) ||
    "";

  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, "");
    if (!clean.endsWith("/api/v1") && !clean.includes("/api/")) {
      clean = `${clean}/api/v1`;
    }
    return clean;
  }

  // 2. Production build / runtime: NEVER fallback to localhost
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PROD) {
    return "/api/v1";
  }

  // 3. Browser development runtime: rely on Vite dev proxy (/api/v1 -> http://localhost:5000)
  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  // 4. Node.js test environment (tsx runner executing against active local backend)
  return "http://localhost:5000/api/v1";
}

export const API_BASE_URL: string = resolveApiBaseUrl();
