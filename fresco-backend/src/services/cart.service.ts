import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import { cartRepository } from "../repositories/cart.repository.js";
import { garmentRepository } from "../repositories/garment.repository.js";
import { pricingRepository } from "../repositories/pricing.repository.js";
import { serviceRepository } from "../repositories/service.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";
import type {
  AddCartItemInput,
} from "../validators/cart.validator.js";

/**
 * Helper to ensure a user exists by ID and is active.
 *
 * @param userId - User ID to verify.
 * @returns Promise resolving to the user object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user account is inactive.
 */
async function ensureUserExists(userId: string) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User account is inactive",
    );
  }

  return user;
}

/**
 * Helper to ensure a garment exists by ID and is active.
 *
 * @param garmentId - Garment ID to verify.
 * @returns Promise resolving to the garment plain object.
 * @throws {ApiError} 404 Not Found if garment does not exist.
 * @throws {ApiError} 400 Bad Request if garment is inactive.
 */
async function ensureActiveGarment(garmentId: string) {
  const garment = await garmentRepository.findGarmentById(garmentId);

  if (!garment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Garment not found");
  }

  if (!garment.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Garment is inactive",
    );
  }

  return garment;
}

/**
 * Helper to ensure a service exists by ID and is active.
 *
 * @param serviceId - Service ID to verify.
 * @returns Promise resolving to the service plain object.
 * @throws {ApiError} 404 Not Found if service does not exist.
 * @throws {ApiError} 400 Bad Request if service is inactive.
 */
async function ensureActiveService(serviceId: string) {
  const service = await serviceRepository.findServiceById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  if (!service.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Service is inactive",
    );
  }

  return service;
}

/**
 * Helper to ensure an active pricing entry exists for a garment + service combination.
 *
 * @param garmentId - Garment ID.
 * @param serviceId - Service ID.
 * @returns Promise resolving to the pricing plain object.
 * @throws {ApiError} 404 Not Found if pricing does not exist.
 * @throws {ApiError} 400 Bad Request if pricing is inactive.
 */
async function ensureActivePricing(garmentId: string, serviceId: string) {
  const pricing = await pricingRepository.findPricingByGarmentAndService(
    garmentId,
    serviceId,
  );

  if (!pricing) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Pricing for this garment and service combination not found",
    );
  }

  if (!pricing.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Pricing for this garment and service combination is inactive",
    );
  }

  return pricing;
}

/**
 * Helper to ensure a cart exists for a user, throwing 404 if not found.
 *
 * @param userId - User ID to check cart for.
 * @returns Promise resolving to the cart plain object.
 * @throws {ApiError} 404 Not Found if cart does not exist.
 */
async function ensureCartExists(userId: string) {
  const cart = await cartRepository.findCartByUser(userId);

  if (!cart) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
  }

  return cart;
}

/**
 * Helper to recalculate subtotals and totalAmount for a cart items array.
 *
 * @param items - Array of cart item objects.
 * @returns Object containing recalculated items and totalAmount.
 */
function recalculateCartTotals(items: any[]) {
  const updatedItems = items.map((item) => {
    const subtotal = item.quantity * item.unitPrice;
    return {
      ...item,
      subtotal,
    };
  });

  const totalAmount = updatedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  return { items: updatedItems, totalAmount };
}

/** Service providing business logic for Cart module. */
export const cartService = {
  /**
   * Retrieves a user's active cart. Creates a new empty cart if one does not exist.
   *
   * @param userId - User ID.
   * @returns Promise resolving to the cart plain object.
   * @throws {ApiError} 404 Not Found if user does not exist.
   * @throws {ApiError} 400 Bad Request if user is inactive.
   */
  async getCart(userId: string) {
    await ensureUserExists(userId);

    let cart = await cartRepository.findCartByUser(userId);

    if (!cart) {
      cart = await cartRepository.createCart({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
      });
    }

    return cart;
  },

  /**
   * Adds an item to the user's cart. Creates a cart if needed, updates quantity if item exists.
   *
   * @param userId - User ID.
   * @param data - Validated add cart item input properties.
   * @returns Promise resolving to the updated cart plain object.
   * @throws {ApiError} 404 Not Found if user, garment, service, or pricing does not exist.
   * @throws {ApiError} 400 Bad Request if user, garment, service, or pricing is inactive.
   */
  async addItem(userId: string, data: AddCartItemInput) {
    await ensureUserExists(userId);
    await ensureActiveGarment(data.garmentId);
    await ensureActiveService(data.serviceId);
    const pricing = await ensureActivePricing(data.garmentId, data.serviceId);

    let cart = await cartRepository.findCartByUser(userId);

    if (!cart) {
      cart = await cartRepository.createCart({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
      });
    }

    const items = [...cart.items];
    const existingIndex = items.findIndex(
      (item: any) =>
        String(item.garmentId) === data.garmentId &&
        String(item.serviceId) === data.serviceId,
    );

    const unitPrice = Number(pricing.price);

    if (existingIndex > -1) {
      const existingItem = items[existingIndex];
      const newQuantity = existingItem.quantity + data.quantity;
      items[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
        unitPrice,
        subtotal: newQuantity * unitPrice,
      };
    } else {
      items.push({
        garmentId: new Types.ObjectId(data.garmentId),
        serviceId: new Types.ObjectId(data.serviceId),
        quantity: data.quantity,
        unitPrice,
        subtotal: data.quantity * unitPrice,
      });
    }

    const { items: recalculatedItems, totalAmount } =
      recalculateCartTotals(items);

    const updatedCart = await cartRepository.updateCart(cart._id.toString(), {
      items: recalculatedItems,
      totalAmount,
    });

    if (!updatedCart) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
    }

    return updatedCart;
  },

  /**
   * Updates the quantity of a specific item in the user's cart.
   *
   * @param userId - User ID.
   * @param cartItemId - Cart item _id.
   * @param quantity - New quantity value.
   * @returns Promise resolving to the updated cart plain object.
   * @throws {ApiError} 404 Not Found if user, cart, or item does not exist.
   */
  async updateItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ) {
    await ensureUserExists(userId);
    const cart = await ensureCartExists(userId);

    const items = [...cart.items];
    const itemIndex = items.findIndex(
      (item: any) => item._id && String(item._id) === cartItemId,
    );

    if (itemIndex === -1) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
    }

    items[itemIndex] = {
      ...items[itemIndex],
      quantity,
      subtotal: quantity * items[itemIndex].unitPrice,
    };

    const { items: recalculatedItems, totalAmount } =
      recalculateCartTotals(items);

    const updatedCart = await cartRepository.updateCart(cart._id.toString(), {
      items: recalculatedItems,
      totalAmount,
    });

    if (!updatedCart) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
    }

    return updatedCart;
  },

  /**
   * Removes a specific item from the user's cart.
   *
   * @param userId - User ID.
   * @param cartItemId - Cart item _id.
   * @returns Promise resolving to the updated cart plain object.
   * @throws {ApiError} 404 Not Found if user, cart, or item does not exist.
   */
  async removeItem(userId: string, cartItemId: string) {
    await ensureUserExists(userId);
    const cart = await ensureCartExists(userId);

    const items = [...cart.items];
    const itemIndex = items.findIndex(
      (item: any) => item._id && String(item._id) === cartItemId,
    );

    if (itemIndex === -1) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
    }

    items.splice(itemIndex, 1);

    const { items: recalculatedItems, totalAmount } =
      recalculateCartTotals(items);

    const updatedCart = await cartRepository.updateCart(cart._id.toString(), {
      items: recalculatedItems,
      totalAmount,
    });

    if (!updatedCart) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
    }

    return updatedCart;
  },

  /**
   * Clears all items from the user's cart and resets totalAmount to 0.
   *
   * @param userId - User ID.
   * @returns Promise resolving to the updated empty cart plain object.
   * @throws {ApiError} 404 Not Found if user or cart does not exist.
   */
  async clearCart(userId: string) {
    await ensureUserExists(userId);
    const cart = await ensureCartExists(userId);

    const updatedCart = await cartRepository.updateCart(cart._id.toString(), {
      items: [],
      totalAmount: 0,
    });

    if (!updatedCart) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
    }

    return updatedCart;
  },
};
