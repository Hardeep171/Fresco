import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { OrderStatus, PaymentStatus } from "../constants/order.constants.js";
import { orderService } from "../services/order.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createOrderSchema,
  orderIdParamSchema,
  updateOrderSchema,
} from "../validators/order.validator.js";

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

/** Order controller handling HTTP requests for Order management. */
export const orderController = {
  /** Create a new order for the authenticated user from their active cart. */
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    // Validate request body
    const validatedData = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder(userId, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Order created successfully",
      { order },
    );
  }),

  /** Retrieve all orders across the system (admin use). */
  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      ...(req.query.status && {
        status: req.query.status as OrderStatus,
      }),
      ...(req.query.paymentStatus && {
        paymentStatus: req.query.paymentStatus as PaymentStatus,
      }),
      ...(req.query.userId && {
        userId: String(req.query.userId),
      }),
    };

    const orders = await orderService.getOrders(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Orders fetched successfully",
      { orders },
    );
  }),

  /** Retrieve a single order by ID. */
  getOrderById: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = orderIdParamSchema.parse(req.params);

    const order = await orderService.getOrderById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Order fetched successfully",
      { order },
    );
  }),

  /** Retrieve all orders for the authenticated user. */
  getUserOrders: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    const orders = await orderService.getUserOrders(userId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "User orders fetched successfully",
      { orders },
    );
  }),

  /** Update an order's lifecycle status by ID. */
  updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters and body
    const { id } = orderIdParamSchema.parse(req.params);
    const validatedData = updateOrderSchema.parse(req.body);

    if (!validatedData.status) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Order status is required",
      );
    }

    const order = await orderService.updateOrderStatus(
      id,
      validatedData.status,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Order status updated successfully",
      { order },
    );
  }),

  /** Update an order's payment status by ID. */
  updatePaymentStatus: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters and body
    const { id } = orderIdParamSchema.parse(req.params);
    const validatedData = updateOrderSchema.parse(req.body);

    if (!validatedData.paymentStatus) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Payment status is required",
      );
    }

    const order = await orderService.updatePaymentStatus(
      id,
      validatedData.paymentStatus,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payment status updated successfully",
      { order },
    );
  }),

  /** Cancel an order by ID for the authenticated user. */
  cancelOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    // Validate route parameters
    const { id } = orderIdParamSchema.parse(req.params);

    const order = await orderService.cancelOrder(id, userId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Order cancelled successfully",
      { order },
    );
  }),
};
