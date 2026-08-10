import { Router } from "express";

import addressRouter from "./address.routes.js";
import assignmentRouter from "./assignment.routes.js";
import authRouter from "./auth.routes.js";
import cartRouter from "./cart.routes.js";
import categoryRouter from "./category.routes.js";
import deliveryTaskRouter from "./delivery-task.routes.js";
import garmentRouter from "./garment.routes.js";
import { healthRouter } from "./health.routes.js";
import inspectionRouter from "./inspection.routes.js";
import orderRouter from "./order.routes.js";
import pricingRouter from "./pricing.routes.js";
import serviceRouter from "./service.routes.js";
import userRouter from "./user.routes.js";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/addresses", addressRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/garments", garmentRouter);
apiRouter.use("/services", serviceRouter);
apiRouter.use("/pricing", pricingRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/assignments", assignmentRouter);
apiRouter.use("/delivery-tasks", deliveryTaskRouter);
apiRouter.use("/inspections", inspectionRouter);

export { apiRouter };
