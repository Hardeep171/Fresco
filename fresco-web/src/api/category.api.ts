import { apiClient } from "./client";
import {
  Category,
  GetCategoriesParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/catalog.types";
import { ApiResponse } from "../types/api.types";

export const categoryApi = {
  async getCategories(params: GetCategoriesParams = {}): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<{ categories: Category[] }>>(
      "/categories",
      { params }
    );
    return response.data.data.categories;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<{ category: Category }>>(
      `/categories/${id}`
    );
    return response.data.data.category;
  },

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    const response = await apiClient.post<ApiResponse<{ category: Category }>>(
      "/categories",
      data
    );
    return response.data.data.category;
  },

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

  async enableCategory(id: string): Promise<Category> {
    const response = await apiClient.patch<ApiResponse<{ category: Category }>>(
      `/categories/${id}/enable`
    );
    return response.data.data.category;
  },

  async disableCategory(id: string): Promise<Category> {
    const response = await apiClient.delete<ApiResponse<{ category: Category }>>(
      `/categories/${id}`
    );
    return response.data.data.category;
  },

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
