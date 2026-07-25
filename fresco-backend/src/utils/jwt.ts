import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

/**
 * Strongly typed JWT payload interface representing token claims.
 */
export interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Type guard to validate whether an unknown object satisfies the JwtPayload interface.
 *
 * @param payload - The object or decoded payload to validate.
 * @returns `true` if valid JwtPayload, `false` otherwise.
 */
function isJwtPayload(payload: unknown): payload is JwtPayload {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  if (
    !Object.hasOwn(payload, "userId") ||
    !Object.hasOwn(payload, "role")
  ) {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.userId === "string" &&
    candidate.userId.trim().length > 0 &&
    typeof candidate.role === "string" &&
    candidate.role.trim().length > 0
  );
}

/**
 * Internal async wrapper around callback-based `jwt.sign`.
 *
 * @param payload - The strongly typed payload claims.
 * @param secret - Secret signing key.
 * @param expiresIn - Token expiration duration (e.g., "15m", "7d").
 * @returns Promise resolving to the signed JWT string.
 */
function signToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId: payload.userId, role: payload.role },
      secret,
      {
        algorithm: "HS256",
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
      },
      (err, token) => {
        if (err || !token) {
          return reject(err || new Error("Failed to sign JWT token."));
        }
        resolve(token);
      },
    );
  });
}

/**
 * Internal async wrapper around callback-based `jwt.verify`.
 *
 * @param token - The JWT string to verify.
 * @param secret - Secret signing key.
 * @returns Promise resolving to verified JwtPayload claims.
 */
function verifyToken(token: string, secret: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      { algorithms: ["HS256"] },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        if (!isJwtPayload(decoded)) {
          return reject(
            new Error("Token payload does not conform to required JwtPayload schema."),
          );
        }
        resolve({
          userId: decoded.userId,
          role: decoded.role,
        });
      },
    );
  });
}

/**
 * Generates an Access Token for a given user payload using configured access secrets and expiration.
 *
 * @param payload - Strongly typed user claims containing `userId` and `role`.
 * @returns A promise that resolves to the generated access token string.
 * @throws {TypeError} If payload is invalid or empty.
 * @throws {Error} If token creation fails.
 */
export async function generateAccessToken(payload: JwtPayload): Promise<string> {
  if (!isJwtPayload(payload)) {
    throw new TypeError(
      "Invalid JWT payload: 'userId' and 'role' must be non-empty strings.",
    );
  }
  try {
    return await signToken(payload, env.jwtAccessSecret, env.jwtAccessExpiresIn);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while generating access token.");
  }
}

/**
 * Generates a Refresh Token for a given user payload using configured refresh secrets and expiration.
 *
 * @param payload - Strongly typed user claims containing `userId` and `role`.
 * @returns A promise that resolves to the generated refresh token string.
 * @throws {TypeError} If payload is invalid or empty.
 * @throws {Error} If token creation fails.
 */
export async function generateRefreshToken(payload: JwtPayload): Promise<string> {
  if (!isJwtPayload(payload)) {
    throw new TypeError(
      "Invalid JWT payload: 'userId' and 'role' must be non-empty strings.",
    );
  }
  try {
    return await signToken(payload, env.jwtRefreshSecret, env.jwtRefreshExpiresIn);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while generating refresh token.");
  }
}

/**
 * Verifies and decodes an Access Token using the configured access secret.
 *
 * @param token - The JWT access token string to verify.
 * @returns A promise that resolves to the verified `JwtPayload`.
 * @throws {TypeError} If token is not a valid non-empty string.
 * @throws {Error} If token verification fails, token is expired, or payload structure is invalid.
 */
export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  if (typeof token !== "string" || token.trim().length === 0) {
    throw new TypeError("Token must be a non-empty string.");
  }
  try {
    return await verifyToken(token, env.jwtAccessSecret);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while verifying access token.");
  }
}

/**
 * Verifies and decodes a Refresh Token using the configured refresh secret.
 *
 * @param token - The JWT refresh token string to verify.
 * @returns A promise that resolves to the verified `JwtPayload`.
 * @throws {TypeError} If token is not a valid non-empty string.
 * @throws {Error} If token verification fails, token is expired, or payload structure is invalid.
 */
export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  if (typeof token !== "string" || token.trim().length === 0) {
    throw new TypeError("Token must be a non-empty string.");
  }
  try {
    return await verifyToken(token, env.jwtRefreshSecret);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while verifying refresh token.");
  }
}
