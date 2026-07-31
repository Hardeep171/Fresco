import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { serviceService } from "../services/service.service.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createServiceSchema,
  serviceIdParamSchema,
  updateServiceSchema,
} from "../validators/service.validator.js";

/** Service controller handling HTTP requests for Service management. */
export const serviceController = {
  /** Create a new service. */
  createService: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = createServiceSchema.parse(req.body);

    const service = await serviceService.createService(validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Service created successfully",
      { service },
    );
  }),

  /** Retrieve services, optionally filtering by active status. */
  getServices: asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      ...(req.query.isActive !== undefined && {
        isActive: req.query.isActive === "true",
      }),
    };

    const services = await serviceService.getServices(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Services fetched successfully",
      { services },
    );
  }),

  /** Retrieve a single service by ID. */
  getServiceById: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = serviceIdParamSchema.parse(req.params);

    const service = await serviceService.getServiceById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Service fetched successfully",
      { service },
    );
  }),

  /** Update an existing service by ID. */
  updateService: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params and body
    const { id } = serviceIdParamSchema.parse(req.params);
    const validatedData = updateServiceSchema.parse(req.body);

    const service = await serviceService.updateService(id, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Service updated successfully",
      { service },
    );
  }),

  /** Disable a service by ID (soft delete). */
  disableService: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = serviceIdParamSchema.parse(req.params);

    const service = await serviceService.disableService(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Service disabled successfully",
      { service },
    );
  }),

  /** Enable a service by ID. */
  enableService: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = serviceIdParamSchema.parse(req.params);

    const service = await serviceService.enableService(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Service enabled successfully",
      { service },
    );
  }),
};
