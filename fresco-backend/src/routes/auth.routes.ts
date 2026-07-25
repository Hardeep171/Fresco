import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";

/** Express router for authentication endpoints. */
const router = Router();

// Register route
router.post("/register", authController.register);

// Login route
router.post("/login", authController.login);

// Refresh token route
router.post("/refresh-token", authController.refreshToken);

// Logout route
router.post("/logout", authController.logout);

export default router;
