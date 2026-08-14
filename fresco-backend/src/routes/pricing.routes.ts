import { Router } from "express";

import { pricingController } from "../controllers/pricing.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for Pricing endpoints. */
const router = Router();

// Public routes
// Get all pricing records (supports optional query filters ?garmentId=<id>&serviceId=<id>&isActive=true|false)
router.get("/", pricingController.getPricing);

// Get single pricing record by ID
router.get("/:id", pricingController.getPricingById);

// Admin protected routes (write operations)
// Create a new pricing entry
router.post(
  "/",
  authenticate,
  authorize(ADMIN_ROLES),
  pricingController.createPricing,
);

// Update pricing record by ID
router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  pricingController.updatePricing,
);

// Enable pricing record by ID
router.patch(
  "/:id/enable",
  authenticate,
  authorize(ADMIN_ROLES),
  pricingController.enablePricing,
);

// Disable pricing record by ID (soft delete)
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  pricingController.disablePricing,
);

export default router;
