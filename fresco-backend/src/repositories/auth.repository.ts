import { UserModel } from "../models/user.model.js";
import type { RegisterInput } from "../validators/auth.validator.js";

/**
 * Repository handling database operations for User authentication.
 */
export const authRepository = {
  /**
   * Finds a user document by email, selecting password for credential verification.
   *
   * @param email - The user's email address.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByEmail(email: string) {
    return UserModel.findOne({ email }).select("+password").exec();
  },

  /**
   * Finds a user document by ID following least privilege (no sensitive tokens/passwords selected).
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserById(userId: string) {
    return UserModel.findById(userId).exec();
  },

  /**
   * Finds a user document by ID, explicitly selecting the refreshToken field.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByIdWithRefreshToken(userId: string) {
    return UserModel.findById(userId).select("+refreshToken").exec();
  },

  /**
   * Creates a new user document in the database using the strongly typed RegisterInput payload.
   *
   * @param userData - The strongly typed user creation payload.
   * @returns Promise resolving to the newly created user document.
   */
  async createUser(userData: RegisterInput) {
    return UserModel.create(userData);
  },

  /**
   * Updates only the refresh token for a given user and selects the updated refreshToken field.
   *
   * @param userId - The user's unique identifier.
   * @param refreshToken - The new refresh token string.
   * @returns Promise resolving to the updated user document, or null if not found.
   */
  async updateRefreshToken(userId: string, refreshToken: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { refreshToken },
      { returnDocument: "after" },
    )
      .select("+refreshToken")
      .exec();
  },

  /**
   * Clears/removes the stored refresh token for a given user.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the updated user document, or null if not found.
   */
  async clearRefreshToken(userId: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { returnDocument: "after" },
    ).exec();
  },
};
