import { Router } from "express";

import { assignmentController } from "../controllers/assignment.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for Assignment endpoints. */
const router = Router();

// Apply authentication middleware globally to all assignment routes
router.use(authenticate);

// Get authenticated partner's assignments - must precede /:id to prevent route conflicts
router.get("/partner", assignmentController.getPartnerAssignments);

// Assign a delivery partner to an order (admin use)
router.post("/", authorize(ADMIN_ROLES), assignmentController.assignPartner);

// Get all assignments with optional query filters (admin use)
router.get("/", authorize(ADMIN_ROLES), assignmentController.getAssignments);

// Get single assignment by ID (admin use)
router.get(
  "/:id",
  authorize(ADMIN_ROLES),
  assignmentController.getAssignmentById,
);

// Accept an assignment by ID (delivery partner operation)
router.patch("/:id/accept", assignmentController.acceptAssignment);

// Complete an assignment by ID (delivery partner operation)
router.patch("/:id/complete", assignmentController.completeAssignment);

// Update assignment status by ID (admin use)
router.patch(
  "/:id/status",
  authorize(ADMIN_ROLES),
  assignmentController.updateAssignmentStatus,
);

// Disable assignment by ID (soft delete, admin use)
router.delete(
  "/:id",
  authorize(ADMIN_ROLES),
  assignmentController.disableAssignment,
);

export default router;
