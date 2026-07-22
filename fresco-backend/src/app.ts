import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { morganStream } from "./config/logger.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("combined", { stream: morganStream }));

app.use("/api/v1", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
