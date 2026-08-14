import { Router } from "express";

import { deliveryTaskController } from "../controllers/delivery-task.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for Delivery Task endpoints. */
const router = Router();

// Apply authentication middleware globally to all delivery task routes
router.use(authenticate);

// Get authenticated partner's delivery tasks - must precede /:id to prevent route conflicts
router.get("/partner", deliveryTaskController.getPartnerTasks);

// Create a new delivery task (admin use)
router.post(
  "/",
  authorize(ADMIN_ROLES),
  deliveryTaskController.createTask,
);

// Get all delivery tasks with optional query filters (admin use)
router.get(
  "/",
  authorize(ADMIN_ROLES),
  deliveryTaskController.getTasks,
);

// Get single delivery task by ID (admin use)
router.get(
  "/:id",
  authorize(ADMIN_ROLES),
  deliveryTaskController.getTaskById,
);

// Update delivery task status by ID (admin use)
router.patch(
  "/:id/status",
  authorize(ADMIN_ROLES),
  deliveryTaskController.updateTaskStatus,
);

// Disable delivery task by ID (soft delete, admin use)
router.delete(
  "/:id",
  authorize(ADMIN_ROLES),
  deliveryTaskController.disableTask,
);

export default router;
