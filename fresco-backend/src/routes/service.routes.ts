import { Router } from "express";

import { serviceController } from "../controllers/service.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for Service endpoints. */
const router = Router();

// Public routes
// Get all services (supports optional query filter ?isActive=true|false)
router.get("/", serviceController.getServices);

// Get single service by ID
router.get("/:id", serviceController.getServiceById);

// Admin protected routes (write operations)
// Create a new service
router.post(
  "/",
  authenticate,
  authorize(ADMIN_ROLES),
  serviceController.createService,
);

// Update service by ID
router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  serviceController.updateService,
);

// Enable service by ID
router.patch(
  "/:id/enable",
  authenticate,
  authorize(ADMIN_ROLES),
  serviceController.enableService,
);

// Disable service by ID (soft delete)
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  serviceController.disableService,
);

export default router;
