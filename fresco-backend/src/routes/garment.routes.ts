import { Router } from "express";

import { garmentController } from "../controllers/garment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Garment endpoints. */
const router = Router();

// Public routes
// Get all garments (supports optional query filters ?categoryId=<id>&isActive=true|false)
router.get("/", garmentController.getGarments);

// Get single garment by ID
router.get("/:id", garmentController.getGarmentById);

// Admin protected routes (write operations)
// Create a new garment
router.post("/", authenticate, garmentController.createGarment);

// Update garment by ID
router.patch("/:id", authenticate, garmentController.updateGarment);

// Enable garment by ID
router.patch("/:id/enable", authenticate, garmentController.enableGarment);

// Disable garment by ID (soft delete)
router.delete("/:id", authenticate, garmentController.disableGarment);

export default router;
