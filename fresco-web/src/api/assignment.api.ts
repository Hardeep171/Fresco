import { apiClient } from "./client";
import {
  Assignment,
  AssignmentResponse,
  AssignmentsResponse,
} from "../types/assignment.types";
import { ApiResponse } from "../types/api.types";

export const assignmentApi = {
  async getPartnerAssignments(): Promise<Assignment[]> {
    const response = await apiClient.get<ApiResponse<AssignmentsResponse>>(
      "/assignments/partner"
    );
    return response.data.data.assignments;
  },

  async acceptAssignment(id: string): Promise<Assignment> {
    const response = await apiClient.patch<ApiResponse<AssignmentResponse>>(
      `/assignments/${id}/accept`
    );
    return response.data.data.assignment;
  },

  async completeAssignment(id: string): Promise<Assignment> {
    const response = await apiClient.patch<ApiResponse<AssignmentResponse>>(
      `/assignments/${id}/complete`
    );
    return response.data.data.assignment;
  },

  async getAllAssignments(filters?: {
    orderId?: string;
    deliveryPartnerId?: string;
    status?: string;
    isActive?: boolean;
    assignmentType?: "PICKUP" | "DELIVERY";
  }): Promise<Assignment[]> {
    const response = await apiClient.get<ApiResponse<AssignmentsResponse>>(
      "/assignments",
      { params: filters }
    );
    return response.data.data.assignments;
  },

  async assignPartner(data: {
    orderId: string;
    partnerId?: string;
    deliveryPartnerId?: string;
    assignmentType?: "PICKUP" | "DELIVERY";
    notes?: string;
  }): Promise<Assignment> {
    const payload = {
      orderId: data.orderId,
      partnerId: data.partnerId || data.deliveryPartnerId,
      deliveryPartnerId: data.deliveryPartnerId || data.partnerId,
      assignmentType: data.assignmentType,
      notes: data.notes,
    };
    const response = await apiClient.post<ApiResponse<AssignmentResponse>>(
      "/assignments",
      payload
    );
    return response.data.data.assignment;
  },

  async updateAssignmentStatus(id: string, status: string): Promise<Assignment> {
    const response = await apiClient.patch<ApiResponse<AssignmentResponse>>(
      `/assignments/${id}/status`,
      { status }
    );
    return response.data.data.assignment;
  },

  async disableAssignment(id: string): Promise<void> {
    await apiClient.delete(`/assignments/${id}`);
  },
};
