import { Router } from "express";

import { userController } from "../controllers/user.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for User endpoints. */
const router = Router();

// Get current user profile
router.get("/me", authenticate, userController.getCurrentUser);

// Update user profile
router.patch("/profile", authenticate, userController.updateProfile);

// Change user password
router.patch("/change-password", authenticate, userController.changePassword);

// Get platform operations stats (Admin use) - must precede /:id
router.get(
  "/admin/stats",
  authenticate,
  authorize(ADMIN_ROLES),
  userController.getAdminStats,
);

// Get all users matching filters (Admin use) - must precede /:id
router.get(
  "/",
  authenticate,
  authorize(ADMIN_ROLES),
  userController.getUsers,
);

// Request password reset token (Public)
router.post("/forgot-password", userController.forgotPassword);

// Reset password using token (Public)
router.post("/reset-password", userController.resetPassword);

// Verify email using token (Public)
router.post("/verify-email", userController.verifyEmail);

// Get single user by ID (Admin use)
router.get(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  userController.getUserById,
);

// Update user account status (Admin use)
router.patch(
  "/:id/status",
  authenticate,
  authorize(ADMIN_ROLES),
  userController.updateUserStatus,
);

export default router;

