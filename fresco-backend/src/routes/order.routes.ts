import { Router } from "express";

import { orderController } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Order endpoints. */
const router = Router();

// Apply authentication middleware to all order routes
router.use(authenticate);

// Get authenticated user's orders
router.get("/", orderController.getUserOrders);

// Create a new order for authenticated user
router.post("/", orderController.createOrder);

// Get all orders across the system (admin use) - must precede /:id
router.get("/all", orderController.getOrders);

// Get single order by ID
router.get("/:id", orderController.getOrderById);

// Update order lifecycle status
router.patch("/:id/status", orderController.updateOrderStatus);

// Update order payment status
router.patch("/:id/payment-status", orderController.updatePaymentStatus);

// Cancel order by ID
router.patch("/:id/cancel", orderController.cancelOrder);

export default router;
