import { UserModel } from "../models/user.model.js";

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
};
