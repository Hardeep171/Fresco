import type { QueryFilter as FilterQuery, Types } from "mongoose";

import { CartModel, type Cart } from "../models/cart.model.js";

/** Repository handling database operations for Cart module. */
export const cartRepository = {
  /**
   * Creates a new cart document in the database and returns a plain object.
   *
   * @param data - Cart creation properties.
   * @returns Promise resolving to the created cart plain object.
   */
  async createCart(data: Partial<Cart>) {
    const cart = await CartModel.create(data);
    return cart.toObject();
  },

  /**
   * Finds cart documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching cart plain objects.
   */
  async findCart(filters: FilterQuery<Cart> = {}) {
    return CartModel.find(filters).lean().exec();
  },

  /**
   * Finds a single cart document by its unique identifier.
   *
   * @param cartId - The cart's unique identifier.
   * @returns Promise resolving to the matching cart plain object if found, or null.
   */
  async findCartById(cartId: string) {
    return CartModel.findById(cartId).lean().exec();
  },

  /**
   * Finds a single cart document by user ID.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the matching cart plain object if found, or null.
   */
  async findCartByUser(userId: string | Types.ObjectId) {
    return CartModel.findOne({ userId }).lean().exec();
  },

  /**
   * Updates a cart document by ID and returns a plain object.
   *
   * @param cartId - The cart's unique identifier.
   * @param data - Cart fields to update.
   * @returns Promise resolving to the updated cart plain object if found, or null.
   */
  async updateCart(cartId: string, data: Partial<Cart>) {
    return CartModel.findByIdAndUpdate(cartId, data, {
      returnDocument: "after",
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Deletes a cart document by ID.
   *
   * @param cartId - The cart's unique identifier.
   * @returns Promise resolving to the deleted cart plain object if found, or null.
   */
  async deleteCart(cartId: string) {
    return CartModel.findByIdAndDelete(cartId).lean().exec();
  },

  /**
   * Counts total cart documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching cart documents.
   */
  async countCarts(filters: FilterQuery<Cart> = {}) {
    return CartModel.countDocuments(filters).exec();
  },
};
