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
  /**
   * Fetch currently authenticated user profile.
   * Backend endpoint: GET /api/v1/users/me
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/users/me");
    return response.data.data.user;
  },

  /**
   * Update profile information (firstName, lastName, phone).
   * Backend endpoint: PATCH /api/v1/users/profile
   */
  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(
      "/users/profile",
      input
    );
    return response.data.data.user;
  },

  /**
   * Change account password.
   * Backend endpoint: PATCH /api/v1/users/change-password
   */
  async changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<void>>(
      "/users/change-password",
      input
    );
    return { message: response.data.message };
  },

  /**
   * Request password reset token via email.
   * Backend endpoint: POST /api/v1/users/forgot-password
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/forgot-password",
      input
    );
    return { message: response.data.message };
  },

  /**
   * Reset account password using token.
   * Backend endpoint: POST /api/v1/users/reset-password
   */
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/reset-password",
      input
    );
    return { message: response.data.message };
  },

  /**
   * Verify customer email address using token.
   * Backend endpoint: POST /api/v1/users/verify-email
   */
  async verifyEmail(input: VerifyEmailInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/verify-email",
      input
    );
    return { message: response.data.message };
  },

  /**
   * Admin: Get aggregated platform operations statistics.
   * Backend endpoint: GET /api/v1/users/admin/stats
   */
  async getAdminStats(): Promise<AdminStats> {
    const response = await apiClient.get<ApiResponse<{ stats: AdminStats }>>(
      "/users/admin/stats"
    );
    return response.data.data.stats;
  },

  /**
   * Admin: Query all users matching role, status, or search filters.
   * Backend endpoint: GET /api/v1/users
   */
  async getUsers(filters?: UserFilters): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<{ users: User[] }>>(
      "/users",
      { params: filters }
    );
    return response.data.data.users;
  },

  /**
   * Admin: Get details of a single user by ID.
   * Backend endpoint: GET /api/v1/users/:id
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      `/users/${id}`
    );
    return response.data.data.user;
  },

  /**
   * Admin: Update user account status (ACTIVE, INACTIVE, SUSPENDED).
   * Backend endpoint: PATCH /api/v1/users/:id/status
   */
  async updateUserStatus(id: string, status: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(
      `/users/${id}/status`,
      { status }
    );
    return response.data.data.user;
  },
};

