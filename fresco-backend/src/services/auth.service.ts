import { StatusCodes } from "http-status-codes";

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
  /** Register a new user. */
  async register(registerData: RegisterInput) {
    // Check if user exists
    const existingUser = await authRepository.findUserByEmail(registerData.email);
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, "User already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(registerData.password);

    // Create user
    const user = await authRepository.createUser({
      ...registerData,
      password: hashedPassword,
    });

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
    // Find user
    const user = await authRepository.findUserByEmail(email);
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

  /** Clear user session. */
  async logout(userId: string) {
    // Clear refresh token
    await authRepository.clearRefreshToken(userId);

    return {
      success: true,
    };
  },
};
