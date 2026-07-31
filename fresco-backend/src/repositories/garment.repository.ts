import type { QueryFilter as FilterQuery, Types } from "mongoose";

import { GarmentModel, type Garment } from "../models/garment.model.js";

/** Repository handling database operations for Garment module. */
export const garmentRepository = {
  /**
   * Creates a new garment document in the database and returns a plain object.
   *
   * @param data - Garment creation properties.
   * @returns Promise resolving to the created garment plain object.
   */
  async createGarment(data: Partial<Garment>) {
    const garment = await GarmentModel.create(data);
    return garment.toObject();
  },

  /**
   * Finds garment documents matching the specified filter criteria, sorted by display order ascending and creation date ascending.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching garment plain objects.
   */
  async findGarments(filters: FilterQuery<Garment> = {}) {
    return GarmentModel.find(filters)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()
      .exec();
  },

  /**
   * Finds a single garment document by its unique identifier.
   *
   * @param garmentId - The garment's unique identifier.
   * @returns Promise resolving to the matching garment plain object if found, or null.
   */
  async findGarmentById(garmentId: string) {
    return GarmentModel.findById(garmentId).lean().exec();
  },

  /**
   * Finds a single garment document by category ID and exact garment name (converted to lowercase).
   *
   * @param categoryId - The parent category ID.
   * @param name - Garment name to look up.
   * @returns Promise resolving to the matching garment plain object if found, or null.
   */
  async findGarmentByName(categoryId: string | Types.ObjectId, name: string) {
    return GarmentModel.findOne({
      categoryId,
      name: name.toLowerCase().trim(),
    })
      .lean()
      .exec();
  },

  /**
   * Updates a garment document by ID and returns a plain object.
   *
   * @param garmentId - The garment's unique identifier.
   * @param data - Garment fields to update.
   * @returns Promise resolving to the updated garment plain object if found, or null.
   */
  async updateGarment(garmentId: string, data: Partial<Garment>) {
    return GarmentModel.findByIdAndUpdate(garmentId, data, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Soft deletes a garment document by setting isActive to false and returns a plain object.
   *
   * @param garmentId - The garment's unique identifier.
   * @returns Promise resolving to the updated garment plain object if found, or null.
   */
  async disableGarment(garmentId: string) {
    return GarmentModel.findByIdAndUpdate(
      garmentId,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Enables a garment document by setting isActive to true and returns a plain object.
   *
   * @param garmentId - The garment's unique identifier.
   * @returns Promise resolving to the updated garment plain object if found, or null.
   */
  async enableGarment(garmentId: string) {
    return GarmentModel.findByIdAndUpdate(
      garmentId,
      { isActive: true },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total garment documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching garment documents.
   */
  async countGarments(filters: FilterQuery<Garment> = {}) {
    return GarmentModel.countDocuments(filters).exec();
  },
};
