import { Router } from "express";

import addressRouter from "./address.routes.js";
import authRouter from "./auth.routes.js";
import categoryRouter from "./category.routes.js";
import { healthRouter } from "./health.routes.js";
import userRouter from "./user.routes.js";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/addresses", addressRouter);
apiRouter.use("/categories", categoryRouter);

export { apiRouter };
