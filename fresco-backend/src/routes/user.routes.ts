import { Router } from "express";

import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for User endpoints. */
const router = Router();

// Get current user profile
router.get("/me", authenticate, userController.getCurrentUser);

// Update user profile
router.patch("/profile", authenticate, userController.updateProfile);

// Change user password
router.patch("/change-password", authenticate, userController.changePassword);

// Request password reset token (Public)
router.post("/forgot-password", userController.forgotPassword);

// Reset password using token (Public)
router.post("/reset-password", userController.resetPassword);

export default router;
