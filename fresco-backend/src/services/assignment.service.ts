import { StatusCodes } from "http-status-codes";
import { type QueryFilter as FilterQuery, Types } from "mongoose";

import type {
  AssignmentStatus,
  AssignmentType,
} from "../constants/assignment.constants.js";
import type { OrderStatus } from "../constants/order.constants.js";
import type { UserRole } from "../constants/user.constants.js";
import type { Assignment } from "../models/assignment.model.js";
import { assignmentRepository } from "../repositories/assignment.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { orderService } from "./order.service.js";
import { ApiError } from "../utils/api-error.js";
import type { CreateAssignmentInput } from "../validators/assignment.validator.js";

/** Filter options for querying assignments. */
export interface AssignmentFilters {
  partnerId?: string;
  assignmentType?: AssignmentType;
  status?: AssignmentStatus;
  isActive?: boolean;
}

/** Administrative roles permitted to manage assignments. */
const ALLOWED_ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
];

/** Allowed status transitions graph for an assignment. */
const ALLOWED_STATUS_TRANSITIONS: Record<
  AssignmentStatus,
  AssignmentStatus[]
> = {
  ASSIGNED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Helper to validate assignment status transitions.
 *
 * @param currentStatus - Current status of the assignment.
 * @param nextStatus - Desired next status of the assignment.
 * @returns True if transition is valid.
 * @throws {ApiError} 400 Bad Request if status transition is invalid.
 */
function validateAssignmentStatusTransition(
  currentStatus: AssignmentStatus,
  nextStatus: AssignmentStatus,
) {
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid status transition from '${currentStatus}' to '${nextStatus}'.`,
    );
  }

  return true;
}

/**
 * Helper to ensure an assignment exists by ID, throwing 404 if not found.
 *
 * @param id - Assignment ID to verify.
 * @returns Promise resolving to the assignment plain object.
 * @throws {ApiError} 404 Not Found if assignment does not exist.
 */
async function ensureAssignmentExists(id: string) {
  const assignment = await assignmentRepository.findAssignmentById(id);

  if (!assignment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Assignment not found");
  }

  return assignment;
}

/**
 * Helper to ensure an order exists by ID, throwing 404 if not found.
 *
 * @param orderId - Order ID to verify.
 * @returns Promise resolving to the order plain object.
 * @throws {ApiError} 404 Not Found if order does not exist.
 */
async function ensureOrderExists(orderId: string) {
  return orderService.getOrderById(orderId);
}

/**
 * Helper to determine the target order status based on assignment type and partner action.
 *
 * @param assignmentType - Type of assignment (PICKUP or DELIVERY).
 * @param action - Partner action (ACCEPT or COMPLETE).
 * @returns Target OrderStatus value.
 */
function getNextOrderStatus(
  assignmentType: AssignmentType,
  action: "ACCEPT" | "COMPLETE",
): OrderStatus {
  if (action === "ACCEPT") {
    return assignmentType === "PICKUP" ? "PICKUP_ASSIGNED" : "OUT_FOR_DELIVERY";
  }

  return assignmentType === "PICKUP" ? "PICKED_UP" : "DELIVERED";
}

/**
 * Helper to ensure a user exists, is active, and possesses the DELIVERY_PARTNER role.
 *
 * @param partnerId - User ID to verify.
 * @returns Promise resolving to the user plain object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user is inactive or not a delivery partner.
 */
async function ensureDeliveryPartner(partnerId: string) {
  const user = await userRepository.findUserById(partnerId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User account is inactive");
  }

  if (user.role !== "DELIVERY_PARTNER") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User is not a delivery partner",
    );
  }

  return user;
}

/**
 * Helper to ensure a user exists, is active, and possesses an administrative role.
 *
 * @param adminId - User ID to verify.
 * @returns Promise resolving to the user plain object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user is inactive.
 * @throws {ApiError} 403 Forbidden if user lacks admin role.
 */
async function ensureAdmin(adminId: string) {
  const user = await userRepository.findUserById(adminId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User account is inactive");
  }

  if (!ALLOWED_ADMIN_ROLES.includes(user.role as UserRole)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "User does not have administrative permissions",
    );
  }

  return user;
}

/**
 * Helper to ensure a partner assignment exists, belongs to the partner, and is active.
 *
 * @param assignmentId - Assignment ID to verify.
 * @param partnerId - Delivery partner user ID to verify.
 * @returns Promise resolving to the verified assignment plain object.
 * @throws {ApiError} 404 Not Found if user or assignment does not exist.
 * @throws {ApiError} 403 Forbidden if assignment does not belong to partner.
 * @throws {ApiError} 400 Bad Request if partner is inactive or assignment is inactive.
 */
async function ensurePartnerAssignment(
  assignmentId: string,
  partnerId: string,
) {
  await ensureDeliveryPartner(partnerId);

  const assignment = await ensureAssignmentExists(assignmentId);

  if (String(assignment.partnerId) !== partnerId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized for this assignment",
    );
  }

  if (!assignment.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Assignment is not active");
  }

  return assignment;
}

/** Service providing business logic for Assignment module. */
export const assignmentService = {
  /**
   * Assigns a delivery partner to an order after validating admin privileges, order existence and status, partner status, and assignment uniqueness.
   *
   * @param adminId - ID of the administrative user creating the assignment.
   * @param data - Validated assignment creation input properties.
   * @returns Promise resolving to the created assignment plain object.
   * @throws {ApiError} 404 Not Found if admin, order, or partner does not exist.
   * @throws {ApiError} 400 Bad Request if admin or partner is inactive, partner is invalid, or order status is DELIVERED/CANCELLED.
   * @throws {ApiError} 403 Forbidden if user lacks admin role.
   * @throws {ApiError} 409 Conflict if active assignment already exists for order + assignmentType.
   */
  async assignPartner(adminId: string, data: CreateAssignmentInput) {
    // 1. Verify admin privileges
    await ensureAdmin(adminId);

    // 2. Verify target order exists and is eligible for assignment
    const order = await ensureOrderExists(data.orderId);

    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Assignments cannot be created for completed or cancelled orders",
      );
    }

    // 3. Verify delivery partner exists, is active, and has DELIVERY_PARTNER role
    await ensureDeliveryPartner(data.partnerId);

    // 4. Verify an active assignment for (orderId + assignmentType) does not already exist
    const existingAssignment =
      await assignmentRepository.findAssignmentByOrder(
        data.orderId,
        data.assignmentType,
      );

    if (existingAssignment && existingAssignment.isActive) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Assignment already exists for this order and assignment type",
      );
    }

    const assignmentData = {
      orderId: new Types.ObjectId(data.orderId),
      partnerId: new Types.ObjectId(data.partnerId),
      assignmentType: data.assignmentType,
      assignedBy: new Types.ObjectId(adminId),
      assignedAt: new Date(),
      status: "ASSIGNED" as const,
      ...(data.notes && { notes: data.notes }),
    };

    return assignmentRepository.createAssignment(assignmentData);
  },

  /**
   * Retrieves assignments based on filter criteria. Defaults to returning active assignments.
   *
   * @param filters - Assignment query filter options.
   * @returns Promise resolving to an array of matching assignment plain objects.
   */
  async getAssignments(filters: AssignmentFilters = {}) {
    const { partnerId, assignmentType, status, isActive = true } = filters;

    const queryFilters: FilterQuery<Assignment> = {
      ...(isActive !== undefined && { isActive }),
      ...(partnerId !== undefined && {
        partnerId: new Types.ObjectId(partnerId),
      }),
      ...(assignmentType !== undefined && { assignmentType }),
      ...(status !== undefined && { status }),
    };

    return assignmentRepository.findAssignments(queryFilters);
  },

  /**
   * Retrieves a single assignment by ID.
   *
   * @param id - Assignment ID to retrieve.
   * @returns Promise resolving to the matching assignment plain object.
   * @throws {ApiError} 404 Not Found if assignment does not exist.
   */
  async getAssignmentById(id: string) {
    return ensureAssignmentExists(id);
  },

  /**
   * Retrieves all assignments for a specific delivery partner after verifying partner status.
   *
   * @param partnerId - Delivery partner user ID.
   * @returns Promise resolving to an array of matching assignment plain objects.
   * @throws {ApiError} 404 Not Found if user does not exist.
   * @throws {ApiError} 400 Bad Request if user is inactive or not a delivery partner.
   */
  async getPartnerAssignments(partnerId: string) {
    await ensureDeliveryPartner(partnerId);
    return assignmentRepository.findAssignmentsByPartner(partnerId);
  },

  /**
   * Updates assignment status enforcing strict state transitions.
   *
   * @param id - Assignment ID to update.
   * @param status - Target AssignmentStatus.
   * @returns Promise resolving to the updated assignment plain object.
   * @throws {ApiError} 404 Not Found if assignment does not exist.
   * @throws {ApiError} 400 Bad Request if status transition is invalid.
   */
  async updateAssignmentStatus(id: string, status: AssignmentStatus) {
    const existingAssignment = await ensureAssignmentExists(id);

    validateAssignmentStatusTransition(
      existingAssignment.status as AssignmentStatus,
      status,
    );

    const updateData: Partial<Assignment> = {
      status,
      ...(existingAssignment.status === "ASSIGNED" &&
        status === "ACCEPTED" && { acceptedAt: new Date() }),
      ...(existingAssignment.status === "ACCEPTED" &&
        status === "COMPLETED" && { completedAt: new Date() }),
    };

    const updatedAssignment = await assignmentRepository.updateAssignment(
      id,
      updateData,
    );

    if (!updatedAssignment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Assignment not found");
    }

    return updatedAssignment;
  },

  /**
   * Soft deletes an assignment by setting isActive to false.
   *
   * @param id - Assignment ID to disable.
   * @returns Promise resolving to the updated assignment plain object.
   * @throws {ApiError} 404 Not Found if assignment does not exist.
   */
  async disableAssignment(id: string) {
    await ensureAssignmentExists(id);

    const disabledAssignment =
      await assignmentRepository.disableAssignment(id);

    if (!disabledAssignment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Assignment not found");
    }

    return disabledAssignment;
  },

  /**
   * Accepts an assignment for the authenticated delivery partner and updates the related order status.
   *
   * @param id - Assignment ID to accept.
   * @param partnerId - Authenticated delivery partner user ID.
   * @returns Promise resolving to the updated assignment plain object.
   * @throws {ApiError} 404 Not Found if assignment or user does not exist.
   * @throws {ApiError} 403 Forbidden if the assignment does not belong to the partner.
   * @throws {ApiError} 400 Bad Request if partner is inactive, assignment is inactive, or assignment status is not ASSIGNED.
   */
  async acceptAssignment(id: string, partnerId: string) {
    const assignment = await ensurePartnerAssignment(id, partnerId);

    if (assignment.status !== "ASSIGNED") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Assignment status must be ASSIGNED to accept",
      );
    }

    const updatedAssignment = await assignmentRepository.updateAssignment(
      id,
      {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    );

    if (!updatedAssignment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Assignment not found");
    }

    const nextOrderStatus = getNextOrderStatus(
      assignment.assignmentType as AssignmentType,
      "ACCEPT",
    );

    await orderService.transitionOrderStatus(
      String(assignment.orderId),
      nextOrderStatus,
    );

    return updatedAssignment;
  },

  /**
   * Completes an assignment for the authenticated delivery partner and updates the related order status.
   *
   * @param id - Assignment ID to complete.
   * @param partnerId - Authenticated delivery partner user ID.
   * @returns Promise resolving to the updated assignment plain object.
   * @throws {ApiError} 404 Not Found if assignment or user does not exist.
   * @throws {ApiError} 403 Forbidden if the assignment does not belong to the partner.
   * @throws {ApiError} 400 Bad Request if partner is inactive, assignment is inactive, or assignment status is not ACCEPTED.
   */
  async completeAssignment(id: string, partnerId: string) {
    const assignment = await ensurePartnerAssignment(id, partnerId);

    if (assignment.status !== "ACCEPTED") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Assignment status must be ACCEPTED to complete",
      );
    }

    const updatedAssignment = await assignmentRepository.updateAssignment(
      id,
      {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    );

    if (!updatedAssignment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Assignment not found");
    }

    const nextOrderStatus = getNextOrderStatus(
      assignment.assignmentType as AssignmentType,
      "COMPLETE",
    );

    await orderService.transitionOrderStatus(
      String(assignment.orderId),
      nextOrderStatus,
    );

    return updatedAssignment;
  },
};
