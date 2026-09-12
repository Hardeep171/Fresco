import { apiClient } from "./client";
import {
  Assignment,
  AssignmentResponse,
  AssignmentsResponse,
} from "../types/assignment.types";
import { ApiResponse } from "../types/api.types";


/**
 * Delivery Partner Assignment API service.
 * Connects exclusively to backend Assignment endpoints using centralized apiClient.
 */
export const assignmentApi = {
  /**
   * Retrieves all assignments for the currently authenticated delivery partner.
   * Calls: GET /assignments/partner
   */
  async getPartnerAssignments(): Promise<Assignment[]> {
    const response = await apiClient.get<ApiResponse<AssignmentsResponse>>(
      "/assignments/partner"
    );
    return response.data.data.assignments;
  },

  /**
   * Accepts an assigned pickup or delivery task for the authenticated delivery partner.
   * Calls: PATCH /assignments/:id/accept
   * Backend automatically updates the associated order status (PICKUP_ASSIGNED or OUT_FOR_DELIVERY).
   */
  async acceptAssignment(id: string): Promise<Assignment> {
    const response = await apiClient.patch<ApiResponse<AssignmentResponse>>(
      `/assignments/${id}/accept`
    );
    return response.data.data.assignment;
  },

  /**
   * Completes an accepted pickup or delivery assignment for the authenticated delivery partner.
   * Calls: PATCH /assignments/:id/complete
   * Backend automatically updates the associated order status (PICKED_UP or DELIVERED).
   */
  async completeAssignment(id: string): Promise<Assignment> {
    const response = await apiClient.patch<ApiResponse<AssignmentResponse>>(
      `/assignments/${id}/complete`
    );
    return response.data.data.assignment;
  },

  /**
   * Admin: Retrieve all assignments across the system with optional filters.
   * Calls: GET /assignments
   */
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

  /**
   * Admin: Assign a delivery partner to an order.
   * Calls: POST /assignments
   */
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

  /**
   * Admin: Update assignment status.
   * Calls: PATCH /assignments/:id/status
   */
  async updateAssignmentStatus(id: string, status: string): Promise<Assignment> {
    const response = await apiClient.patch<ApiResponse<AssignmentResponse>>(
      `/assignments/${id}/status`,
      { status }
    );
    return response.data.data.assignment;
  },

  /**
   * Admin: Disable/cancel assignment.
   * Calls: DELETE /assignments/:id
   */
  async disableAssignment(id: string): Promise<void> {
    await apiClient.delete(`/assignments/${id}`);
  },
};
