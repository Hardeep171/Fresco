import { Router } from "express";

import { paymentController } from "../controllers/payment.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for Payment + Refund endpoints. */
const router = Router();

// Apply authentication middleware globally to all payment routes
router.use(authenticate);

// Create a new payment record
router.post("/", paymentController.createPayment);

// Report payment collected by delivery partner (without :id)
router.post("/report-collected", paymentController.reportPaymentCollected);

// Verify payment by admin (without :id)
router.post("/verify", authorize(ADMIN_ROLES), paymentController.verifyPayment);

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

// Report payment collected by delivery partner (pending admin verification)
router.post("/:id/report-collected", paymentController.reportPaymentCollected);

// Verify and approve partner-reported payment (admin only)
router.post("/:id/verify", authorize(ADMIN_ROLES), paymentController.verifyPayment);

// Mark payment attempt as failed by delivery partner
router.post("/:id/fail", paymentController.markPaymentFailed);

// Retry a failed payment attempt
router.post("/:id/retry", paymentController.retryPayment);

// Issue a full or partial refund for a payment
router.post("/:id/refund", paymentController.createRefund);

export default router;
