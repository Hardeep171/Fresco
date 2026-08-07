import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type {
  TaskStatus,
  TaskType,
} from "../constants/delivery-task.constants.js";
import {
  deliveryTaskService,
  type DeliveryTaskFilters,
} from "../services/delivery-task.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createDeliveryTaskSchema,
  deliveryTaskIdParamSchema,
  updateTaskStatusSchema,
} from "../validators/delivery-task.validator.js";

/**
 * Helper to extract authenticated user ID from Express request, throwing 401 Unauthorized if missing.
 *
 * @param req - Express request object.
 * @returns Authenticated user ID string.
 * @throws {ApiError} 401 Unauthorized if user context is missing.
 */
function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  return userId;
}

/** Delivery task controller handling HTTP requests for Delivery Task management. */
export const deliveryTaskController = {
  /** Create a new delivery task from an assignment (admin use). */
  createTask: asyncHandler(async (req: Request, res: Response) => {
    const adminId = getAuthenticatedUserId(req);

    // Validate request body
    const validatedData = createDeliveryTaskSchema.parse(req.body);

    const task = await deliveryTaskService.createTask(
      adminId,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Delivery task created successfully",
      { task },
    );
  }),

  /** Retrieve delivery tasks based on query filter criteria. */
  getTasks: asyncHandler(async (req: Request, res: Response) => {
    const filters: DeliveryTaskFilters = {
      ...(req.query.partnerId && {
        partnerId: req.query.partnerId as string,
      }),
      ...(req.query.taskType && {
        taskType: req.query.taskType as TaskType,
      }),
      ...(req.query.status && {
        status: req.query.status as TaskStatus,
      }),
      ...(req.query.isActive !== undefined && {
        isActive: req.query.isActive === "true",
      }),
    };

    const tasks = await deliveryTaskService.getTasks(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Delivery tasks fetched successfully",
      { tasks },
    );
  }),

  /** Retrieve a single delivery task by ID. */
  getTaskById: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = deliveryTaskIdParamSchema.parse(req.params);

    const task = await deliveryTaskService.getTaskById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Delivery task fetched successfully",
      { task },
    );
  }),

  /** Retrieve all delivery tasks for the authenticated delivery partner. */
  getPartnerTasks: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = getAuthenticatedUserId(req);

    const tasks = await deliveryTaskService.getPartnerTasks(partnerId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Partner tasks fetched successfully",
      { tasks },
    );
  }),

  /** Update a delivery task's status by ID. */
  updateTaskStatus: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters and body
    const { id } = deliveryTaskIdParamSchema.parse(req.params);
    const validatedData = updateTaskStatusSchema.parse(req.body);

    const task = await deliveryTaskService.updateTaskStatus(
      id,
      validatedData.status,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Delivery task status updated successfully",
      { task },
    );
  }),

  /** Disable a delivery task by ID (soft delete). */
  disableTask: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = deliveryTaskIdParamSchema.parse(req.params);

    const task = await deliveryTaskService.disableTask(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Delivery task disabled successfully",
      { task },
    );
  }),
};
