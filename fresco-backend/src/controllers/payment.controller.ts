import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type {
  PaymentMethod,
  PaymentStatus,
} from "../constants/payment.constants.js";
import {
  paymentService,
  type PaymentFilters,
} from "../services/payment.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createPaymentSchema,
  createRefundSchema,
  orderIdParamSchema,
  paymentIdParamSchema,
  receivePaymentSchema,
  retryPaymentSchema,
} from "../validators/payment.validator.js";

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

/** Payment controller handling HTTP requests for Payment + Refund management. */
export const paymentController = {
  /** Create or initialize a new payment for an order (customer operation). */
  createPayment: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getAuthenticatedUserId(req);

    // Validate request body
    const validatedData = createPaymentSchema.parse(req.body);

    const payment = await paymentService.createPayment(
      customerId,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Payment initialized successfully",
      { payment },
    );
  }),

  /** Mark payment as received (PAID) by authorized delivery partner. */
  receivePayment: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = getAuthenticatedUserId(req);

    // Validate route parameters and body
    const { id } = paymentIdParamSchema.parse(req.params);
    const validatedData = receivePaymentSchema.parse(req.body);

    const payment = await paymentService.receivePayment(
      partnerId,
      id,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payment received successfully",
      { payment },
    );
  }),

  /** Mark payment attempt as FAILED by authorized delivery partner. */
  markPaymentFailed: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = getAuthenticatedUserId(req);

    // Validate route parameters
    const { id } = paymentIdParamSchema.parse(req.params);

    const payment = await paymentService.markPaymentFailed(partnerId, id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payment marked as failed successfully",
      { payment },
    );
  }),

  /** Retry a failed payment attempt (customer operation). */
  retryPayment: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getAuthenticatedUserId(req);

    // Validate route parameters and body
    const { id } = paymentIdParamSchema.parse(req.params);
    const validatedData = retryPaymentSchema.parse(req.body);

    const payment = await paymentService.retryPayment(
      customerId,
      id,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payment retry initialized successfully",
      { payment },
    );
  }),

  /** Process a full or partial refund for a payment (admin/staff operation). */
  createRefund: asyncHandler(async (req: Request, res: Response) => {
    const adminId = getAuthenticatedUserId(req);

    // Validate route parameters and body
    const { id } = paymentIdParamSchema.parse(req.params);
    const validatedData = createRefundSchema.parse(req.body);

    const payment = await paymentService.createRefund(
      adminId,
      id,
      validatedData,
    );

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Refund processed successfully",
      { payment },
    );
  }),

  /** Retrieve a single payment by ID. */
  getPaymentById: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = paymentIdParamSchema.parse(req.params);

    const payment = await paymentService.getPaymentById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payment fetched successfully",
      { payment },
    );
  }),

  /** Retrieve payment record associated with a specific order ID. */
  getPaymentByOrderId: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { orderId } = orderIdParamSchema.parse(req.params);

    const payment = await paymentService.getPaymentByOrderId(orderId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payment fetched successfully",
      { payment },
    );
  }),

  /** Retrieve all payment records for the authenticated customer. */
  getCustomerPayments: asyncHandler(async (req: Request, res: Response) => {
    const customerId = getAuthenticatedUserId(req);

    const payments = await paymentService.getCustomerPayments(customerId);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Customer payments fetched successfully",
      { payments },
    );
  }),

  /** Retrieve refund transaction history for a payment record. */
  getPaymentRefunds: asyncHandler(async (req: Request, res: Response) => {
    // Validate route parameters
    const { id } = paymentIdParamSchema.parse(req.params);

    const refunds = await paymentService.getPaymentRefunds(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payment refunds fetched successfully",
      { refunds },
    );
  }),

  /** Retrieve payment records based on query filter criteria. */
  getPayments: asyncHandler(async (req: Request, res: Response) => {
    const filters: PaymentFilters = {
      ...(req.query.status && {
        status: req.query.status as PaymentStatus,
      }),
      ...(req.query.paymentMethod && {
        paymentMethod: req.query.paymentMethod as PaymentMethod,
      }),
      ...(req.query.customerId && {
        customerId: req.query.customerId as string,
      }),
      ...(req.query.orderId && {
        orderId: req.query.orderId as string,
      }),
      ...(req.query.receivedByPartnerId && {
        receivedByPartnerId: req.query.receivedByPartnerId as string,
      }),
    };

    const payments = await paymentService.getPayments(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Payments fetched successfully",
      { payments },
    );
  }),
};
