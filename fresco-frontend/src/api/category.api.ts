import { apiClient } from "./client";
import {
  Category,
  GetCategoriesParams,
  CreateCategoryInput,
  UpdateCategoryInput,
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

  /**
   * Create a new category (Admin operation).
   * Backend endpoint: POST /api/v1/categories
   */
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    const response = await apiClient.post<ApiResponse<{ category: Category }>>(
      "/categories",
      data
    );
    return response.data.data.category;
  },

  /**
   * Update category by ID (Admin operation).
   * Backend endpoint: PATCH /api/v1/categories/:id
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryInput
  ): Promise<Category> {
    const response = await apiClient.patch<ApiResponse<{ category: Category }>>(
      `/categories/${id}`,
      data
    );
    return response.data.data.category;
  },

  /**
   * Enable a category by ID (Admin operation).
   * Backend endpoint: PATCH /api/v1/categories/:id/enable
   */
  async enableCategory(id: string): Promise<Category> {
    const response = await apiClient.patch<ApiResponse<{ category: Category }>>(
      `/categories/${id}/enable`
    );
    return response.data.data.category;
  },

  /**
   * Disable a category by ID (soft-delete, Admin operation).
   * Backend endpoint: DELETE /api/v1/categories/:id
   */
  async disableCategory(id: string): Promise<Category> {
    const response = await apiClient.delete<ApiResponse<{ category: Category }>>(
      `/categories/${id}`
    );
    return response.data.data.category;
  },

  /**
   * Retrieve all categories (both active and inactive) for Admin management.
   * Leverages backend query filters and returns a combined ordered list.
   */
  async getAllCategoriesForAdmin(): Promise<Category[]> {
    const [activeList, inactiveList] = await Promise.all([
      categoryApi.getCategories({ isActive: true }),
      categoryApi.getCategories({ isActive: false }),
    ]);

    const combinedMap = new Map<string, Category>();
    activeList.forEach((c) => combinedMap.set(c._id, c));
    inactiveList.forEach((c) => combinedMap.set(c._id, c));

    return Array.from(combinedMap.values()).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  },
};

