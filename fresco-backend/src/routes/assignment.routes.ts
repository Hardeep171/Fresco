import { Router } from "express";

import { assignmentController } from "../controllers/assignment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Assignment endpoints. */
const router = Router();

// Apply authentication middleware globally to all assignment routes
router.use(authenticate);

// Get authenticated partner's assignments - must precede /:id to prevent route conflicts
router.get("/partner", assignmentController.getPartnerAssignments);

// Assign a delivery partner to an order (admin use)
router.post("/", assignmentController.assignPartner);

// Get all assignments with optional query filters
router.get("/", assignmentController.getAssignments);

// Get single assignment by ID
router.get("/:id", assignmentController.getAssignmentById);

// Accept an assignment by ID (delivery partner operation)
router.patch("/:id/accept", assignmentController.acceptAssignment);

// Complete an assignment by ID (delivery partner operation)
router.patch("/:id/complete", assignmentController.completeAssignment);

// Update assignment status by ID
router.patch("/:id/status", assignmentController.updateAssignmentStatus);

// Disable assignment by ID (soft delete)
router.delete("/:id", assignmentController.disableAssignment);

export default router;
