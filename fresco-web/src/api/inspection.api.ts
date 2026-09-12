import { apiClient } from "./client";
import {
  Inspection,
  InspectionFilters,
  InspectionResponse,
  InspectionsResponse,
  CreateInspectionInput,
  UpdateInspectionInput,
} from "../types/inspection.types";
import { ApiResponse } from "../types/api.types";

export const inspectionApi = {
  async getInspectionByOrderId(orderId: string): Promise<Inspection> {
    const response = await apiClient.get<ApiResponse<InspectionResponse>>(
      `/inspections/order/${orderId}`
    );
    return response.data.data.inspection;
  },

  async getInspectionById(id: string): Promise<Inspection> {
    const response = await apiClient.get<ApiResponse<InspectionResponse>>(
      `/inspections/${id}`
    );
    return response.data.data.inspection;
  },

  async getInspections(filters?: InspectionFilters): Promise<Inspection[]> {
    const response = await apiClient.get<ApiResponse<InspectionsResponse>>(
      "/inspections",
      { params: filters }
    );
    return response.data.data.inspections;
  },

  async createInspection(payload: CreateInspectionInput): Promise<Inspection> {
    const response = await apiClient.post<ApiResponse<InspectionResponse>>(
      "/inspections",
      payload
    );
    return response.data.data.inspection;
  },

  async updateInspection(
    id: string,
    payload: UpdateInspectionInput
  ): Promise<Inspection> {
    const response = await apiClient.patch<ApiResponse<InspectionResponse>>(
      `/inspections/${id}`,
      payload
    );
    return response.data.data.inspection;
  },

  async submitInspection(id: string): Promise<Inspection> {
    const response = await apiClient.post<ApiResponse<InspectionResponse>>(
      `/inspections/${id}/submit`
    );
    return response.data.data.inspection;
  },

  async disableInspection(id: string): Promise<Inspection> {
    const response = await apiClient.delete<ApiResponse<InspectionResponse>>(
      `/inspections/${id}`
    );
    return response.data.data.inspection;
  },
};
