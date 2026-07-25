import { StatusCodes } from "http-status-codes";

import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";

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
};
