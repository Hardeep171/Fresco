import { apiClient } from "./client";
import {
  Garment,
  GetGarmentsParams,
  CreateGarmentInput,
  UpdateGarmentInput,
} from "../types/catalog.types";
import { ApiResponse } from "../types/api.types";

export const garmentApi = {
  async getGarments(params: GetGarmentsParams = {}): Promise<Garment[]> {
    const response = await apiClient.get<ApiResponse<{ garments: Garment[] }>>(
      "/garments",
      { params }
    );
    return response.data.data.garments;
  },

  async getGarmentById(id: string): Promise<Garment> {
    const response = await apiClient.get<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}`
    );
    return response.data.data.garment;
  },

  async createGarment(data: CreateGarmentInput): Promise<Garment> {
    const response = await apiClient.post<ApiResponse<{ garment: Garment }>>(
      "/garments",
      data
    );
    return response.data.data.garment;
  },

  async updateGarment(id: string, data: UpdateGarmentInput): Promise<Garment> {
    const response = await apiClient.patch<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}`,
      data
    );
    return response.data.data.garment;
  },

  async enableGarment(id: string): Promise<Garment> {
    const response = await apiClient.patch<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}/enable`
    );
    return response.data.data.garment;
  },

  async disableGarment(id: string): Promise<Garment> {
    const response = await apiClient.delete<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}`
    );
    return response.data.data.garment;
  },

  async getAllGarmentsForAdmin(categoryId?: string): Promise<Garment[]> {
    const [activeList, inactiveList] = await Promise.all([
      garmentApi.getGarments({ isActive: true, ...(categoryId && { categoryId }) }),
      garmentApi.getGarments({ isActive: false, ...(categoryId && { categoryId }) }),
    ]);

    const combinedMap = new Map<string, Garment>();
    activeList.forEach((g) => combinedMap.set(g._id, g));
    inactiveList.forEach((g) => combinedMap.set(g._id, g));

    return Array.from(combinedMap.values()).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  },
};
