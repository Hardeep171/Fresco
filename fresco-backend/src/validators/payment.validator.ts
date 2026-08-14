import { z } from "zod";

import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REFUND_REASON_MAX_LENGTH,
} from "../constants/payment.constants.js";
import { objectIdSchema } from "../lib/validation.js";

/** Reusable Zod schema for creating a new payment record. */
export const createPaymentSchema = z.object({
  orderId: objectIdSchema,
  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: "Invalid payment method. Only CASH and UPI are supported.",
  }),
});

/** Reusable Zod schema for receiving a payment by delivery partner. */
export const receivePaymentSchema = z.object({
  paymentMethod: z
    .enum(PAYMENT_METHODS, {
      error: "Invalid payment method. Only CASH and UPI are supported.",
    })
    .optional(),
});

/** Reusable Zod schema for creating a refund transaction. */
export const createRefundSchema = z.object({
  amount: z
    .number({ error: "Refund amount must be a number." })
    .gt(0, { error: "Refund amount must be greater than 0." }),
  reason: z
    .string()
    .trim()
    .max(REFUND_REASON_MAX_LENGTH, {
      error: `Refund reason cannot exceed ${REFUND_REASON_MAX_LENGTH} characters.`,
    })
    .optional(),
});

/** Reusable Zod schema for payment ID route parameters. */
export const paymentIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Reusable Zod schema for order ID route parameters. */
export const orderIdParamSchema = z.object({
  orderId: objectIdSchema,
});

/** Reusable Zod schema for retrying a failed payment. */
export const retryPaymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: "Invalid payment method. Only CASH and UPI are supported.",
  }),
});

/** Reusable Zod schema for querying payments list. */
export const getPaymentsQuerySchema = z.object({
  status: z.enum(PAYMENT_STATUSES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  customerId: objectIdSchema.optional(),
  orderId: objectIdSchema.optional(),
  receivedByPartnerId: objectIdSchema.optional(),
});

/** Strongly typed interface inferred from `createPaymentSchema`. */
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/** Strongly typed interface inferred from `receivePaymentSchema`. */
export type ReceivePaymentInput = z.infer<typeof receivePaymentSchema>;

/** Strongly typed interface inferred from `createRefundSchema`. */
export type CreateRefundInput = z.infer<typeof createRefundSchema>;

/** Strongly typed interface inferred from `paymentIdParamSchema`. */
export type PaymentIdParamInput = z.infer<typeof paymentIdParamSchema>;

/** Strongly typed interface inferred from `orderIdParamSchema`. */
export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;

/** Strongly typed interface inferred from `retryPaymentSchema`. */
export type RetryPaymentInput = z.infer<typeof retryPaymentSchema>;

/** Strongly typed interface inferred from `getPaymentsQuerySchema`. */
export type GetPaymentsQueryInput = z.infer<typeof getPaymentsQuerySchema>;
