import type { QueryFilter as FilterQuery, Types } from "mongoose";

import {
  InspectionModel,
  type Inspection,
} from "../models/inspection.model.js";

/** Repository handling database operations for Inspection module. */
export const inspectionRepository = {
  /**
   * Creates a new inspection document in the database and returns a plain object.
   *
   * @param data - Inspection creation properties.
   * @returns Promise resolving to the created inspection plain object.
   */
  async createInspection(data: Partial<Inspection>) {
    const inspection = await InspectionModel.create(data);
    return inspection.toObject();
  },

  /**
   * Finds inspection documents matching the specified filter criteria, sorted by creation date descending.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching inspection plain objects.
   */
  async findInspections(filters: FilterQuery<Inspection> = {}) {
    return InspectionModel.find(filters)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  /**
   * Finds a single inspection document by its unique identifier.
   *
   * @param id - The inspection's unique identifier.
   * @returns Promise resolving to the matching inspection plain object if found, or null.
   */
  async findInspectionById(id: string) {
    return InspectionModel.findById(id).lean().exec();
  },

  /**
   * Finds a single inspection document for the specified order.
   *
   * @param orderId - The order's unique identifier.
   * @returns Promise resolving to the matching inspection plain object if found, or null.
   */
  async findInspectionByOrder(orderId: string | Types.ObjectId) {
    return InspectionModel.findOne({ orderId }).lean().exec();
  },

  /**
   * Updates an inspection document by ID and returns a plain object.
   *
   * @param id - The inspection's unique identifier.
   * @param data - Inspection fields to update.
   * @returns Promise resolving to the updated inspection plain object if found, or null.
   */
  async updateInspection(id: string, data: Partial<Inspection>) {
    return InspectionModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Soft deletes an inspection document by setting isActive to false and returns a plain object.
   *
   * @param id - The inspection's unique identifier.
   * @returns Promise resolving to the updated inspection plain object if found, or null.
   */
  async disableInspection(id: string) {
    return InspectionModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total inspection documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching inspection documents.
   */
  async countInspections(filters: FilterQuery<Inspection> = {}) {
    return InspectionModel.countDocuments(filters).exec();
  },
};
