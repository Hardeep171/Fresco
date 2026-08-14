import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { garmentService } from "../services/garment.service.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createGarmentSchema,
  garmentIdParamSchema,
  getGarmentsQuerySchema,
  updateGarmentSchema,
} from "../validators/garment.validator.js";

/** Garment controller handling HTTP requests for Garment management. */
export const garmentController = {
  /** Create a new garment. */
  createGarment: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = createGarmentSchema.parse(req.body);

    const garment = await garmentService.createGarment(validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Garment created successfully",
      { garment },
    );
  }),

  /** Retrieve garments, optionally filtering by category ID and active status. */
  getGarments: asyncHandler(async (req: Request, res: Response) => {
    const filters = getGarmentsQuerySchema.parse(req.query);

    const garments = await garmentService.getGarments(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Garments fetched successfully",
      { garments },
    );
  }),

  /** Retrieve a single garment by ID. */
  getGarmentById: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = garmentIdParamSchema.parse(req.params);

    const garment = await garmentService.getGarmentById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Garment fetched successfully",
      { garment },
    );
  }),

  /** Update an existing garment by ID. */
  updateGarment: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params and body
    const { id } = garmentIdParamSchema.parse(req.params);
    const validatedData = updateGarmentSchema.parse(req.body);

    const garment = await garmentService.updateGarment(id, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Garment updated successfully",
      { garment },
    );
  }),

  /** Disable a garment by ID (soft delete). */
  disableGarment: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = garmentIdParamSchema.parse(req.params);

    const garment = await garmentService.disableGarment(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Garment disabled successfully",
      { garment },
    );
  }),

  /** Enable a garment by ID. */
  enableGarment: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = garmentIdParamSchema.parse(req.params);

    const garment = await garmentService.enableGarment(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Garment enabled successfully",
      { garment },
    );
  }),
};
