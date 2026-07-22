import type { Server } from "node:http";

import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./lib/database.js";

let server: Server | undefined;
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info("Shutdown initiated", { signal });

  if (server !== undefined) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  try {
    await disconnectDatabase();
  } catch (error: unknown) {
    logger.error("MongoDB disconnect failed during shutdown", { error });
  }

  logger.info("Shutdown completed");
};

const exitAfterShutdown = (signal: string): void => {
  void shutdown(signal)
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      logger.error("Graceful shutdown failed", { error });
      process.exit(1);
    });
};

const startServer = async (): Promise<void> => {
  await connectDatabase();

  server = app.listen(env.port, () => {
    logger.info("FRESCO backend started", {
      port: env.port,
      environment: env.nodeEnv,
      nodeVersion: process.version,
      pid: process.pid,
    });
  });
};

process.once("SIGTERM", () => exitAfterShutdown("SIGTERM"));
process.once("SIGINT", () => exitAfterShutdown("SIGINT"));
process.once("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception", { error });
  exitAfterShutdown("uncaughtException");
});
process.once("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled promise rejection", { reason });
  exitAfterShutdown("unhandledRejection");
});

void startServer().catch((error: unknown) => {
  logger.error("Server startup failed", { error });
  process.exit(1);
});
