import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
  MONGO_URI: z.string().trim().url("MONGO_URI must be a valid MongoDB URI."),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
  CORS_ORIGIN: z.string().trim().default("*"),
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
  corsOrigin:
    corsOrigins.length === 0 || corsOrigins.includes("*") ? true : corsOrigins,
});
