import { StatusCodes } from "http-status-codes";

import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import type { UpdateProfileInput } from "../validators/user.validator.js";

/** Service providing business logic for User module. */
export const userService = {
  /**
   * Fetches the profile of the current authenticated user.
   *
   * @param userId - User ID to retrieve.
   * @returns Promise resolving to the user document.
   * @throws {ApiError} 404 Not Found if user does not exist.
   */
  async getCurrentUser(userId: string) {
    const user = await userRepository.findUserById(userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    return user;
  },

  /**
   * Updates the profile of the current authenticated user.
   *
   * @param userId - User ID to update.
   * @param updateData - Validated profile update properties.
   * @returns Promise resolving to the updated user document.
   * @throws {ApiError} 404 Not Found if user does not exist.
   */
  async updateProfile(userId: string, updateData: UpdateProfileInput) {
    const existingUser = await userRepository.findUserById(userId);

    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const updatedUser = await userRepository.updateUserProfile(userId, updateData);

    if (!updatedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    return updatedUser;
  },

  /**
   * Changes the password for the current authenticated user and invalidates the refresh token.
   *
   * @param userId - User ID changing password.
   * @param currentPassword - The current plaintext password.
   * @param newPassword - The new plaintext password.
   * @throws {ApiError} 404 if user is not found.
   * @throws {ApiError} 400 if current password is incorrect or same as new password.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userRepository.findUserByIdWithPasswordAndRefreshToken(userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const isPasswordValid = await comparePassword(currentPassword, String(user.password));
    if (!isPasswordValid) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Current password is incorrect",
      );
    }

    if (currentPassword === newPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "New password must be different from the current password",
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await userRepository.updatePasswordAndClearRefreshToken(userId, hashedPassword);
  },
};
