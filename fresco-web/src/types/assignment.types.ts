import { AssignmentStatus, AssignmentType } from "../constants/assignment.constants";
import { Order } from "./order.types";
import { User } from "./auth.types";

export interface Assignment {
  _id: string;
  orderId: string | Order;
  partnerId?: string | User;
  deliveryPartnerId?: string | User;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  assignedBy?: string | User;
  assignedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFilters {
  orderId?: string;
  partnerId?: string;
  deliveryPartnerId?: string;
  assignmentType?: AssignmentType;
  status?: AssignmentStatus | string;
  isActive?: boolean;
}

export interface CreateAssignmentInput {
  orderId: string;
  partnerId?: string;
  deliveryPartnerId?: string;
  assignmentType: AssignmentType;
  notes?: string;
}

export interface AssignmentResponse {
  assignment: Assignment;
}

export interface AssignmentsResponse {
  assignments: Assignment[];
}
