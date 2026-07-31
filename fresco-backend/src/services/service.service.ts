import { StatusCodes } from "http-status-codes";

import { serviceRepository } from "../repositories/service.repository.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "../validators/service.validator.js";

/** Filter options for querying services. */
export interface ServiceFilters {
  isActive?: boolean;
}

/**
 * Helper to ensure a service exists by ID, throwing 404 if not found.
 *
 * @param serviceId - Service ID to verify.
 * @returns Promise resolving to the service plain object.
 * @throws {ApiError} 404 Not Found if service does not exist.
 */
async function ensureServiceExists(serviceId: string) {
  const service = await serviceRepository.findServiceById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  return service;
}

/** Service providing business logic for Service module. */
export const serviceService = {
  /**
   * Creates a new service ensuring unique name across the application.
   *
   * @param data - Service creation input properties.
   * @returns Promise resolving to the created service plain object.
   * @throws {ApiError} 409 Conflict if service with the same name exists.
   */
  async createService(data: CreateServiceInput) {
    const existingService = await serviceRepository.findServiceByName(
      data.name,
    );

    if (existingService) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Service with this name already exists",
      );
    }

    return serviceRepository.createService(data);
  },

  /**
   * Retrieves services based on filter criteria. Defaults to returning active services.
   *
   * @param filters - Service query filter options.
   * @returns Promise resolving to an array of matching service plain objects.
   */
  async getServices(filters: ServiceFilters = {}) {
    const { isActive = true } = filters;

    const queryFilters: ServiceFilters = {
      isActive,
    };

    return serviceRepository.findServices(queryFilters);
  },

  /**
   * Retrieves a single service by ID.
   *
   * @param serviceId - Service ID to retrieve.
   * @returns Promise resolving to the matching service plain object.
   * @throws {ApiError} 404 Not Found if service does not exist.
   */
  async getServiceById(serviceId: string) {
    return ensureServiceExists(serviceId);
  },

  /**
   * Updates an existing service document ensuring name uniqueness if name is changed.
   *
   * @param serviceId - Service ID to update.
   * @param data - Validated service update properties.
   * @returns Promise resolving to the updated service plain object.
   * @throws {ApiError} 404 Not Found if service does not exist.
   * @throws {ApiError} 409 Conflict if new service name is already taken by another service.
   */
  async updateService(serviceId: string, data: UpdateServiceInput) {
    await ensureServiceExists(serviceId);

    if (data.name) {
      const serviceWithSameName = await serviceRepository.findServiceByName(
        data.name,
      );

      if (
        serviceWithSameName &&
        serviceWithSameName._id.toString() !== serviceId
      ) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Service with this name already exists",
        );
      }
    }

    const updatedService = await serviceRepository.updateService(
      serviceId,
      data,
    );

    if (!updatedService) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    return updatedService;
  },

  /**
   * Soft deletes a service by setting isActive to false.
   *
   * @param serviceId - Service ID to disable.
   * @returns Promise resolving to the updated service plain object.
   * @throws {ApiError} 404 Not Found if service does not exist.
   */
  async disableService(serviceId: string) {
    await ensureServiceExists(serviceId);

    const disabledService = await serviceRepository.disableService(serviceId);

    if (!disabledService) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    return disabledService;
  },

  /**
   * Enables a service by setting isActive to true.
   *
   * @param serviceId - Service ID to enable.
   * @returns Promise resolving to the updated service plain object.
   * @throws {ApiError} 404 Not Found if service does not exist.
   */
  async enableService(serviceId: string) {
    await ensureServiceExists(serviceId);

    const enabledService = await serviceRepository.enableService(serviceId);

    if (!enabledService) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    return enabledService;
  },
};
