import axios from "axios";
import { setupInterceptors } from "./interceptors";
import { API_BASE_URL } from "../config/api.config";

export { API_BASE_URL };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auto-wire request and response interceptors immediately on apiClient creation
setupInterceptors(apiClient);
