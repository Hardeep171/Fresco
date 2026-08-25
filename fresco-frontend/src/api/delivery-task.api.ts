import { apiClient } from "./client";
import {
  DeliveryTask,
  DeliveryTasksResponse,
} from "../types/delivery-task.types";
import { ApiResponse } from "../types/api.types";

/**
 * Delivery Task API service.
 * Connects exclusively to backend Delivery Task endpoints using centralized apiClient.
 */
export const deliveryTaskApi = {
  /**
   * Retrieves all delivery tasks for the currently authenticated delivery partner.
   * Calls: GET /delivery-tasks/partner
   */
  async getPartnerTasks(): Promise<DeliveryTask[]> {
    const response = await apiClient.get<ApiResponse<DeliveryTasksResponse>>(
      "/delivery-tasks/partner"
    );
    return response.data.data.tasks;
  },
};

