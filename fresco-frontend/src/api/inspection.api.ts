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

/**
 * Order Inspection API service connecting exclusively to backend Inspection endpoints.
 */
export const inspectionApi = {
  /**
   * Retrieves inspection associated with a specific order ID.
   * Calls: GET /inspections/order/:orderId
   */
  async getInspectionByOrderId(orderId: string): Promise<Inspection> {
    const response = await apiClient.get<ApiResponse<InspectionResponse>>(
      `/inspections/order/${orderId}`
    );
    return response.data.data.inspection;
  },

  /**
   * Retrieves a single inspection by its unique identifier.
   * Calls: GET /inspections/:id
   */
  async getInspectionById(id: string): Promise<Inspection> {
    const response = await apiClient.get<ApiResponse<InspectionResponse>>(
      `/inspections/${id}`
    );
    return response.data.data.inspection;
  },

  /**
   * Retrieves inspections matching filter options.
   * Calls: GET /inspections
   */
  async getInspections(filters?: InspectionFilters): Promise<Inspection[]> {
    const response = await apiClient.get<ApiResponse<InspectionsResponse>>(
      "/inspections",
      { params: filters }
    );
    return response.data.data.inspections;
  },

  /**
   * Creates a new inspection for an order (staff/inspector action).
   * Calls: POST /inspections
   */
  async createInspection(payload: CreateInspectionInput): Promise<Inspection> {
    const response = await apiClient.post<ApiResponse<InspectionResponse>>(
      "/inspections",
      payload
    );
    return response.data.data.inspection;
  },

  /**
   * Updates a DRAFT inspection (staff/inspector action).
   * Calls: PATCH /inspections/:id
   */
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

  /**
   * Submits a DRAFT inspection, transitioning inspection to SUBMITTED and order to IN_PROCESS.
   * Calls: POST /inspections/:id/submit
   */
  async submitInspection(id: string): Promise<Inspection> {
    const response = await apiClient.post<ApiResponse<InspectionResponse>>(
      `/inspections/${id}/submit`
    );
    return response.data.data.inspection;
  },

  /**
   * Soft deletes a DRAFT inspection.
   * Calls: DELETE /inspections/:id
   */
  async disableInspection(id: string): Promise<Inspection> {
    const response = await apiClient.delete<ApiResponse<InspectionResponse>>(
      `/inspections/${id}`
    );
    return response.data.data.inspection;
  },
};
