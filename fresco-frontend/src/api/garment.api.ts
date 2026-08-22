import { apiClient } from "./client";
import {
  Garment,
  GetGarmentsParams,
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
};
