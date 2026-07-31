import type { QueryFilter as FilterQuery } from "mongoose";

import { ServiceModel, type Service } from "../models/service.model.js";

/** Repository handling database operations for Service module. */
export const serviceRepository = {
  /**
   * Creates a new service document in the database and returns a plain object.
   *
   * @param data - Service creation properties.
   * @returns Promise resolving to the created service plain object.
   */
  async createService(data: Partial<Service>) {
    const service = await ServiceModel.create(data);
    return service.toObject();
  },

  /**
   * Finds service documents matching the specified filter criteria, sorted by display order ascending and creation date ascending.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching service plain objects.
   */
  async findServices(filters: FilterQuery<Service> = {}) {
    return ServiceModel.find(filters)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()
      .exec();
  },

  /**
   * Finds a single service document by its unique identifier.
   *
   * @param serviceId - The service's unique identifier.
   * @returns Promise resolving to the matching service plain object if found, or null.
   */
  async findServiceById(serviceId: string) {
    return ServiceModel.findById(serviceId).lean().exec();
  },

  /**
   * Finds a single service document by its exact name (converted to lowercase).
   *
   * @param name - Service name to look up.
   * @returns Promise resolving to the matching service plain object if found, or null.
   */
  async findServiceByName(name: string) {
    return ServiceModel.findOne({ name: name.toLowerCase().trim() })
      .lean()
      .exec();
  },

  /**
   * Updates a service document by ID and returns a plain object.
   *
   * @param serviceId - The service's unique identifier.
   * @param data - Service fields to update.
   * @returns Promise resolving to the updated service plain object if found, or null.
   */
  async updateService(serviceId: string, data: Partial<Service>) {
    return ServiceModel.findByIdAndUpdate(serviceId, data, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Soft deletes a service document by setting isActive to false and returns a plain object.
   *
   * @param serviceId - The service's unique identifier.
   * @returns Promise resolving to the updated service plain object if found, or null.
   */
  async disableService(serviceId: string) {
    return ServiceModel.findByIdAndUpdate(
      serviceId,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Enables a service document by setting isActive to true and returns a plain object.
   *
   * @param serviceId - The service's unique identifier.
   * @returns Promise resolving to the updated service plain object if found, or null.
   */
  async enableService(serviceId: string) {
    return ServiceModel.findByIdAndUpdate(
      serviceId,
      { isActive: true },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total service documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching service documents.
   */
  async countServices(filters: FilterQuery<Service> = {}) {
    return ServiceModel.countDocuments(filters).exec();
  },
};
