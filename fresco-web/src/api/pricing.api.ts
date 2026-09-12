import { apiClient } from "./client";
import {
  Pricing,
  GetPricingParams,
  CreatePricingInput,
  UpdatePricingInput,
} from "../types/catalog.types";
import { ApiResponse } from "../types/api.types";

export const pricingApi = {
  async getPricing(params: GetPricingParams = {}): Promise<Pricing[]> {
    const response = await apiClient.get<ApiResponse<{ pricing: Pricing[] }>>(
      "/pricing",
      { params }
    );
    return response.data.data.pricing;
  },

  async getPricingById(id: string): Promise<Pricing> {
    const response = await apiClient.get<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}`
    );
    return response.data.data.pricing;
  },

  async createPricing(data: CreatePricingInput): Promise<Pricing> {
    const response = await apiClient.post<ApiResponse<{ pricing: Pricing }>>(
      "/pricing",
      data
    );
    return response.data.data.pricing;
  },

  async updatePricing(id: string, data: UpdatePricingInput): Promise<Pricing> {
    const response = await apiClient.patch<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}`,
      data
    );
    return response.data.data.pricing;
  },

  async enablePricing(id: string): Promise<Pricing> {
    const response = await apiClient.patch<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}/enable`
    );
    return response.data.data.pricing;
  },

  async disablePricing(id: string): Promise<Pricing> {
    const response = await apiClient.delete<ApiResponse<{ pricing: Pricing }>>(
      `/pricing/${id}`
    );
    return response.data.data.pricing;
  },

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
