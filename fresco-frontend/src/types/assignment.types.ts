import { AssignmentStatus, AssignmentType } from "../constants/assignment.constants";
import { Order } from "./order.types";
import { User } from "./auth.types";


/**
 * FRESCO Partner Assignment Entity.
 */
export interface Assignment {
  _id: string;
  orderId: string | Order;
  partnerId: string | User;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  assignedBy: string | User;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFilters {
  assignmentType?: AssignmentType;
  status?: AssignmentStatus;
  isActive?: boolean;
}

export interface AssignmentResponse {
  assignment: Assignment;
}

export interface AssignmentsResponse {
  assignments: Assignment[];
}
