import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import { garmentRepository } from "../repositories/garment.repository.js";
import { pricingRepository } from "../repositories/pricing.repository.js";
import { serviceRepository } from "../repositories/service.repository.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreatePricingInput,
  UpdatePricingInput,
} from "../validators/pricing.validator.js";

/** Filter options for querying pricing entries. */
export interface PricingFilters {
  garmentId?: string;
  serviceId?: string;
  isActive?: boolean;
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
      "Cannot set pricing for an inactive garment",
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
      "Cannot set pricing for an inactive service",
    );
  }

  return service;
}

/**
 * Helper to ensure a pricing entry exists by ID, throwing 404 if not found.
 *
 * @param pricingId - Pricing ID to verify.
 * @returns Promise resolving to the pricing plain object.
 * @throws {ApiError} 404 Not Found if pricing entry does not exist.
 */
async function ensurePricingExists(pricingId: string) {
  const pricing = await pricingRepository.findPricingById(pricingId);

  if (!pricing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pricing not found");
  }

  return pricing;
}

/** Service providing business logic for Pricing module. */
export const pricingService = {
  /**
   * Creates a new pricing entry after verifying garment and service existence, active status, and pair uniqueness.
   *
   * @param data - Pricing creation input properties.
   * @returns Promise resolving to the created pricing plain object.
   * @throws {ApiError} 404 Not Found if specified garment or service does not exist.
   * @throws {ApiError} 400 Bad Request if specified garment or service is inactive.
   * @throws {ApiError} 409 Conflict if pricing for the garment + service combination already exists.
   */
  async createPricing(data: CreatePricingInput) {
    // 1. Verify garment exists and is active
    await ensureActiveGarment(data.garmentId);

    // 2. Verify service exists and is active
    await ensureActiveService(data.serviceId);

    // 3. Verify garment + service pair uniqueness
    const existingPricing =
      await pricingRepository.findPricingByGarmentAndService(
        data.garmentId,
        data.serviceId,
      );

    if (existingPricing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Pricing for this garment and service combination already exists",
      );
    }

    const pricingData = {
      ...data,
      garmentId: new Types.ObjectId(data.garmentId),
      serviceId: new Types.ObjectId(data.serviceId),
    };

    return pricingRepository.createPricing(pricingData);
  },

  /**
   * Retrieves pricing entries based on filter criteria. Defaults to returning active pricing entries.
   *
   * @param filters - Pricing query filter options.
   * @returns Promise resolving to an array of matching pricing plain objects.
   */
  async getPricing(filters: PricingFilters = {}) {
    const { garmentId, serviceId, isActive = true } = filters;

    const queryFilters = {
      isActive,
      ...(garmentId !== undefined && { garmentId }),
      ...(serviceId !== undefined && { serviceId }),
    };

    return pricingRepository.findPricing(queryFilters);
  },

  /**
   * Retrieves a single pricing entry by ID.
   *
   * @param pricingId - Pricing ID to retrieve.
   * @returns Promise resolving to the matching pricing plain object.
   * @throws {ApiError} 404 Not Found if pricing entry does not exist.
   */
  async getPricingById(pricingId: string) {
    return ensurePricingExists(pricingId);
  },

  /**
   * Updates an existing pricing entry ensuring target garment & service exist, are active, and pair is unique.
   *
   * @param pricingId - Pricing ID to update.
   * @param data - Validated pricing update properties.
   * @returns Promise resolving to the updated pricing plain object.
   * @throws {ApiError} 404 Not Found if pricing entry, target garment, or target service does not exist.
   * @throws {ApiError} 400 Bad Request if target garment or target service is inactive.
   * @throws {ApiError} 409 Conflict if pair combination is already taken by another pricing entry.
   */
  async updatePricing(pricingId: string, data: UpdatePricingInput) {
    const existingPricing = await ensurePricingExists(pricingId);

    const existingGarmentId = existingPricing.garmentId
      ? String(existingPricing.garmentId)
      : "";
    const existingServiceId = existingPricing.serviceId
      ? String(existingPricing.serviceId)
      : "";

    const targetGarmentId = data.garmentId ?? existingGarmentId;
    const targetServiceId = data.serviceId ?? existingServiceId;

    // Verify target garment if garmentId is changed
    if (data.garmentId && data.garmentId !== existingGarmentId) {
      await ensureActiveGarment(targetGarmentId);
    }

    // Verify target service if serviceId is changed
    if (data.serviceId && data.serviceId !== existingServiceId) {
      await ensureActiveService(targetServiceId);
    }

    // Check pair uniqueness if garmentId or serviceId changed
    if (data.garmentId || data.serviceId) {
      const pricingWithSamePair =
        await pricingRepository.findPricingByGarmentAndService(
          targetGarmentId,
          targetServiceId,
        );

      if (
        pricingWithSamePair &&
        pricingWithSamePair._id.toString() !== pricingId
      ) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Pricing for this garment and service combination already exists",
        );
      }
    }

    const { garmentId, serviceId, ...restData } = data;
    const updateData = {
      ...restData,
      ...(garmentId && { garmentId: new Types.ObjectId(garmentId) }),
      ...(serviceId && { serviceId: new Types.ObjectId(serviceId) }),
    };

    const updatedPricing = await pricingRepository.updatePricing(
      pricingId,
      updateData,
    );

    if (!updatedPricing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Pricing not found");
    }

    return updatedPricing;
  },

  /**
   * Soft deletes a pricing entry by setting isActive to false.
   *
   * @param pricingId - Pricing ID to disable.
   * @returns Promise resolving to the updated pricing plain object.
   * @throws {ApiError} 404 Not Found if pricing entry does not exist.
   */
  async disablePricing(pricingId: string) {
    await ensurePricingExists(pricingId);

    const disabledPricing = await pricingRepository.disablePricing(pricingId);

    if (!disabledPricing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Pricing not found");
    }

    return disabledPricing;
  },

  /**
   * Enables a pricing entry by setting isActive to true.
   *
   * @param pricingId - Pricing ID to enable.
   * @returns Promise resolving to the updated pricing plain object.
   * @throws {ApiError} 404 Not Found if pricing entry does not exist.
   */
  async enablePricing(pricingId: string) {
    await ensurePricingExists(pricingId);

    const enabledPricing = await pricingRepository.enablePricing(pricingId);

    if (!enabledPricing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Pricing not found");
    }

    return enabledPricing;
  },
};
