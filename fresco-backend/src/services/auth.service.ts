import { StatusCodes } from "http-status-codes";

import {
  extractDuplicateField,
  isMongoDuplicateKeyError,
} from "../middlewares/error.middleware.js";
import { authRepository } from "../repositories/auth.repository.js";
import { ApiError } from "../utils/api-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import type { RegisterInput } from "../validators/auth.validator.js";

/** Helper to generate access and refresh token pair. */
async function generateTokens(userId: string, role: string) {
  const payload = { userId, role };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  return { accessToken, refreshToken };
}

/** Authentication service handling user registration, login, token refresh, and logout. */
export const authService = {
  /** Register a new user with duplicate email and phone prevention. */
  async register(registerData: RegisterInput) {
    const normalizedEmail = registerData.email.trim().toLowerCase();
    const normalizedPhone = registerData.phone.trim();

    // Friendly pre-check for duplicate email / phone
    const existingUsers = await authRepository.findExistingUsersByEmailOrPhone(
      normalizedEmail,
      normalizedPhone,
    );

    const emailExists = existingUsers.some(
      (u) => String(u.email).toLowerCase() === normalizedEmail,
    );
    const phoneExists = existingUsers.some(
      (u) => String(u.phone) === normalizedPhone,
    );

    if (emailExists && phoneExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "An account with this email or phone number already exists.",
        [
          { field: "email", message: "An account with this email already exists." },
          { field: "phone", message: "An account with this phone number already exists." },
        ],
      );
    } else if (emailExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "An account with this email already exists.",
        [
          { field: "email", message: "An account with this email already exists." },
        ],
      );
    } else if (phoneExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "An account with this phone number already exists.",
        [
          { field: "phone", message: "An account with this phone number already exists." },
        ],
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(registerData.password);

    // Create user with race condition error handling on unique constraints
    let user;
    try {
      user = await authRepository.createUser({
        ...registerData,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
      });
    } catch (error: unknown) {
      if (isMongoDuplicateKeyError(error)) {
        const field = extractDuplicateField(error);
        if (field === "email") {
          throw new ApiError(
            StatusCodes.CONFLICT,
            "An account with this email already exists.",
            [{ field: "email", message: "An account with this email already exists." }],
          );
        }
        if (field === "phone") {
          throw new ApiError(
            StatusCodes.CONFLICT,
            "An account with this phone number already exists.",
            [{ field: "phone", message: "An account with this phone number already exists." }],
          );
        }
        throw new ApiError(
          StatusCodes.CONFLICT,
          "An account with this value already exists.",
          field ? [{ field, message: `${field} already exists.` }] : [],
        );
      }
      throw error;
    }

    // Generate tokens
    const userId = user._id.toString();
    const userRole = String(user.role);
    const tokens = await generateTokens(userId, userRole);

    // Save refresh token
    await authRepository.updateRefreshToken(userId, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  },

  /** Authenticate user with credentials. */
  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, String(user.password));
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    // Generate tokens
    const userId = user._id.toString();
    const userRole = String(user.role);
    const tokens = await generateTokens(userId, userRole);

    // Save refresh token
    await authRepository.updateRefreshToken(userId, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  },

  /** Refresh access and refresh tokens. */
  async refreshToken(refreshToken: string) {
    // Verify token
    const payload = await verifyRefreshToken(refreshToken);

    // Find user with refresh token
    const user = await authRepository.findUserByIdWithRefreshToken(payload.userId);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    // Compare stored refresh token
    if (user.refreshToken !== refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    // Generate tokens
    const tokens = await generateTokens(user._id.toString(), String(user.role));

    // Save refresh token
    await authRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  },

  /** Logs out a user by verifying and clearing their stored refresh token. */
  async logout(refreshToken: string) {
    // Verify token
    const payload = await verifyRefreshToken(refreshToken);

    // Find user with refresh token
    const user = await authRepository.findUserByIdWithRefreshToken(payload.userId);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    // Compare stored refresh token
    if (user.refreshToken !== refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    // Clear refresh token in database
    await authRepository.clearRefreshToken(user._id.toString());

    return {
      success: true,
    };
  },
};
