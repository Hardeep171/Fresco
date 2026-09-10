import { apiClient } from "./client";
import {
  Pricing,
  GetPricingParams,
  CreatePricingInput,
  UpdatePricingInput,
} from "../types/catalog.types";
import { ApiResponse } from "../types/api.types";

/**
 * Pricing API strictly conforming to FRESCO backend Pricing contracts.
 */
export const pricingApi = {
  /**
   * Retrieve pricing records, optionally filtering by garmentId and serviceId.
   * Backend endpoint: GET /api/v1/pricing
   */
  async getPricing(params: GetPricingParams = {}): Promise<Pricing[]> {
    const response = await apiClient.get<ApiResponse<{ pricing: Pricing[] }>>(
      "/pricing",
      { params }
    );
    return response.data.data.pricing;
  },

  /**
   * Retrieve a single pricing record by ID.
   * Backend endpoint: GET /api/v1/pricing/:id
   */
  async getPricingById(id: string): Promise<Pricing> {
    const response = await apiClient.get<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}`
    );
    return response.data.data.pricing;
  },

  /**
   * Create a new pricing entry (Admin operation).
   * Backend endpoint: POST /api/v1/pricing
   */
  async createPricing(data: CreatePricingInput): Promise<Pricing> {
    const response = await apiClient.post<ApiResponse<{ pricing: Pricing }>>(
      "/pricing",
      data
    );
    return response.data.data.pricing;
  },

  /**
   * Update pricing record by ID (Admin operation).
   * Backend endpoint: PATCH /api/v1/pricing/:id
   */
  async updatePricing(id: string, data: UpdatePricingInput): Promise<Pricing> {
    const response = await apiClient.patch<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}`,
      data
    );
    return response.data.data.pricing;
  },

  /**
   * Enable pricing record by ID (Admin operation).
   * Backend endpoint: PATCH /api/v1/pricing/:id/enable
   */
  async enablePricing(id: string): Promise<Pricing> {
    const response = await apiClient.patch<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}/enable`
    );
    return response.data.data.pricing;
  },

  /**
   * Disable pricing record by ID (soft-delete, Admin operation).
   * Backend endpoint: DELETE /api/v1/pricing/:id
   */
  async disablePricing(id: string): Promise<Pricing> {
    const response = await apiClient.delete<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}`
    );
    return response.data.data.pricing;
  },

  /**
   * Retrieve all pricing entries (both active and inactive) for Admin management.
   * Optionally filtered by garmentId and serviceId.
   */
  async getAllPricingForAdmin(
    filters: { garmentId?: string; serviceId?: string } = {}
  ): Promise<Pricing[]> {
    const [activeList, inactiveList] = await Promise.all([
      pricingApi.getPricing({ isActive: true, ...filters }),
      pricingApi.getPricing({ isActive: false, ...filters }),
    ]);

    const combinedMap = new Map<string, Pricing>();
    activeList.forEach((p) => combinedMap.set(p._id, p));
    inactiveList.forEach((p) => combinedMap.set(p._id, p));

    return Array.from(combinedMap.values());
  },
};

