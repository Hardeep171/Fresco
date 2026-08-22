import { apiClient } from "./client";
import {
  Pricing,
  GetPricingParams,
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
};
