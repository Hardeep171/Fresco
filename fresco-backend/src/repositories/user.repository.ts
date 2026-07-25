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
};
