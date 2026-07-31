import type { QueryFilter as FilterQuery } from "mongoose";

import { CategoryModel, type Category } from "../models/category.model.js";

/** Repository handling database operations for Category module. */
export const categoryRepository = {
  /**
   * Creates a new category document in the database and returns a plain object.
   *
   * @param data - Category creation properties.
   * @returns Promise resolving to the created category plain object.
   */
  async createCategory(data: Partial<Category>) {
    const category = await CategoryModel.create(data);
    return category.toObject();
  },

  /**
   * Finds category documents matching the specified filter criteria, sorted by display order ascending and creation date ascending.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching category plain objects.
   */
  async findCategories(filters: FilterQuery<Category> = {}) {
    return CategoryModel.find(filters)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()
      .exec();
  },

  /**
   * Finds a single category document by its unique identifier.
   *
   * @param categoryId - The category's unique identifier.
   * @returns Promise resolving to the matching category plain object if found, or null.
   */
  async findCategoryById(categoryId: string) {
    return CategoryModel.findById(categoryId).lean().exec();
  },

  /**
   * Finds a single category document by its exact name (converted to lowercase).
   *
   * @param name - Category name to look up.
   * @returns Promise resolving to the matching category plain object if found, or null.
   */
  async findCategoryByName(name: string) {
    return CategoryModel.findOne({ name: name.toLowerCase().trim() })
      .lean()
      .exec();
  },

  /**
   * Updates a category document by ID and returns a plain object.
   *
   * @param categoryId - The category's unique identifier.
   * @param data - Category fields to update.
   * @returns Promise resolving to the updated category plain object if found, or null.
   */
  async updateCategory(categoryId: string, data: Partial<Category>) {
    return CategoryModel.findByIdAndUpdate(categoryId, data, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Soft deletes a category document by setting isActive to false and returns a plain object.
   *
   * @param categoryId - The category's unique identifier.
   * @returns Promise resolving to the updated category plain object if found, or null.
   */
  async disableCategory(categoryId: string) {
    return CategoryModel.findByIdAndUpdate(
      categoryId,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Enables a category document by setting isActive to true and returns a plain object.
   *
   * @param categoryId - The category's unique identifier.
   * @returns Promise resolving to the updated category plain object if found, or null.
   */
  async enableCategory(categoryId: string) {
    return CategoryModel.findByIdAndUpdate(
      categoryId,
      { isActive: true },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total category documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching category documents.
   */
  async countCategories(filters: FilterQuery<Category> = {}) {
    return CategoryModel.countDocuments(filters).exec();
  },
};
