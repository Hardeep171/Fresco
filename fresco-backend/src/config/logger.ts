import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import { env } from "./env.js";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const serializedMetadata =
      Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : "";

    return `${timestamp} ${level}: ${message}${serializedMetadata}`;
  }),
);

export const logger = winston.createLogger({
  level: env.logLevel,
  format: logFormat,
  defaultMeta: { service: "fresco-backend", environment: env.nodeEnv },
  transports: [
    new winston.transports.Console({
      format: env.nodeEnv === "production" ? logFormat : consoleFormat,
    }),
    new DailyRotateFile({
      dirname: "logs",
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: logFormat,
    }),
    new DailyRotateFile({
      dirname: "logs",
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "30d",
      format: logFormat,
    }),
  ],
});

export const morganStream = {
  write: (message: string): void => {
    logger.info(message.trim(), { source: "http" });
  },
};
