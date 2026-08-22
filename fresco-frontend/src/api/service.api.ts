import { apiClient } from "./client";
import {
  Service,
  GetServicesParams,
} from "../types/catalog.types";
import { ApiResponse } from "../types/api.types";

/**
 * Service API strictly conforming to FRESCO backend Service contracts.
 */
export const serviceApi = {
  /**
   * Retrieve all active services.
   * Backend endpoint: GET /api/v1/services
   */
  async getServices(params: GetServicesParams = {}): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<{ services: Service[] }>>(
      "/services",
      { params }
    );
    return response.data.data.services;
  },

  /**
   * Retrieve a single service by ID.
   * Backend endpoint: GET /api/v1/services/:id
   */
  async getServiceById(id: string): Promise<Service> {
    const response = await apiClient.get<ApiResponse<{ service: Service }>>(
      `/services/${id}`
    );
    return response.data.data.service;
  },
};
