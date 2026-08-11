import { StatusCodes } from "http-status-codes";
import { type QueryFilter as FilterQuery, Types } from "mongoose";

import {
  DEFAULT_PAYMENT_STATUS,
  type PaymentMethod,
  type PaymentStatus,
} from "../constants/payment.constants.js";
import type { UserRole } from "../constants/user.constants.js";
import type { Payment, RefundTransaction } from "../models/payment.model.js";
import { assignmentRepository } from "../repositories/assignment.repository.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { orderService } from "./order.service.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreatePaymentInput,
  CreateRefundInput,
  ReceivePaymentInput,
  RetryPaymentInput,
} from "../validators/payment.validator.js";

/** Filter options for querying payments. */
export interface PaymentFilters {
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  customerId?: string;
  orderId?: string;
  receivedByPartnerId?: string;
}

/** Administrative roles permitted to manage refunds and payment overrides. */
const ALLOWED_ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
];

/** Allowed status transitions graph for a payment. */
const ALLOWED_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["PAID", "FAILED"],
  FAILED: ["PENDING"],
  PAID: ["REFUNDED"],
  REFUNDED: [],
};

/**
 * Helper to ensure a payment exists by ID, throwing 404 if not found.
 *
 * @param paymentId - Payment ID to verify.
 * @returns Promise resolving to the payment plain object.
 * @throws {ApiError} 404 Not Found if payment does not exist.
 */
async function ensurePaymentExists(paymentId: string) {
  const payment = await paymentRepository.findPaymentById(paymentId);

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
  }

  return payment;
}

/**
 * Helper to ensure an order exists by ID by delegating to Order service.
 *
 * @param orderId - Order ID to verify.
 * @returns Promise resolving to the order plain object.
 * @throws {ApiError} 404 Not Found if order does not exist.
 */
async function ensureOrderExists(orderId: string) {
  return orderService.getOrderById(orderId);
}

/**
 * Helper to ensure the authenticated customer owns the order.
 *
 * @param orderId - Order ID to verify.
 * @param customerId - Customer user ID to verify.
 * @returns Promise resolving to the verified order plain object.
 * @throws {ApiError} 404 Not Found if order does not exist.
 * @throws {ApiError} 403 Forbidden if order does not belong to the customer.
 */
async function ensureCustomerOwnsOrder(orderId: string, customerId: string) {
  const order = await ensureOrderExists(orderId);

  if (String(order.userId) !== customerId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized for this order",
    );
  }

  return order;
}

/**
 * Helper to ensure a user exists, is active, and possesses the DELIVERY_PARTNER role.
 *
 * @param partnerId - Partner user ID to verify.
 * @returns Promise resolving to the user plain object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user account is inactive or not a delivery partner.
 */
async function ensureDeliveryPartner(partnerId: string) {
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
 * @param adminId - Admin user ID to verify.
 * @returns Promise resolving to the user plain object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user account is inactive.
 * @throws {ApiError} 403 Forbidden if user lacks administrative permissions.
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
 * Helper to ensure a delivery partner is assigned to deliver the specified order.
 *
 * @param orderId - Order ID to verify.
 * @param partnerId - Delivery partner user ID to verify.
 * @returns Promise resolving to the assignment plain object.
 * @throws {ApiError} 404 Not Found if partner does not exist.
 * @throws {ApiError} 400 Bad Request if partner is inactive or not a delivery partner.
 * @throws {ApiError} 403 Forbidden if partner is not the authorized delivery partner for this order.
 */
async function ensureAuthorizedDeliveryPartnerForOrder(
  orderId: string,
  partnerId: string,
) {
  await ensureDeliveryPartner(partnerId);

  const assignment = await assignmentRepository.findAssignmentByOrder(
    orderId,
    "DELIVERY",
  );

  if (
    !assignment ||
    !assignment.isActive ||
    String(assignment.partnerId) !== partnerId
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized as the delivery partner for this order",
    );
  }

  return assignment;
}

/**
 * Helper to validate payment status transitions against the allowed state machine.
 *
 * @param currentStatus - Current PaymentStatus of the record.
 * @param nextStatus - Target PaymentStatus to transition to.
 * @returns True if status transition is valid.
 * @throws {ApiError} 400 Bad Request if status transition is forbidden.
 */
function validatePaymentStatusTransition(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus,
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot transition payment status from '${currentStatus}' to '${nextStatus}'.`,
    );
  }

  return true;
}

/**
 * Helper to calculate total successfully completed refund amount from embedded refund transactions.
 *
 * @param payment - Payment document containing refund transactions array.
 * @returns Total completed refund sum.
 */
function calculateCompletedRefundTotal(payment: Payment): number {
  if (!payment.refunds || payment.refunds.length === 0) {
    return 0;
  }

  const total = payment.refunds
    .filter((refund) => refund.status === "COMPLETED")
    .reduce((sum, refund) => sum + Number(refund.amount), 0);

  return Math.round(total * 100) / 100;
}

/** Service providing business logic for Payment + Refund module. */
export const paymentService = {
  /**
   * Creates or initializes a payment record for an order after validating customer ownership and order pricing.
   * Derives payable amount strictly from the finalized order pricing snapshot.
   * Enforces 1 Order -> 1 Payment document rule, updating existing document on retries or pending state.
   *
   * @param customerId - Authenticated customer user ID creating the payment.
   * @param data - Validated payment creation input properties.
   * @returns Promise resolving to the created or updated payment plain object.
   * @throws {ApiError} 404 Not Found if order does not exist.
   * @throws {ApiError} 403 Forbidden if customer does not own order.
   * @throws {ApiError} 400 Bad Request if order is cancelled or payment is already completed.
   * @throws {ApiError} 409 Conflict if a concurrent update occurred.
   */
  async createPayment(customerId: string, data: CreatePaymentInput) {
    const order = await ensureCustomerOwnsOrder(data.orderId, customerId);

    if (order.status === "CANCELLED") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot create payment for a cancelled order",
      );
    }

    if (!order.pricing) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Order pricing details are missing",
      );
    }

    const payableAmount = Number(order.pricing.totalAmount);

    const existingPayment = await paymentRepository.findPaymentByOrder(
      data.orderId,
    );

    if (existingPayment) {
      if (
        existingPayment.status === "PAID" ||
        existingPayment.status === "REFUNDED"
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Payment already completed for this order with status '${existingPayment.status}'`,
        );
      }

      const updatedPayment = await paymentRepository.updatePayment(
        String(existingPayment._id),
        {
          paymentMethod: data.paymentMethod,
          amount: payableAmount,
          status: DEFAULT_PAYMENT_STATUS,
        },
        ["PENDING", "FAILED"],
      );

      if (!updatedPayment) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Payment initialization failed due to a concurrent status update. Please try again.",
        );
      }

      if (existingPayment.status === "FAILED") {
        try {
          await orderService.updatePaymentStatus(data.orderId, "PENDING");
        } catch (error) {
          // Rollback payment update if order payment status sync fails
          await paymentRepository.updatePayment(
            String(existingPayment._id),
            {
              status: existingPayment.status,
              paymentMethod: existingPayment.paymentMethod,
            },
            "PENDING",
          );
          throw error;
        }
      }

      return updatedPayment;
    }

    const paymentData: Partial<Payment> = {
      orderId: new Types.ObjectId(data.orderId),
      customerId: new Types.ObjectId(customerId),
      amount: payableAmount,
      paymentMethod: data.paymentMethod,
      status: DEFAULT_PAYMENT_STATUS,
      refunds: [],
    };

    try {
      return await paymentRepository.createPayment(paymentData);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        ("code" in error && (error as { code: number }).code === 11_000)
      ) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Payment initialization failed due to a concurrent request for this order.",
        );
      }
      throw error;
    }
  },

  /**
   * Marks a payment as received (PAID) by the authorized delivery partner upon delivery.
   * Validates delivery partner role, assignment authorization for the order, and status transition rules.
   * Automatically updates related order's payment status to PAID with rollback protection.
   *
   * @param partnerId - Authenticated delivery partner user ID.
   * @param paymentId - Payment ID to mark as received.
   * @param data - Optional payment receiving parameters (e.g. updated paymentMethod).
   * @returns Promise resolving to the updated payment plain object.
   * @throws {ApiError} 404 Not Found if payment or partner does not exist.
   * @throws {ApiError} 403 Forbidden if partner is not the authorized delivery partner for this order.
   * @throws {ApiError} 400 Bad Request if status transition to PAID is invalid.
   * @throws {ApiError} 409 Conflict if a concurrent status update occurred.
   */
  async receivePayment(
    partnerId: string,
    paymentId: string,
    data?: ReceivePaymentInput,
  ) {
    const existingPayment = await ensurePaymentExists(paymentId);
    const orderIdStr = String(existingPayment.orderId);

    validatePaymentStatusTransition(
      existingPayment.status as PaymentStatus,
      "PAID",
    );

    await ensureAuthorizedDeliveryPartnerForOrder(orderIdStr, partnerId);

    const updateData: Record<string, unknown> = {
      status: "PAID",
      receivedByPartnerId: new Types.ObjectId(partnerId),
      receivedAt: new Date(),
      ...(data?.paymentMethod && { paymentMethod: data.paymentMethod }),
    };

    const updatedPayment = await paymentRepository.updatePayment(
      paymentId,
      updateData,
      "PENDING",
    );

    if (!updatedPayment) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Payment status transition failed due to a concurrent update. Current status is no longer PENDING.",
      );
    }

    try {
      await orderService.updatePaymentStatus(orderIdStr, "PAID");
    } catch (error) {
      // Rollback payment update if order payment status sync fails
      await paymentRepository.updatePayment(
        paymentId,
        {
          status: existingPayment.status,
          paymentMethod: existingPayment.paymentMethod,
          $unset: { receivedByPartnerId: 1, receivedAt: 1 },
        },
        "PAID",
      );
      throw error;
    }

    return updatedPayment;
  },

  /**
   * Marks a payment attempt as FAILED by the authorized delivery partner.
   * Validates delivery partner role, assignment authorization for the order, and status transition rules.
   * Keeps payment record for retry and updates order payment status to FAILED with rollback protection.
   *
   * @param partnerId - Authenticated delivery partner user ID.
   * @param paymentId - Payment ID to mark as failed.
   * @returns Promise resolving to the updated payment plain object.
   * @throws {ApiError} 404 Not Found if payment or partner does not exist.
   * @throws {ApiError} 403 Forbidden if partner is not the authorized delivery partner for this order.
   * @throws {ApiError} 400 Bad Request if status transition to FAILED is invalid.
   * @throws {ApiError} 409 Conflict if a concurrent status update occurred.
   */
  async markPaymentFailed(partnerId: string, paymentId: string) {
    const existingPayment = await ensurePaymentExists(paymentId);
    const orderIdStr = String(existingPayment.orderId);

    validatePaymentStatusTransition(
      existingPayment.status as PaymentStatus,
      "FAILED",
    );

    await ensureAuthorizedDeliveryPartnerForOrder(orderIdStr, partnerId);

    const updatedPayment = await paymentRepository.updatePayment(
      paymentId,
      { status: "FAILED" },
      "PENDING",
    );

    if (!updatedPayment) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Payment status transition failed due to a concurrent update. Current status is no longer PENDING.",
      );
    }

    try {
      await orderService.updatePaymentStatus(orderIdStr, "FAILED");
    } catch (error) {
      // Rollback payment status if order payment status sync fails
      await paymentRepository.updatePayment(
        paymentId,
        { status: existingPayment.status },
        "FAILED",
      );
      throw error;
    }

    return updatedPayment;
  },

  /**
   * Allows customer to retry a failed payment attempt.
   * Moves the existing Payment record back to PENDING status with rollback protection.
   *
   * @param customerId - Authenticated customer user ID.
   * @param paymentId - Payment ID to retry.
   * @param data - Validated retry payment input properties.
   * @returns Promise resolving to the updated payment plain object.
   * @throws {ApiError} 404 Not Found if payment does not exist.
   * @throws {ApiError} 403 Forbidden if customer does not own order.
   * @throws {ApiError} 400 Bad Request if payment status is not FAILED.
   * @throws {ApiError} 409 Conflict if a concurrent status update occurred.
   */
  async retryPayment(
    customerId: string,
    paymentId: string,
    data: RetryPaymentInput,
  ) {
    const existingPayment = await ensurePaymentExists(paymentId);
    const orderIdStr = String(existingPayment.orderId);

    await ensureCustomerOwnsOrder(orderIdStr, customerId);

    validatePaymentStatusTransition(
      existingPayment.status as PaymentStatus,
      "PENDING",
    );

    const updatedPayment = await paymentRepository.updatePayment(
      paymentId,
      {
        status: "PENDING",
        paymentMethod: data.paymentMethod,
      },
      "FAILED",
    );

    if (!updatedPayment) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Payment status transition failed due to a concurrent update. Current status is no longer FAILED.",
      );
    }

    try {
      await orderService.updatePaymentStatus(orderIdStr, "PENDING");
    } catch (error) {
      // Rollback payment update if order payment status sync fails
      await paymentRepository.updatePayment(
        paymentId,
        {
          status: existingPayment.status,
          paymentMethod: existingPayment.paymentMethod,
        },
        "PENDING",
      );
      throw error;
    }

    return updatedPayment;
  },

  /**
   * Processes a full or partial refund for a PAID payment by an authorized administrator/staff member.
   * Atomically appends refund transaction, enforces cumulative limits and expected count for concurrency protection,
   * and synchronizes Payment and Order status to REFUNDED with deterministic ID-based rollback protection.
   *
   * @param adminId - Authenticated admin user ID processing the refund.
   * @param paymentId - Payment ID to refund.
   * @param data - Validated refund creation input properties.
   * @returns Promise resolving to the updated payment plain object.
   * @throws {ApiError} 404 Not Found if payment or admin does not exist.
   * @throws {ApiError} 403 Forbidden if user lacks admin role.
   * @throws {ApiError} 400 Bad Request if payment is not PAID or refund amount exceeds refundable balance.
   * @throws {ApiError} 409 Conflict if a concurrent transaction occurred.
   */
  async createRefund(
    adminId: string,
    paymentId: string,
    data: CreateRefundInput,
  ) {
    await ensureAdmin(adminId);

    const existingPayment = await ensurePaymentExists(paymentId);

    if (existingPayment.status !== "PAID") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot issue refund for payment with status '${existingPayment.status}'. Refund can only be created for PAID payments.`,
      );
    }

    const currentRefunds = existingPayment.refunds || [];
    const previouslyCompletedRefundAmount =
      calculateCompletedRefundTotal(existingPayment);
    const totalPaymentAmount =
      Math.round(Number(existingPayment.amount) * 100) / 100;
    const maxRefundableAmount =
      Math.round((totalPaymentAmount - previouslyCompletedRefundAmount) * 100) /
      100;

    if (data.amount > maxRefundableAmount) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Requested refund amount of ₹${data.amount} exceeds maximum remaining refundable balance of ₹${maxRefundableAmount}.`,
      );
    }

    const newTotalRefunded =
      Math.round((previouslyCompletedRefundAmount + data.amount) * 100) / 100;
    const isFullRefund = newTotalRefunded >= totalPaymentAmount;

    const refundId = new Types.ObjectId();
    const refundTransaction: Record<string, unknown> = {
      _id: refundId,
      amount: data.amount,
      status: "COMPLETED",
      processedBy: new Types.ObjectId(adminId),
      processedAt: new Date(),
      ...(data.reason && { reason: data.reason }),
    };

    // Atomic push of refund transaction + atomic status update to REFUNDED if full refund
    const updatedPayment = await paymentRepository.addRefundTransaction(
      paymentId,
      refundTransaction,
      {
        isFullRefund,
        expectedRefundCount: currentRefunds.length,
      },
    );

    if (!updatedPayment) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Refund processing failed due to a concurrent transaction or status change. Please try again.",
      );
    }

    if (isFullRefund) {
      try {
        await orderService.updatePaymentStatus(
          String(existingPayment.orderId),
          "REFUNDED",
        );
      } catch (error) {
        // Roll back payment status and pull exact refund transaction by _id if order status sync fails
        await paymentRepository.removeRefundTransactionAndRestoreStatus(
          paymentId,
          refundId,
          "PAID",
        );
        throw error;
      }
    }

    return updatedPayment;
  },

  /**
   * Retrieves a single payment record by ID.
   *
   * @param paymentId - Payment ID to retrieve.
   * @returns Promise resolving to the matching payment plain object.
   * @throws {ApiError} 404 Not Found if payment does not exist.
   */
  async getPaymentById(paymentId: string) {
    return ensurePaymentExists(paymentId);
  },

  /**
   * Retrieves a payment record for the specified order ID.
   *
   * @param orderId - Order ID to look up payment for.
   * @returns Promise resolving to the matching payment plain object.
   * @throws {ApiError} 404 Not Found if order or payment does not exist.
   */
  async getPaymentByOrderId(orderId: string) {
    await ensureOrderExists(orderId);

    const payment = await paymentRepository.findPaymentByOrder(orderId);

    if (!payment) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Payment not found for order '${orderId}'`,
      );
    }

    return payment;
  },

  /**
   * Retrieves all payment records for a specific customer.
   *
   * @param customerId - Customer user ID to query payments for.
   * @returns Promise resolving to an array of customer payment plain objects.
   * @throws {ApiError} 404 Not Found if user does not exist.
   */
  async getCustomerPayments(customerId: string) {
    const user = await userRepository.findUserById(customerId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    return paymentRepository.findPaymentsByCustomer(customerId);
  },

  /**
   * Retrieves payment records matching query filter criteria.
   *
   * @param filters - Optional payment query filter options.
   * @returns Promise resolving to an array of matching payment plain objects.
   */
  async getPayments(filters: PaymentFilters = {}) {
    const { status, paymentMethod, customerId, orderId, receivedByPartnerId } =
      filters;

    const queryFilters: FilterQuery<Payment> = {
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(customerId && { customerId: new Types.ObjectId(customerId) }),
      ...(orderId && { orderId: new Types.ObjectId(orderId) }),
      ...(receivedByPartnerId && {
        receivedByPartnerId: new Types.ObjectId(receivedByPartnerId),
      }),
    };

    return paymentRepository.findPayments(queryFilters);
  },

  /**
   * Retrieves the embedded refund transaction history for a payment record.
   *
   * @param paymentId - Payment ID to retrieve refunds for.
   * @returns Promise resolving to an array of refund transaction plain objects.
   * @throws {ApiError} 404 Not Found if payment does not exist.
   */
  async getPaymentRefunds(paymentId: string) {
    const payment = await ensurePaymentExists(paymentId);
    return payment.refunds || [];
  },
};
