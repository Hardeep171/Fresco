import { Router } from "express";

import { paymentController } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Payment + Refund endpoints. */
const router = Router();

// Apply authentication middleware globally to all payment routes
router.use(authenticate);

// Create a new payment record
router.post("/", paymentController.createPayment);

// Get all payments with optional query filters
router.get("/", paymentController.getPayments);

// Get payments for the authenticated customer - MUST precede /:id
router.get("/customer", paymentController.getCustomerPayments);

// Get payment by order ID - MUST precede /:id
router.get("/order/:orderId", paymentController.getPaymentByOrderId);

// Get single payment by ID
router.get("/:id", paymentController.getPaymentById);

// Get refund history for a payment by ID
router.get("/:id/refunds", paymentController.getPaymentRefunds);

// Mark payment as received by delivery partner
router.post("/:id/receive", paymentController.receivePayment);

// Mark payment attempt as failed by delivery partner
router.post("/:id/fail", paymentController.markPaymentFailed);

// Retry a failed payment attempt
router.post("/:id/retry", paymentController.retryPayment);

// Issue a full or partial refund for a payment
router.post("/:id/refund", paymentController.createRefund);

export default router;
