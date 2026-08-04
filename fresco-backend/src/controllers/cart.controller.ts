import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { cartService } from "../services/cart.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  addCartItemSchema,
  cartIdParamSchema,
  updateCartItemSchema,
} from "../validators/cart.validator.js";

/**
 * Helper to extract authenticated user ID from request, throwing 401 if missing.
 *
 * @param req - Express Request object.
 * @returns Authenticated user ID string.
 * @throws {ApiError} 401 Unauthorized if user ID is missing.
 */
function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId || (req.user as any)?.id;

  if (!userId) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  return userId;
}

/** Cart controller handling HTTP requests for Cart management. */
export const cartController = {
  /** Retrieve the authenticated user's active cart. */
  getCart: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    const cart = await cartService.getCart(userId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Cart fetched successfully",
      { cart },
    );
  }),

  /** Add an item to the authenticated user's cart. */
  addItem: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    // Validate request body
    const validatedData = addCartItemSchema.parse(req.body);

    const cart = await cartService.addItem(userId, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Item added to cart successfully",
      { cart },
    );
  }),

  /** Update an item's quantity in the authenticated user's cart. */
  updateItemQuantity: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    // Validate request params and body
    const { id } = cartIdParamSchema.parse(req.params);
    const validatedData = updateCartItemSchema.parse(req.body);

    const cart = await cartService.updateItemQuantity(
      userId,
      id,
      validatedData.quantity,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Cart item updated successfully",
      { cart },
    );
  }),

  /** Remove a specific item from the authenticated user's cart. */
  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    // Validate request params
    const { id } = cartIdParamSchema.parse(req.params);

    const cart = await cartService.removeItem(userId, id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Cart item removed successfully",
      { cart },
    );
  }),

  /** Clear all items from the authenticated user's cart. */
  clearCart: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    const cart = await cartService.clearCart(userId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Cart cleared successfully",
      { cart },
    );
  }),
};
