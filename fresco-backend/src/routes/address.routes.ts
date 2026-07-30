import { Router } from "express";

import { addressController } from "../controllers/address.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/** Express router for Address endpoints. */
const router = Router();

// Protect all address routes
router.use(authenticate);

// Create a new address
router.post("/", addressController.createAddress);

// Get all user addresses
router.get("/", addressController.getAddresses);

// Get single user address by ID
router.get("/:id", addressController.getAddressById);

// Update user address by ID
router.patch("/:id", addressController.updateAddress);

// Delete user address by ID
router.delete("/:id", addressController.deleteAddress);

// Set address as default by ID
router.patch("/:id/default", addressController.setDefaultAddress);

export default router;
