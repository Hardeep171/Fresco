import { Router } from "express";

import { categoryController } from "../controllers/category.controller.js";
import { ADMIN_ROLES } from "../constants/user.constants.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Express router for Category endpoints. */
const router = Router();

// Public routes
// Get all categories (supports optional query filter ?isActive=true|false)
router.get("/", categoryController.getCategories);

// Get single category by ID
router.get("/:id", categoryController.getCategoryById);

// Admin protected routes (write operations)
// Create a new category
router.post(
  "/",
  authenticate,
  authorize(ADMIN_ROLES),
  categoryController.createCategory,
);

// Update category by ID
router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  categoryController.updateCategory,
);

// Enable category by ID
router.patch(
  "/:id/enable",
  authenticate,
  authorize(ADMIN_ROLES),
  categoryController.enableCategory,
);

// Disable category by ID (soft delete)
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  categoryController.disableCategory,
);

export default router;
