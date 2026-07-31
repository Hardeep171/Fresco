import { Router } from "express";

import { categoryController } from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Category endpoints. */
const router = Router();

// Public routes
// Get all categories (supports optional query filter ?isActive=true|false)
router.get("/", categoryController.getCategories);

// Get single category by ID
router.get("/:id", categoryController.getCategoryById);

// Admin protected routes (write operations)
// Create a new category
router.post("/", authenticate, categoryController.createCategory);

// Update category by ID
router.patch("/:id", authenticate, categoryController.updateCategory);

// Enable category by ID
router.patch("/:id/enable", authenticate, categoryController.enableCategory);

// Disable category by ID (soft delete)
router.delete("/:id", authenticate, categoryController.disableCategory);

export default router;
