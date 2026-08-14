import { StatusCodes } from "http-status-codes";
import { type QueryFilter as FilterQuery, Types } from "mongoose";

import type {
  TaskStatus,
  TaskType,
} from "../constants/delivery-task.constants.js";
import type { UserRole } from "../constants/user.constants.js";
import type { DeliveryTask } from "../models/delivery-task.model.js";
import { deliveryTaskRepository } from "../repositories/delivery-task.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { assignmentService } from "./assignment.service.js";
import { ApiError } from "../utils/api-error.js";
import type { CreateDeliveryTaskInput } from "../validators/delivery-task.validator.js";

/** Filter options for querying delivery tasks. */
export interface DeliveryTaskFilters {
  partnerId?: string;
  taskType?: TaskType;
  status?: TaskStatus;
  isActive?: boolean;
}

/** Administrative roles permitted to manage delivery tasks. */
const ALLOWED_ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
];

/** Allowed status transitions graph for a delivery task. */
const ALLOWED_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Helper to ensure a delivery task exists by ID, throwing 404 if not found.
 *
 * @param taskId - Delivery task ID to verify.
 * @returns Promise resolving to the delivery task plain object.
 * @throws {ApiError} 404 Not Found if delivery task does not exist.
 */
async function ensureTaskExists(taskId: string) {
  const task = await deliveryTaskRepository.findTaskById(taskId);

  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Delivery task not found");
  }

  return task;
}

/**
 * Helper to ensure an assignment exists by ID by delegating to Assignment service, throwing 404 if not found.
 *
 * @param assignmentId - Assignment ID to verify.
 * @returns Promise resolving to the assignment plain object.
 * @throws {ApiError} 404 Not Found if assignment does not exist.
 */
async function ensureAssignmentExists(assignmentId: string) {
  return assignmentService.getAssignmentById(assignmentId);
}

/**
 * Helper to ensure a user exists, is active, and possesses the DELIVERY_PARTNER role.
 *
 * @param partnerId - User ID to verify.
 * @returns Promise resolving to the user plain object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user is inactive or not a delivery partner.
 */
async function ensurePartner(partnerId: string) {
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
 * Helper to validate delivery task status transitions.
 *
 * @param currentStatus - Current status of the delivery task.
 * @param nextStatus - Desired next status of the delivery task.
 * @returns True if transition is valid.
 * @throws {ApiError} 400 Bad Request if status transition is invalid.
 */
function validateTaskStatusTransition(
  currentStatus: TaskStatus,
  nextStatus: TaskStatus,
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

/** Service providing business logic for Delivery Task module. */
export const deliveryTaskService = {
  /**
   * Creates a new delivery task from an assignment after validating admin privileges, assignment existence, and task uniqueness.
   *
   * @param adminId - ID of the administrative user creating the delivery task.
   * @param data - Validated delivery task creation input properties.
   * @returns Promise resolving to the created delivery task plain object.
   * @throws {ApiError} 404 Not Found if admin or assignment does not exist.
   * @throws {ApiError} 400 Bad Request if admin is inactive.
   * @throws {ApiError} 403 Forbidden if user lacks admin role.
   * @throws {ApiError} 409 Conflict if an active task already exists for the assignment.
   */
  async createTask(adminId: string, data: CreateDeliveryTaskInput) {
    // 1. Verify admin privileges
    await ensureAdmin(adminId);

    // 2. Verify target assignment exists (reusing Assignment service)
    const assignment = await ensureAssignmentExists(data.assignmentId);

    // 3. Verify assignment status is eligible for task creation
    if (
      assignment.status === "COMPLETED" ||
      assignment.status === "CANCELLED"
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Tasks cannot be created for completed or cancelled assignments",
      );
    }

    // 4. Verify an active task for the assignment does not already exist
    const existingTask = await deliveryTaskRepository.findTaskByAssignment(
      data.assignmentId,
    );

    if (existingTask && existingTask.isActive) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Task already exists for this assignment",
      );
    }

    // 4. Build task entirely from Assignment
    const taskData = {
      assignmentId: new Types.ObjectId(data.assignmentId),
      orderId: new Types.ObjectId(String(assignment.orderId)),
      partnerId: new Types.ObjectId(String(assignment.partnerId)),
      taskType: assignment.assignmentType as TaskType,
      status: "PENDING" as const,
      isActive: true,
      ...(data.notes && { notes: data.notes }),
    };

    return deliveryTaskRepository.createTask(taskData);
  },

  /**
   * Retrieves delivery tasks based on filter criteria. Defaults to returning active tasks.
   *
   * @param filters - Delivery task query filter options.
   * @returns Promise resolving to an array of matching delivery task plain objects.
   */
  async getTasks(filters: DeliveryTaskFilters = {}) {
    const { partnerId, taskType, status, isActive = true } = filters;

    const queryFilters: FilterQuery<DeliveryTask> = {
      ...(isActive !== undefined && { isActive }),
      ...(partnerId !== undefined && {
        partnerId: new Types.ObjectId(partnerId),
      }),
      ...(taskType !== undefined && { taskType }),
      ...(status !== undefined && { status }),
    };

    return deliveryTaskRepository.findTasks(queryFilters);
  },

  /**
   * Retrieves a single delivery task by ID.
   *
   * @param taskId - Delivery task ID to retrieve.
   * @returns Promise resolving to the matching delivery task plain object.
   * @throws {ApiError} 404 Not Found if delivery task does not exist.
   */
  async getTaskById(taskId: string) {
    return ensureTaskExists(taskId);
  },

  /**
   * Retrieves all delivery tasks for a specific delivery partner after verifying partner status.
   *
   * @param partnerId - Delivery partner user ID.
   * @returns Promise resolving to an array of matching delivery task plain objects.
   * @throws {ApiError} 404 Not Found if user does not exist.
   * @throws {ApiError} 400 Bad Request if user is inactive or not a delivery partner.
   */
  async getPartnerTasks(partnerId: string) {
    await ensurePartner(partnerId);
    return deliveryTaskRepository.findTasksByPartner(partnerId);
  },

  /**
   * Updates a delivery task's status enforcing strict state transitions.
   *
   * @param taskId - Delivery task ID to update.
   * @param status - Target TaskStatus value.
   * @returns Promise resolving to the updated delivery task plain object.
   * @throws {ApiError} 404 Not Found if delivery task does not exist.
   * @throws {ApiError} 400 Bad Request if status transition is invalid.
   */
  async updateTaskStatus(taskId: string, status: TaskStatus) {
    const existingTask = await ensureTaskExists(taskId);

    validateTaskStatusTransition(
      existingTask.status as TaskStatus,
      status,
    );

    const updateData: Partial<DeliveryTask> = {
      status,
      ...(existingTask.status === "ACCEPTED" &&
        status === "IN_PROGRESS" && { startedAt: new Date() }),
      ...(existingTask.status === "IN_PROGRESS" &&
        status === "COMPLETED" && { completedAt: new Date() }),
    };

    const updatedTask = await deliveryTaskRepository.updateTask(
      taskId,
      updateData,
    );

    if (!updatedTask) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Delivery task not found");
    }

    return updatedTask;
  },

  /**
   * Soft deletes a delivery task by setting isActive to false.
   *
   * @param taskId - Delivery task ID to disable.
   * @returns Promise resolving to the updated delivery task plain object.
   * @throws {ApiError} 404 Not Found if delivery task does not exist.
   */
  async disableTask(taskId: string) {
    await ensureTaskExists(taskId);

    const disabledTask = await deliveryTaskRepository.disableTask(taskId);

    if (!disabledTask) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Delivery task not found");
    }

    return disabledTask;
  },
};
