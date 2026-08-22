import axios from "axios";
import { ENV } from "../config/env.config";

/**
 * Centralized Axios HTTP client instance for FRESCO mobile application.
 */
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
