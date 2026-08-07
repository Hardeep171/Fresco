import { Router } from "express";

import { deliveryTaskController } from "../controllers/delivery-task.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Delivery Task endpoints. */
const router = Router();

// Apply authentication middleware globally to all delivery task routes
router.use(authenticate);

// Get authenticated partner's delivery tasks - must precede /:id to prevent route conflicts
router.get("/partner", deliveryTaskController.getPartnerTasks);

// Create a new delivery task (admin use)
router.post("/", deliveryTaskController.createTask);

// Get all delivery tasks with optional query filters
router.get("/", deliveryTaskController.getTasks);

// Get single delivery task by ID
router.get("/:id", deliveryTaskController.getTaskById);

// Update delivery task status by ID
router.patch("/:id/status", deliveryTaskController.updateTaskStatus);

// Disable delivery task by ID (soft delete)
router.delete("/:id", deliveryTaskController.disableTask);

export default router;
