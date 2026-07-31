import type { QueryFilter as FilterQuery, Types } from "mongoose";

import { PricingModel, type Pricing } from "../models/pricing.model.js";

/** Repository handling database operations for Pricing module. */
export const pricingRepository = {
  /**
   * Creates a new pricing document in the database and returns a plain object.
   *
   * @param data - Pricing creation properties.
   * @returns Promise resolving to the created pricing plain object.
   */
  async createPricing(data: Partial<Pricing>) {
    const pricing = await PricingModel.create(data);
    return pricing.toObject();
  },

  /**
   * Finds pricing documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching pricing plain objects.
   */
  async findPricing(filters: FilterQuery<Pricing> = {}) {
    return PricingModel.find(filters).lean().exec();
  },

  /**
   * Finds a single pricing document by its unique identifier.
   *
   * @param pricingId - The pricing's unique identifier.
   * @returns Promise resolving to the matching pricing plain object if found, or null.
   */
  async findPricingById(pricingId: string) {
    return PricingModel.findById(pricingId).lean().exec();
  },

  /**
   * Finds a single pricing document by garment ID and service ID combination.
   *
   * @param garmentId - Garment unique identifier.
   * @param serviceId - Service unique identifier.
   * @returns Promise resolving to matching pricing plain object if found, or null.
   */
  async findPricingByGarmentAndService(
    garmentId: string | Types.ObjectId,
    serviceId: string | Types.ObjectId,
  ) {
    return PricingModel.findOne({ garmentId, serviceId }).lean().exec();
  },

  /**
   * Updates a pricing document by ID and returns a plain object.
   *
   * @param pricingId - The pricing's unique identifier.
   * @param data - Pricing fields to update.
   * @returns Promise resolving to the updated pricing plain object if found, or null.
   */
  async updatePricing(pricingId: string, data: Partial<Pricing>) {
    return PricingModel.findByIdAndUpdate(pricingId, data, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Soft deletes a pricing document by setting isActive to false and returns a plain object.
   *
   * @param pricingId - The pricing's unique identifier.
   * @returns Promise resolving to the updated pricing plain object if found, or null.
   */
  async disablePricing(pricingId: string) {
    return PricingModel.findByIdAndUpdate(
      pricingId,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Enables a pricing document by setting isActive to true and returns a plain object.
   *
   * @param pricingId - The pricing's unique identifier.
   * @returns Promise resolving to the updated pricing plain object if found, or null.
   */
  async enablePricing(pricingId: string) {
    return PricingModel.findByIdAndUpdate(
      pricingId,
      { isActive: true },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total pricing documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching pricing documents.
   */
  async countPricing(filters: FilterQuery<Pricing> = {}) {
    return PricingModel.countDocuments(filters).exec();
  },
};
