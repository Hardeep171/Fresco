import { Router } from "express";

import authRouter from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import userRouter from "./user.routes.js";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);

export { apiRouter };
