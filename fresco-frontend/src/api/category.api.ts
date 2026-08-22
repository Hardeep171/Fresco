import { apiClient } from "./client";
import {
  Category,
  GetCategoriesParams,
} from "../types/catalog.types";
import { ApiResponse } from "../types/api.types";

/**
 * Category API service strictly conforming to FRESCO backend Category contracts.
 */
export const categoryApi = {
  /**
   * Retrieve all active categories (or filtered by isActive).
   * Backend endpoint: GET /api/v1/categories
   */
  async getCategories(params: GetCategoriesParams = {}): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<{ categories: Category[] }>>(
      "/categories",
      { params }
    );
    return response.data.data.categories;
  },

  /**
   * Retrieve a single category by ID.
   * Backend endpoint: GET /api/v1/categories/:id
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<{ category: Category }>>(
      `/categories/${id}`
    );
    return response.data.data.category;
  },
};
