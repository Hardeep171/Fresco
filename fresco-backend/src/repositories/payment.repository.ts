import { Types, type QueryFilter as FilterQuery } from "mongoose";

import type { PaymentStatus } from "../constants/payment.constants.js";
import {
  PaymentModel,
  type Payment,
  type RefundTransaction,
} from "../models/payment.model.js";

/** Repository handling database operations for Payment module. */
export const paymentRepository = {
  /**
   * Creates a new payment document in the database and returns a plain object.
   *
   * @param data - Payment creation properties.
   * @returns Promise resolving to the created payment plain object.
   */
  async createPayment(data: Partial<Payment>) {
    const payment = await PaymentModel.create(data);
    return payment.toObject();
  },

  /**
   * Finds payment documents matching the specified filter criteria, sorted by creation date descending.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching payment plain objects.
   */
  async findPayments(filters: FilterQuery<Payment> = {}) {
    return PaymentModel.find(filters)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  /**
   * Finds a single payment document by its unique identifier.
   *
   * @param id - The payment's unique identifier.
   * @returns Promise resolving to the matching payment plain object if found, or null.
   */
  async findPaymentById(id: string) {
    return PaymentModel.findById(id).lean().exec();
  },

  /**
   * Finds a single payment document for the specified order.
   *
   * @param orderId - The order's unique identifier.
   * @returns Promise resolving to the matching payment plain object if found, or null.
   */
  async findPaymentByOrder(orderId: string | Types.ObjectId) {
    return PaymentModel.findOne({ orderId }).lean().exec();
  },

  /**
   * Finds all payment documents for a specific customer matching optional filters, sorted by creation date descending.
   *
   * @param customerId - The customer's unique identifier.
   * @param filters - Optional additional query filter parameters.
   * @returns Promise resolving to an array of matching payment plain objects.
   */
  async findPaymentsByCustomer(
    customerId: string | Types.ObjectId,
    filters: FilterQuery<Payment> = {},
  ) {
    return PaymentModel.find({ ...filters, customerId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  /**
   * Updates a payment document by ID enforcing an optional expected current status filter for concurrency protection.
   *
   * @param id - The payment's unique identifier.
   * @param data - Payment fields or MongoDB update operators.
   * @param expectedStatus - Optional expected current status filter to prevent race conditions.
   * @returns Promise resolving to the updated payment plain object if found and matched, or null.
   */
  async updatePayment(
    id: string,
    data: Partial<Payment> | Record<string, unknown>,
    expectedStatus?: PaymentStatus | PaymentStatus[],
  ) {
    const filter: FilterQuery<Payment> = {
      _id: id,
      ...(expectedStatus && {
        status: Array.isArray(expectedStatus)
          ? { $in: expectedStatus }
          : expectedStatus,
      }),
    };

    return PaymentModel.findOneAndUpdate(filter, data, {
      returnDocument: "after",
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Appends a new refund transaction record to a payment document atomically.
   * Atomically sets payment status to REFUNDED if isFullRefund is true and verifies expectedRefundCount for concurrency safety.
   *
   * @param id - The payment's unique identifier.
   * @param refundData - Refund transaction data to append.
   * @param options - Optional conditions: isFullRefund to update status, expectedRefundCount to prevent race conditions.
   * @returns Promise resolving to the updated payment plain object if found and updated, or null.
   */
  async addRefundTransaction(
    id: string,
    refundData: Partial<RefundTransaction> | Record<string, unknown>,
    options: {
      isFullRefund?: boolean;
      expectedRefundCount?: number;
    } = {},
  ) {
    const filter: FilterQuery<Payment> = {
      _id: id,
      status: "PAID",
      ...(options.expectedRefundCount !== undefined && {
        refunds: { $size: options.expectedRefundCount },
      }),
    };

    const update: Record<string, unknown> = {
      $push: { refunds: refundData },
    };

    if (options.isFullRefund) {
      update.$set = { status: "REFUNDED" };
    }

    return PaymentModel.findOneAndUpdate(filter, update, {
      returnDocument: "after",
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Rollback helper to remove a specific refund transaction by its unique ID and restore payment status if downstream order status sync fails.
   *
   * @param id - The payment's unique identifier.
   * @param refundId - The unique identifier of the refund transaction to remove.
   * @param status - Target PaymentStatus to restore (e.g. "PAID").
   * @returns Promise resolving to the updated payment plain object if found, or null.
   */
  async removeRefundTransactionAndRestoreStatus(
    id: string,
    refundId: string | Types.ObjectId,
    status: PaymentStatus,
  ) {
    return PaymentModel.findByIdAndUpdate(
      id,
      {
        $pull: { refunds: { _id: new Types.ObjectId(String(refundId)) } },
        $set: { status },
      },
      { returnDocument: "after", runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total payment documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching payment documents.
   */
  async countPayments(filters: FilterQuery<Payment> = {}) {
    return PaymentModel.countDocuments(filters).exec();
  },
};
