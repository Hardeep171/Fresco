import { StatusCodes } from "http-status-codes";

import { categoryRepository } from "../repositories/category.repository.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validators/category.validator.js";

/** Filter options for querying categories. */
export interface CategoryFilters {
  isActive?: boolean;
}

/**
 * Helper to ensure a category exists by ID, throwing 404 if not found.
 *
 * @param categoryId - Category ID to verify.
 * @returns Promise resolving to the category plain object.
 * @throws {ApiError} 404 Not Found if category does not exist.
 */
async function ensureCategoryExists(categoryId: string) {
  const category = await categoryRepository.findCategoryById(categoryId);

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  return category;
}

/** Service providing business logic for Category module. */
export const categoryService = {
  /**
   * Creates a new category ensuring unique name.
   *
   * @param data - Category creation input properties.
   * @returns Promise resolving to the created category plain object.
   * @throws {ApiError} 409 Conflict if category with the same name exists.
   */
  async createCategory(data: CreateCategoryInput) {
    const existingCategory = await categoryRepository.findCategoryByName(
      data.name,
    );

    if (existingCategory) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Category with this name already exists",
      );
    }

    return categoryRepository.createCategory(data);
  },

  /**
   * Retrieves categories based on filter criteria. Defaults to returning active categories.
   *
   * @param filters - Category query filter options.
   * @returns Promise resolving to an array of category plain objects.
   */
  async getCategories(filters: CategoryFilters = {}) {
    const { isActive = true } = filters;

    return categoryRepository.findCategories({ isActive });
  },

  /**
   * Retrieves a single category by ID.
   *
   * @param categoryId - Category ID to retrieve.
   * @returns Promise resolving to the matching category plain object.
   * @throws {ApiError} 404 Not Found if category does not exist.
   */
  async getCategoryById(categoryId: string) {
    return ensureCategoryExists(categoryId);
  },

  /**
   * Updates an existing category document ensuring name uniqueness if name is changed.
   *
   * @param categoryId - Category ID to update.
   * @param data - Validated category update properties.
   * @returns Promise resolving to the updated category plain object.
   * @throws {ApiError} 404 Not Found if category does not exist.
   * @throws {ApiError} 409 Conflict if new category name is already taken by another category.
   */
  async updateCategory(categoryId: string, data: UpdateCategoryInput) {
    await ensureCategoryExists(categoryId);

    if (data.name) {
      const categoryWithSameName = await categoryRepository.findCategoryByName(
        data.name,
      );

      if (
        categoryWithSameName &&
        categoryWithSameName._id.toString() !== categoryId
      ) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Category with this name already exists",
        );
      }
    }

    const updatedCategory = await categoryRepository.updateCategory(
      categoryId,
      data,
    );

    if (!updatedCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

    return updatedCategory;
  },

  /**
   * Soft deletes a category by setting isActive to false.
   *
   * @param categoryId - Category ID to disable.
   * @returns Promise resolving to the updated category plain object.
   * @throws {ApiError} 404 Not Found if category does not exist.
   */
  async disableCategory(categoryId: string) {
    await ensureCategoryExists(categoryId);

    const disabledCategory = await categoryRepository.disableCategory(categoryId);

    if (!disabledCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

    return disabledCategory;
  },

  /**
   * Enables a category by setting isActive to true.
   *
   * @param categoryId - Category ID to enable.
   * @returns Promise resolving to the updated category plain object.
   * @throws {ApiError} 404 Not Found if category does not exist.
   */
  async enableCategory(categoryId: string) {
    await ensureCategoryExists(categoryId);

    const enabledCategory = await categoryRepository.enableCategory(categoryId);

    if (!enabledCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

    return enabledCategory;
  },
};
