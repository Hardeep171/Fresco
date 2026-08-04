import { z } from "zod";

import { MIN_CART_ITEM_QUANTITY } from "../constants/cart.constants.js";
import { objectIdSchema } from "../lib/validation.js";

/**
 * Reusable Zod validation schema for adding an item to the cart.
 */
export const addCartItemSchema = z.object({
  garmentId: objectIdSchema,

  serviceId: objectIdSchema,

  quantity: z
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be an integer." })
    .min(MIN_CART_ITEM_QUANTITY, {
      error: `Quantity must be at least ${MIN_CART_ITEM_QUANTITY}.`,
    }),
});

/**
 * Reusable Zod validation schema for updating an item's quantity in the cart.
 */
export const updateCartItemSchema = z.object({
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be an integer." })
    .min(MIN_CART_ITEM_QUANTITY, {
      error: `Quantity must be at least ${MIN_CART_ITEM_QUANTITY}.`,
    }),
});

/**
 * Reusable Zod validation schema for cart ID parameter.
 * Validates that `id` is a valid MongoDB ObjectId.
 */
export const cartIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Strongly typed interface inferred from `addCartItemSchema`. */
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

/** Strongly typed interface inferred from `updateCartItemSchema`. */
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

/** Strongly typed interface inferred from `cartIdParamSchema`. */
export type CartIdParamInput = z.infer<typeof cartIdParamSchema>;
