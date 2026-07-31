import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { pricingService } from "../services/pricing.service.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createPricingSchema,
  pricingIdParamSchema,
  updatePricingSchema,
} from "../validators/pricing.validator.js";

/** Pricing controller handling HTTP requests for Pricing management. */
export const pricingController = {
  /** Create a new pricing entry. */
  createPricing: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = createPricingSchema.parse(req.body);

    const pricing = await pricingService.createPricing(validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Pricing created successfully",
      { pricing },
    );
  }),

  /** Retrieve pricing records, optionally filtering by garmentId, serviceId, and active status. */
  getPricing: asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      ...(req.query.garmentId && {
        garmentId: req.query.garmentId as string,
      }),
      ...(req.query.serviceId && {
        serviceId: req.query.serviceId as string,
      }),
      ...(req.query.isActive !== undefined && {
        isActive: req.query.isActive === "true",
      }),
    };

    const pricing = await pricingService.getPricing(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Pricing records fetched successfully",
      { pricing },
    );
  }),

  /** Retrieve a single pricing entry by ID. */
  getPricingById: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = pricingIdParamSchema.parse(req.params);

    const pricing = await pricingService.getPricingById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Pricing fetched successfully",
      { pricing },
    );
  }),

  /** Update an existing pricing entry by ID. */
  updatePricing: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params and body
    const { id } = pricingIdParamSchema.parse(req.params);
    const validatedData = updatePricingSchema.parse(req.body);

    const pricing = await pricingService.updatePricing(id, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Pricing updated successfully",
      { pricing },
    );
  }),

  /** Disable a pricing entry by ID (soft delete). */
  disablePricing: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = pricingIdParamSchema.parse(req.params);

    const pricing = await pricingService.disablePricing(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Pricing disabled successfully",
      { pricing },
    );
  }),

  /** Enable a pricing entry by ID. */
  enablePricing: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = pricingIdParamSchema.parse(req.params);

    const pricing = await pricingService.enablePricing(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Pricing enabled successfully",
      { pricing },
    );
  }),
};
