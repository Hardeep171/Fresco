import { Router } from "express";

import { orderController } from "../controllers/order.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for Order endpoints. */
const router = Router();

// Apply authentication middleware to all order routes
router.use(authenticate);

// Get authenticated user's orders
router.get("/", orderController.getUserOrders);

// Create a new order for authenticated user
router.post("/", orderController.createOrder);

// Get all orders across the system (admin use) - must precede /:id
router.get("/all", authorize(ADMIN_ROLES), orderController.getOrders);

// Get single order by ID (Ownership / authorization verified in controller/service)
router.get("/:id", orderController.getOrderById);

// Update order lifecycle status (admin use)
router.patch(
  "/:id/status",
  authorize(ADMIN_ROLES),
  orderController.updateOrderStatus,
);

// Update order payment status (admin use)
router.patch(
  "/:id/payment-status",
  authorize(ADMIN_ROLES),
  orderController.updatePaymentStatus,
);

// Cancel order by ID
router.patch("/:id/cancel", orderController.cancelOrder);

export default router;
