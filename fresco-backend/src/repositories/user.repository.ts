import { UserModel } from "../models/user.model.js";
import type { UpdateProfileInput } from "../validators/user.validator.js";

/** Repository handling database operations for User module. */
export const userRepository = {
  /**
   * Finds a user document by ID explicitly excluding sensitive fields (password, refreshToken).
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserById(userId: string) {
    return UserModel.findById(userId).select("-password -refreshToken").exec();
  },

  /**
   * Updates user profile fields excluding sensitive fields (password, refreshToken).
   *
   * @param userId - The user's unique identifier.
   * @param updateData - Validated profile update properties.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async updateUserProfile(userId: string, updateData: UpdateProfileInput) {
    return UserModel.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password -refreshToken")
      .exec();
  },

  /**
   * Finds a user document by ID including sensitive fields (password, refreshToken).
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByIdWithPasswordAndRefreshToken(userId: string) {
    return UserModel.findById(userId).select("+password +refreshToken").exec();
  },

  /**
   * Updates a user's password and clears the stored refresh token in a single operation.
   *
   * @param userId - The user's unique identifier.
   * @param hashedPassword - The hashed new password.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async updatePasswordAndClearRefreshToken(userId: string, hashedPassword: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        $unset: { refreshToken: 1 },
      },
      { new: true },
    ).exec();
  },

  /**
   * Finds a user document by email address.
   *
   * @param email - The user's email address.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  },

  /**
   * Saves the hashed password reset token and expiration date for a user.
   *
   * @param userId - The user's unique identifier.
   * @param passwordResetToken - Hashed reset token.
   * @param passwordResetTokenExpiresAt - Expiration timestamp.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async savePasswordResetToken(
    userId: string,
    passwordResetToken: string,
    passwordResetTokenExpiresAt: Date,
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        passwordResetToken,
        passwordResetTokenExpiresAt,
      },
      { new: true },
    ).exec();
  },

  /**
   * Finds a user document by hashed password reset token, explicitly selecting passwordResetTokenExpiresAt.
   *
   * @param passwordResetToken - Hashed reset token.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByPasswordResetToken(passwordResetToken: string) {
    return UserModel.findOne({ passwordResetToken })
      .select("+passwordResetToken +passwordResetTokenExpiresAt")
      .exec();
  },

  /**
   * Performs ONE atomic update that sets the new hashed password and removes
   * passwordResetToken, passwordResetTokenExpiresAt, and refreshToken.
   *
   * @param userId - The user's unique identifier.
   * @param hashedPassword - The new hashed password.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async resetPasswordAndClearTokens(userId: string, hashedPassword: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        $unset: {
          passwordResetToken: 1,
          passwordResetTokenExpiresAt: 1,
          refreshToken: 1,
        },
      },
      { new: true },
    ).exec();
  },
};
