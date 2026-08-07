import type { QueryFilter as FilterQuery, Types } from "mongoose";

import {
  DeliveryTaskModel,
  type DeliveryTask,
} from "../models/delivery-task.model.js";

/** Repository handling database operations for Delivery Task module. */
export const deliveryTaskRepository = {
  /**
   * Creates a new delivery task document in the database and returns a plain object.
   *
   * @param data - Delivery task creation properties.
   * @returns Promise resolving to the created delivery task plain object.
   */
  async createTask(data: Partial<DeliveryTask>) {
    const task = await DeliveryTaskModel.create(data);
    return task.toObject();
  },

  /**
   * Finds delivery task documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching delivery task plain objects.
   */
  async findTasks(filters: FilterQuery<DeliveryTask> = {}) {
    return DeliveryTaskModel.find(filters).lean().exec();
  },

  /**
   * Finds a single delivery task document by its unique identifier.
   *
   * @param id - The delivery task's unique identifier.
   * @returns Promise resolving to the matching delivery task plain object if found, or null.
   */
  async findTaskById(id: string) {
    return DeliveryTaskModel.findById(id).lean().exec();
  },

  /**
   * Finds all delivery task documents for a specific partner matching optional filters.
   *
   * @param partnerId - The partner's unique identifier.
   * @param filters - Optional additional query filter parameters.
   * @returns Promise resolving to an array of matching delivery task plain objects.
   */
  async findTasksByPartner(
    partnerId: string | Types.ObjectId,
    filters: FilterQuery<DeliveryTask> = {},
  ) {
    return DeliveryTaskModel.find({ ...filters, partnerId })
      .lean()
      .exec();
  },

  /**
   * Finds a single delivery task document for the specified assignment.
   *
   * @param assignmentId - The assignment's unique identifier.
   * @returns Promise resolving to the matching delivery task plain object if found, or null.
   */
  async findTaskByAssignment(assignmentId: string | Types.ObjectId) {
    return DeliveryTaskModel.findOne({ assignmentId }).lean().exec();
  },

  /**
   * Updates a delivery task document by ID and returns a plain object.
   *
   * @param id - The delivery task's unique identifier.
   * @param data - Delivery task fields to update.
   * @returns Promise resolving to the updated delivery task plain object if found, or null.
   */
  async updateTask(id: string, data: Partial<DeliveryTask>) {
    return DeliveryTaskModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Soft deletes a delivery task document by setting isActive to false and returns a plain object.
   *
   * @param id - The delivery task's unique identifier.
   * @returns Promise resolving to the updated delivery task plain object if found, or null.
   */
  async disableTask(id: string) {
    return DeliveryTaskModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total delivery task documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching delivery task documents.
   */
  async countTasks(filters: FilterQuery<DeliveryTask> = {}) {
    return DeliveryTaskModel.countDocuments(filters).exec();
  },
};
