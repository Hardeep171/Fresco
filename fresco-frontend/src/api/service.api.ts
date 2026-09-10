import { apiClient } from "./client";
import {
  Service,
  GetServicesParams,
  CreateServiceInput,
  UpdateServiceInput,
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

  /**
   * Create a new service (Admin operation).
   * Backend endpoint: POST /api/v1/services
   */
  async createService(data: CreateServiceInput): Promise<Service> {
    const response = await apiClient.post<ApiResponse<{ service: Service }>>(
      "/services",
      data
    );
    return response.data.data.service;
  },

  /**
   * Update service by ID (Admin operation).
   * Backend endpoint: PATCH /api/v1/services/:id
   */
  async updateService(id: string, data: UpdateServiceInput): Promise<Service> {
    const response = await apiClient.patch<ApiResponse<{ service: Service }>>(
      `/services/${id}`,
      data
    );
    return response.data.data.service;
  },

  /**
   * Enable a service by ID (Admin operation).
   * Backend endpoint: PATCH /api/v1/services/:id/enable
   */
  async enableService(id: string): Promise<Service> {
    const response = await apiClient.patch<ApiResponse<{ service: Service }>>(
      `/services/${id}/enable`
    );
    return response.data.data.service;
  },

  /**
   * Disable a service by ID (soft-delete, Admin operation).
   * Backend endpoint: DELETE /api/v1/services/:id
   */
  async disableService(id: string): Promise<Service> {
    const response = await apiClient.delete<ApiResponse<{ service: Service }>>(
      `/services/${id}`
    );
    return response.data.data.service;
  },

  /**
   * Retrieve all services (both active and inactive) for Admin management.
   */
  async getAllServicesForAdmin(): Promise<Service[]> {
    const [activeList, inactiveList] = await Promise.all([
      serviceApi.getServices({ isActive: true }),
      serviceApi.getServices({ isActive: false }),
    ]);

    const combinedMap = new Map<string, Service>();
    activeList.forEach((s) => combinedMap.set(s._id, s));
    inactiveList.forEach((s) => combinedMap.set(s._id, s));

    return Array.from(combinedMap.values()).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  },
};

