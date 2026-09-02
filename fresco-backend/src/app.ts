import compression from "compression";
import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { morganStream } from "./config/logger.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { apiRouter } from "./routes/index.js";

const app = express();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or requests with no Origin header (e.g. mobile apps, curl, server-to-server)
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
};

app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("combined", { stream: morganStream }));

app.use("/api/v1", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
