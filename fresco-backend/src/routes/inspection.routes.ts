import { Router } from "express";

import { inspectionController } from "../controllers/inspection.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Order Inspection endpoints. */
const router = Router();

// Apply authentication middleware globally to all inspection routes
router.use(authenticate);

// Create a new order inspection
router.post("/", inspectionController.createInspection);

// Get all order inspections with optional query filters
router.get("/", inspectionController.getInspections);

// Get inspection by order ID - must precede /:id to prevent route conflicts
router.get("/order/:orderId", inspectionController.getInspectionByOrderId);

// Get single inspection by ID
router.get("/:id", inspectionController.getInspectionById);

// Update a DRAFT inspection by ID
router.patch("/:id", inspectionController.updateInspection);

// Submit a DRAFT inspection by ID
router.post("/:id/submit", inspectionController.submitInspection);

// Disable an inspection by ID (soft delete)
router.delete("/:id", inspectionController.disableInspection);

export default router;
