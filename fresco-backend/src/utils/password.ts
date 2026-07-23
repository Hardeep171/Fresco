import bcrypt from "bcryptjs";

import { env } from "../config/env.js";

function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }
}

/**
 * Creates a salted bcrypt hash for a plaintext password.
 *
 * @param password - The plaintext password to hash.
 * @returns A promise that resolves to the bcrypt password hash.
 * @throws {TypeError} If the password is empty or contains only whitespace.
 */
export async function hashPassword(password: string): Promise<string> {
  assertNonEmptyString(password, "Password");

  return await bcrypt.hash(password, env.bcryptSaltRounds);
}

/**
 * Determines whether a plaintext password matches a bcrypt password hash.
 *
 * @param password - The plaintext password to verify.
 * @param hashedPassword - The bcrypt hash to compare against.
 * @returns A promise that resolves to `true` when the password matches the hash; otherwise, `false`.
 * @throws {TypeError} If either value is empty or contains only whitespace.
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  assertNonEmptyString(password, "Password");
  assertNonEmptyString(hashedPassword, "Hashed password");

  return await bcrypt.compare(password, hashedPassword);
}
