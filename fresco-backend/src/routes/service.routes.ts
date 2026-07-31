import { Router } from "express";

import { serviceController } from "../controllers/service.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Service endpoints. */
const router = Router();

// Public routes
// Get all services (supports optional query filter ?isActive=true|false)
router.get("/", serviceController.getServices);

// Get single service by ID
router.get("/:id", serviceController.getServiceById);

// Admin protected routes (write operations)
// Create a new service
router.post("/", authenticate, serviceController.createService);

// Update service by ID
router.patch("/:id", authenticate, serviceController.updateService);

// Enable service by ID
router.patch("/:id/enable", authenticate, serviceController.enableService);

// Disable service by ID (soft delete)
router.delete("/:id", authenticate, serviceController.disableService);

export default router;
