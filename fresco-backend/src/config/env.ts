import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
  MONGO_URI: z.string().trim().url("MONGO_URI must be a valid MongoDB URI."),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
  CORS_ORIGIN: z.string().trim().default("*"),
  JWT_ACCESS_SECRET: z
    .string()
    .trim()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters long."),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .trim()
    .regex(
      /^[1-9]\d*[mhd]$/,
      "JWT_ACCESS_EXPIRES_IN must be a positive duration such as 15m, 1h, or 7d.",
    ),
  JWT_REFRESH_SECRET: z
    .string()
    .trim()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters long."),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .trim()
    .regex(
      /^[1-9]\d*[mhd]$/,
      "JWT_REFRESH_EXPIRES_IN must be a positive duration such as 15m, 1h, or 7d.",
    ),
  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int("BCRYPT_SALT_ROUNDS must be an integer.")
    .min(10, "BCRYPT_SALT_ROUNDS must be at least 10.")
    .max(15, "BCRYPT_SALT_ROUNDS must not exceed 15.")
    .default(12),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const formattedErrors = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${formattedErrors}`);
}

const corsOrigins = parsedEnvironment.data.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export const env = Object.freeze({
  nodeEnv: parsedEnvironment.data.NODE_ENV,
  port: parsedEnvironment.data.PORT,
  mongoUri: parsedEnvironment.data.MONGO_URI,
  logLevel: parsedEnvironment.data.LOG_LEVEL,
  jwtAccessSecret: parsedEnvironment.data.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: parsedEnvironment.data.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshSecret: parsedEnvironment.data.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: parsedEnvironment.data.JWT_REFRESH_EXPIRES_IN,
  bcryptSaltRounds: parsedEnvironment.data.BCRYPT_SALT_ROUNDS,
  corsOrigin:
    corsOrigins.length === 0 || corsOrigins.includes("*") ? true : corsOrigins,
});
