import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { addressService } from "../services/address.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  addressIdParamSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.validator.js";

/** Address controller handling HTTP requests for Address management. */
export const addressController = {
  /** Create a new address for the authenticated user. */
  createAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // Validate request body
    const validatedData = createAddressSchema.parse(req.body);

    const address = await addressService.createAddress(userId, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Address created successfully",
      { address },
    );
  }),

  /** Retrieve all addresses for the authenticated user. */
  getAddresses: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    const addresses = await addressService.getAddresses(userId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Addresses fetched successfully",
      { addresses },
    );
  }),

  /** Retrieve a single address by ID for the authenticated user. */
  getAddressById: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // Validate request params
    const { id } = addressIdParamSchema.parse(req.params);

    const address = await addressService.getAddressById(userId, id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Address fetched successfully",
      { address },
    );
  }),

  /** Update an existing address by ID for the authenticated user. */
  updateAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // Validate request params and body
    const { id } = addressIdParamSchema.parse(req.params);
    const validatedData = updateAddressSchema.parse(req.body);

    const address = await addressService.updateAddress(userId, id, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Address updated successfully",
      { address },
    );
  }),

  /** Delete an address by ID for the authenticated user. */
  deleteAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // Validate request params
    const { id } = addressIdParamSchema.parse(req.params);

    const result = await addressService.deleteAddress(userId, id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      result.message,
      undefined,
    );
  }),

  /** Set an address as default by ID for the authenticated user. */
  setDefaultAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // Validate request params
    const { id } = addressIdParamSchema.parse(req.params);

    const address = await addressService.setDefaultAddress(userId, id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Default address updated successfully",
      { address },
    );
  }),
};
