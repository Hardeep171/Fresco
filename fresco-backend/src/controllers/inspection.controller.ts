import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { InspectionStatus } from "../constants/inspection.constants.js";
import {
  inspectionService,
  type InspectionFilters,
} from "../services/inspection.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createInspectionSchema,
  inspectionIdParamSchema,
  orderIdParamSchema,
  updateInspectionSchema,
} from "../validators/inspection.validator.js";

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

/** Inspection controller handling HTTP requests for Order Inspection management. */
export const inspectionController = {
  /** Create a new order inspection (admin/inspector operation). */
  createInspection: asyncHandler(async (req: Request, res: Response) => {
    const adminId = getAuthenticatedUserId(req);

    // Validate request body
    const validatedData = createInspectionSchema.parse(req.body);

    const inspection = await inspectionService.createInspection(
      adminId,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Inspection created successfully",
      { inspection },
    );
  }),

  /** Retrieve order inspections based on query filter criteria. */
  getInspections: asyncHandler(async (req: Request, res: Response) => {
    const filters: InspectionFilters = {
      ...(req.query.orderId && {
        orderId: req.query.orderId as string,
      }),
      ...(req.query.inspectorId && {
        inspectorId: req.query.inspectorId as string,
      }),
      ...(req.query.status && {
        status: req.query.status as InspectionStatus,
      }),
      ...(req.query.isActive !== undefined && {
        isActive: req.query.isActive === "true",
      }),
    };

    const inspections = await inspectionService.getInspections(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Inspections fetched successfully",
      { inspections },
    );
  }),

  /** Retrieve a single inspection by ID. */
  getInspectionById: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = inspectionIdParamSchema.parse(req.params);

    const inspection = await inspectionService.getInspectionById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Inspection fetched successfully",
      { inspection },
    );
  }),

  /** Retrieve inspection associated with a specific order ID. */
  getInspectionByOrderId: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { orderId } = orderIdParamSchema.parse(req.params);

    const inspection = await inspectionService.getInspectionByOrderId(orderId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Inspection fetched successfully",
      { inspection },
    );
  }),

  /** Submit a DRAFT inspection by ID (admin/inspector operation). */
  submitInspection: asyncHandler(async (req: Request, res: Response) => {
    const adminId = getAuthenticatedUserId(req);

    // Validate route parameters
    const { id } = inspectionIdParamSchema.parse(req.params);

    const inspection = await inspectionService.submitInspection(id, adminId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Inspection submitted successfully",
      { inspection },
    );
  }),

  /** Update a DRAFT inspection by ID. */
  updateInspection: asyncHandler(async (req: Request, res: Response) => {
    const adminId = getAuthenticatedUserId(req);

    // Validate route parameters and body
    const { id } = inspectionIdParamSchema.parse(req.params);
    const validatedData = updateInspectionSchema.parse(req.body);

    const inspection = await inspectionService.updateInspection(
      id,
      adminId,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Inspection updated successfully",
      { inspection },
    );
  }),

  /** Disable an inspection by ID (soft delete). */
  disableInspection: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = inspectionIdParamSchema.parse(req.params);

    const inspection = await inspectionService.disableInspection(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Inspection disabled successfully",
      { inspection },
    );
  }),
};
