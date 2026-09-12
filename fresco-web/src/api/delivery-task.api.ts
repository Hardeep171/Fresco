import { apiClient } from "./client";
import {
  DeliveryTask,
  DeliveryTasksResponse,
} from "../types/delivery-task.types";
import { ApiResponse } from "../types/api.types";

export const deliveryTaskApi = {
  async getPartnerTasks(): Promise<DeliveryTask[]> {
    const response = await apiClient.get<ApiResponse<DeliveryTasksResponse>>(
      "/delivery-tasks/partner"
    );
    return response.data.data.tasks;
  },
};
