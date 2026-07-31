import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import { categoryRepository } from "../repositories/category.repository.js";
import { garmentRepository } from "../repositories/garment.repository.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateGarmentInput,
  UpdateGarmentInput,
} from "../validators/garment.validator.js";

/** Filter options for querying garments. */
export interface GarmentFilters {
  categoryId?: string;
  isActive?: boolean;
}

/**
 * Helper to ensure a category exists by ID and is active.
 *
 * @param categoryId - Category ID to verify.
 * @returns Promise resolving to the category plain object.
 * @throws {ApiError} 404 Not Found if category does not exist.
 * @throws {ApiError} 400 Bad Request if category is inactive.
 */
async function ensureActiveCategory(categoryId: string) {
  const category = await categoryRepository.findCategoryById(categoryId);

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  if (!category.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cannot add garments to an inactive category",
    );
  }

  return category;
}

/**
 * Helper to ensure a garment exists by ID, throwing 404 if not found.
 *
 * @param garmentId - Garment ID to verify.
 * @returns Promise resolving to the garment plain object.
 * @throws {ApiError} 404 Not Found if garment does not exist.
 */
async function ensureGarmentExists(garmentId: string) {
  const garment = await garmentRepository.findGarmentById(garmentId);

  if (!garment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Garment not found");
  }

  return garment;
}

/** Service providing business logic for Garment module. */
export const garmentService = {
  /**
   * Creates a new garment after verifying category existence, active status, and name uniqueness within the category.
   *
   * @param data - Garment creation input properties.
   * @returns Promise resolving to the created garment plain object.
   * @throws {ApiError} 404 Not Found if specified category does not exist.
   * @throws {ApiError} 400 Bad Request if specified category is inactive.
   * @throws {ApiError} 409 Conflict if garment with the same name exists in the category.
   */
  async createGarment(data: CreateGarmentInput) {
    // 1. Verify category exists and is active
    await ensureActiveCategory(data.categoryId);

    // 2. Verify garment name uniqueness within category
    const existingGarment = await garmentRepository.findGarmentByName(
      data.categoryId,
      data.name,
    );

    if (existingGarment) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Garment with this name already exists in the category",
      );
    }

    const garmentData = {
      ...data,
      categoryId: new Types.ObjectId(data.categoryId),
    };

    return garmentRepository.createGarment(garmentData);
  },

  /**
   * Retrieves garments based on filter criteria. Defaults to returning active garments.
   *
   * @param filters - Garment query filter options.
   * @returns Promise resolving to an array of matching garment plain objects.
   */
  async getGarments(filters: GarmentFilters = {}) {
    const { categoryId, isActive = true } = filters;

    const queryFilters: GarmentFilters = {
      isActive,
      ...(categoryId !== undefined && { categoryId }),
    };

    return garmentRepository.findGarments(queryFilters);
  },

  /**
   * Retrieves a single garment by ID.
   *
   * @param garmentId - Garment ID to retrieve.
   * @returns Promise resolving to the matching garment plain object.
   * @throws {ApiError} 404 Not Found if garment does not exist.
   */
  async getGarmentById(garmentId: string) {
    return ensureGarmentExists(garmentId);
  },

  /**
   * Updates an existing garment ensuring category existence, active status, and name uniqueness within the category.
   *
   * @param garmentId - Garment ID to update.
   * @param data - Validated garment update properties.
   * @returns Promise resolving to the updated garment plain object.
   * @throws {ApiError} 404 Not Found if garment or target category does not exist.
   * @throws {ApiError} 400 Bad Request if target category is inactive.
   * @throws {ApiError} 409 Conflict if name is already taken within the category by another garment.
   */
  async updateGarment(garmentId: string, data: UpdateGarmentInput) {
    const existingGarment = await ensureGarmentExists(garmentId);

    const existingCategoryId = existingGarment.categoryId ? String(existingGarment.categoryId) : "";
    const targetCategoryId = data.categoryId ?? existingCategoryId;
    const targetName = data.name ?? String(existingGarment.name);

    // Verify target category if category is being changed
    if (data.categoryId && data.categoryId !== existingCategoryId) {
      await ensureActiveCategory(targetCategoryId);
    }

    // Check name uniqueness if name or category changed
    if (data.name || data.categoryId) {
      const garmentWithSameName = await garmentRepository.findGarmentByName(
        targetCategoryId,
        targetName,
      );

      if (
        garmentWithSameName &&
        garmentWithSameName._id.toString() !== garmentId
      ) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Garment with this name already exists in the category",
        );
      }
    }

    const { categoryId, ...restData } = data;
    const garmentData = {
      ...restData,
      ...(categoryId && { categoryId: new Types.ObjectId(categoryId) }),
    };

    const updatedGarment = await garmentRepository.updateGarment(
      garmentId,
      garmentData,
    );

    if (!updatedGarment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Garment not found");
    }

    return updatedGarment;
  },

  /**
   * Soft deletes a garment by setting isActive to false.
   *
   * @param garmentId - Garment ID to disable.
   * @returns Promise resolving to the updated garment plain object.
   * @throws {ApiError} 404 Not Found if garment does not exist.
   */
  async disableGarment(garmentId: string) {
    await ensureGarmentExists(garmentId);

    const disabledGarment = await garmentRepository.disableGarment(garmentId);

    if (!disabledGarment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Garment not found");
    }

    return disabledGarment;
  },

  /**
   * Enables a garment by setting isActive to true.
   *
   * @param garmentId - Garment ID to enable.
   * @returns Promise resolving to the updated garment plain object.
   * @throws {ApiError} 404 Not Found if garment does not exist.
   */
  async enableGarment(garmentId: string) {
    await ensureGarmentExists(garmentId);

    const enabledGarment = await garmentRepository.enableGarment(garmentId);

    if (!enabledGarment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Garment not found");
    }

    return enabledGarment;
  },
};
