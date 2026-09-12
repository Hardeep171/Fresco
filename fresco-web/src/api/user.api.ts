import { apiClient } from "./client";
import { User } from "../types/auth.types";
import {
  AdminStats,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  UserFilters,
  VerifyEmailInput,
} from "../types/user.types";
import { ApiResponse } from "../types/api.types";

export const userApi = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/users/me");
    return response.data.data.user;
  },

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(
      "/users/profile",
      input
    );
    return response.data.data.user;
  },

  async changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<void>>(
      "/users/change-password",
      input
    );
    return { message: response.data.message };
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/forgot-password",
      input
    );
    return { message: response.data.message };
  },

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/reset-password",
      input
    );
    return { message: response.data.message };
  },

  async verifyEmail(input: VerifyEmailInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/verify-email",
      input
    );
    return { message: response.data.message };
  },

  async getAdminStats(): Promise<AdminStats> {
    const response = await apiClient.get<ApiResponse<{ stats: AdminStats }>>(
      "/users/admin/stats"
    );
    return response.data.data.stats;
  },

  async getUsers(filters?: UserFilters): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<{ users: User[] }>>(
      "/users",
      { params: filters }
    );
    return response.data.data.users;
  },

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      `/users/${id}`
    );
    return response.data.data.user;
  },

  async updateUserStatus(id: string, status: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(
      `/users/${id}/status`,
      { status }
    );
    return response.data.data.user;
  },
};
