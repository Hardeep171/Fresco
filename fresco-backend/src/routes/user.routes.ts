import { Router } from "express";

import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for User endpoints. */
const router = Router();

// Get current user profile
router.get("/me", authenticate, userController.getCurrentUser);

export default router;
