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

};
