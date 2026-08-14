import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { assignmentService } from "../services/assignment.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  assignmentIdParamSchema,
  createAssignmentSchema,
  getAssignmentsQuerySchema,
  updateAssignmentStatusSchema,
} from "../validators/assignment.validator.js";

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

/** Assignment controller handling HTTP requests for Assignment management. */
export const assignmentController = {
  /** Assign a delivery partner to an order (admin use). */
  assignPartner: asyncHandler(async (req: Request, res: Response) => {
    const adminId = getAuthenticatedUserId(req);

    // Validate request body
    const validatedData = createAssignmentSchema.parse(req.body);

    const assignment = await assignmentService.assignPartner(
      adminId,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Partner assigned successfully",
      { assignment },
    );
  }),

  /** Retrieve assignments based on query filter criteria. */
  getAssignments: asyncHandler(async (req: Request, res: Response) => {
    const filters = getAssignmentsQuerySchema.parse(req.query);

    const assignments = await assignmentService.getAssignments(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Assignments fetched successfully",
      { assignments },
    );
  }),

  /** Retrieve a single assignment by ID. */
  getAssignmentById: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = assignmentIdParamSchema.parse(req.params);

    const assignment = await assignmentService.getAssignmentById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Assignment fetched successfully",
      { assignment },
    );
  }),

  /** Retrieve all assignments for the authenticated delivery partner. */
  getPartnerAssignments: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = getAuthenticatedUserId(req);

    const assignments =
      await assignmentService.getPartnerAssignments(partnerId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Partner assignments fetched successfully",
      { assignments },
    );
  }),

  /** Update an assignment's status by ID. */
  updateAssignmentStatus: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters and body
    const { id } = assignmentIdParamSchema.parse(req.params);
    const validatedData = updateAssignmentStatusSchema.parse(req.body);

    const assignment = await assignmentService.updateAssignmentStatus(
      id,
      validatedData.status,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Assignment status updated successfully",
      { assignment },
    );
  }),

  /** Disable an assignment by ID (soft delete). */
  disableAssignment: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = assignmentIdParamSchema.parse(req.params);

    const assignment = await assignmentService.disableAssignment(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Assignment disabled successfully",
      { assignment },
    );
  }),

  /** Accept an assignment (delivery partner use). */
  acceptAssignment: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = getAuthenticatedUserId(req);
    const { id } = assignmentIdParamSchema.parse(req.params);

    const assignment = await assignmentService.acceptAssignment(
      id,
      partnerId,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Assignment accepted successfully",
      { assignment },
    );
  }),

  /** Complete an assignment (delivery partner use). */
  completeAssignment: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = getAuthenticatedUserId(req);
    const { id } = assignmentIdParamSchema.parse(req.params);

    const assignment = await assignmentService.completeAssignment(
      id,
      partnerId,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Assignment completed successfully",
      { assignment },
    );
  }),
};
