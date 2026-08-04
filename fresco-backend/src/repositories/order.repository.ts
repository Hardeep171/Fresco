import type { QueryFilter as FilterQuery, Types } from "mongoose";

import { OrderModel, type Order } from "../models/order.model.js";

/** Repository handling database operations for Order module. */
export const orderRepository = {
  /**
   * Creates a new order document in the database and returns a plain object.
   *
   * @param data - Order creation properties.
   * @returns Promise resolving to the created order plain object.
   */
  async createOrder(data: Partial<Order>) {
    const order = await OrderModel.create(data);
    return order.toObject();
  },

  /**
   * Finds order documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching order plain objects.
   */
  async findOrder(filters: FilterQuery<Order> = {}) {
    return OrderModel.find(filters).sort({ createdAt: -1 }).lean().exec();
  },

  /**
   * Finds a single order document by its unique identifier.
   *
   * @param orderId - The order's unique identifier.
   * @returns Promise resolving to the matching order plain object if found, or null.
   */
  async findOrderById(orderId: string) {
    return OrderModel.findById(orderId).lean().exec();
  },

  /**
   * Finds a single order document by its unique order number.
   *
   * @param orderNumber - The unique order number string.
   * @returns Promise resolving to the matching order plain object if found, or null.
   */
  async findOrderByOrderNumber(orderNumber: string) {
    return OrderModel.findOne({ orderNumber }).lean().exec();
  },

  /**
   * Finds order documents belonging to a specific user.
   *
   * @param userId - The user's unique identifier.
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching user order plain objects.
   */
  async findOrdersByUser(
    userId: string | Types.ObjectId,
    filters: FilterQuery<Order> = {},
  ) {
    return OrderModel.find({ userId, ...filters })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  /**
   * Updates an order document by ID and returns a plain object.
   *
   * @param orderId - The order's unique identifier.
   * @param data - Order fields to update.
   * @returns Promise resolving to the updated order plain object if found, or null.
   */
  async updateOrder(orderId: string, data: Partial<Order>) {
    return OrderModel.findByIdAndUpdate(orderId, data, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Deletes an order document by ID.
   *
   * @param orderId - The order's unique identifier.
   * @returns Promise resolving to the deleted order plain object if found, or null.
   */
  async deleteOrder(orderId: string) {
    return OrderModel.findByIdAndDelete(orderId).lean().exec();
  },

  /**
   * Counts total order documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching order documents.
   */
  async countOrders(filters: FilterQuery<Order> = {}) {
    return OrderModel.countDocuments(filters).exec();
  },
};
