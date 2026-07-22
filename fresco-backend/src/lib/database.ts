import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

mongoose.connection.on("error", (error: Error) => {
  logger.error("MongoDB connection error", { error });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });

  logger.info("MongoDB connected", {
    host: mongoose.connection.host,
    database: mongoose.connection.name,
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully");
  }
};
