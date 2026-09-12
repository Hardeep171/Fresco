import { apiClient } from "./client";
import { AuthResponse, LoginInput, RegisterInput } from "../types/auth.types";
import { ApiResponse, RefreshTokenResponseData } from "../types/api.types";

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      input
    );
    return response.data.data;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      input
    );
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseData> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponseData>>(
      "/auth/refresh-token",
      { refreshToken }
    );
    return response.data.data;
  },

  async logout(refreshToken?: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      "/auth/logout",
      { refreshToken: refreshToken || "" }
    );
    return response.data.data;
  },
};
