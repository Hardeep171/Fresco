import { apiClient } from "./client";
import {
  Garment,
  GetGarmentsParams,
  CreateGarmentInput,
  UpdateGarmentInput,
} from "../types/catalog.types";
import { ApiResponse } from "../types/api.types";

/**
 * Garment API service strictly conforming to FRESCO backend Garment contracts.
 */
export const garmentApi = {
  /**
   * Retrieve all garments, optionally filtering by categoryId and active status.
   * Backend endpoint: GET /api/v1/garments
   */
  async getGarments(params: GetGarmentsParams = {}): Promise<Garment[]> {
    const response = await apiClient.get<ApiResponse<{ garments: Garment[] }>>(
      "/garments",
      { params }
    );
    return response.data.data.garments;
  },

  /**
   * Retrieve a single garment by ID.
   * Backend endpoint: GET /api/v1/garments/:id
   */
  async getGarmentById(id: string): Promise<Garment> {
    const response = await apiClient.get<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}`
    );
    return response.data.data.garment;
  },

  /**
   * Create a new garment (Admin operation).
   * Backend endpoint: POST /api/v1/garments
   */
  async createGarment(data: CreateGarmentInput): Promise<Garment> {
    const response = await apiClient.post<ApiResponse<{ garment: Garment }>>(
      "/garments",
      data
    );
    return response.data.data.garment;
  },

  /**
   * Update garment by ID (Admin operation).
   * Allows modifying name, description, icon, displayOrder, and moving categoryId.
   * Backend endpoint: PATCH /api/v1/garments/:id
   */
  async updateGarment(id: string, data: UpdateGarmentInput): Promise<Garment> {
    const response = await apiClient.patch<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}`,
      data
    );
    return response.data.data.garment;
  },

  /**
   * Enable a garment by ID (Admin operation).
   * Backend endpoint: PATCH /api/v1/garments/:id/enable
   */
  async enableGarment(id: string): Promise<Garment> {
    const response = await apiClient.patch<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}/enable`
    );
    return response.data.data.garment;
  },

  /**
   * Disable a garment by ID (soft-delete, Admin operation).
   * Backend endpoint: DELETE /api/v1/garments/:id
   */
  async disableGarment(id: string): Promise<Garment> {
    const response = await apiClient.delete<ApiResponse<{ garment: Garment }>>(
      `/garments/${id}`
    );
    return response.data.data.garment;
  },

  /**
   * Retrieve all garments (both active and inactive) for Admin management.
   * Optionally filtered by categoryId.
   */
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

