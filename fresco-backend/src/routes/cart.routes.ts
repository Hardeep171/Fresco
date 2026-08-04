import { Router } from "express";

import { cartController } from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Cart endpoints. */
const router = Router();

// Protected routes (All cart operations require authentication)
// Get authenticated user's cart
router.get("/", authenticate, cartController.getCart);

// Add item to cart
router.post("/", authenticate, cartController.addItem);

// Update item quantity in cart
router.patch("/items/:id", authenticate, cartController.updateItemQuantity);

// Remove specific item from cart
router.delete("/items/:id", authenticate, cartController.removeItem);

// Clear entire cart
router.delete("/", authenticate, cartController.clearCart);

export default router;
