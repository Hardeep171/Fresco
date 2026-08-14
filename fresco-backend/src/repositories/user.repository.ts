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
    return UserModel.findByIdAndUpdate(userId, updateData, { returnDocument: "after" })
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
      { returnDocument: "after" },
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
      { returnDocument: "after" },
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
      { returnDocument: "after" },
    ).exec();
  },

  /**
   * Saves the hashed email verification token and expiration date for a user.
   *
   * @param userId - The user's unique identifier.
   * @param emailVerificationToken - Hashed email verification token.
   * @param emailVerificationTokenExpiresAt - Expiration timestamp.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async saveEmailVerificationToken(
    userId: string,
    emailVerificationToken: string,
    emailVerificationTokenExpiresAt: Date,
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        emailVerificationToken,
        emailVerificationTokenExpiresAt,
      },
      { returnDocument: "after" },
    ).exec();
  },

  /**
   * Finds a user document by hashed email verification token, explicitly selecting emailVerificationToken and emailVerificationTokenExpiresAt.
   *
   * @param emailVerificationToken - Hashed email verification token.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByEmailVerificationToken(emailVerificationToken: string) {
    return UserModel.findOne({ emailVerificationToken })
      .select("+emailVerificationToken +emailVerificationTokenExpiresAt")
      .exec();
  },

  /**
   * Atomically marks user email as verified and clears email verification token fields.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async verifyEmailAndClearToken(userId: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        $unset: {
          emailVerificationToken: 1,
          emailVerificationTokenExpiresAt: 1,
        },
      },
      { returnDocument: "after" },
    ).exec();
  },
};

