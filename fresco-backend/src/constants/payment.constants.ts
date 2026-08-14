/**
 * Payment-related constants shared across the application.
 */

/** Permitted payment methods for a FRESCO payment. */
export const PAYMENT_METHODS = ["CASH", "UPI"] as const;

/** Union of all permitted payment methods. */
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Permitted lifecycle statuses for a FRESCO payment. */
export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

/** Union of all permitted payment statuses. */
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Default payment status assigned when a payment record is created. */
export const DEFAULT_PAYMENT_STATUS: PaymentStatus = "PENDING";

/** Permitted lifecycle statuses for a refund transaction. */
export const REFUND_STATUSES = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

/** Union of all permitted refund statuses. */
export type RefundStatus = (typeof REFUND_STATUSES)[number];

/** Default refund status assigned to a newly created refund transaction. */
export const DEFAULT_REFUND_STATUS: RefundStatus = "PENDING";

/** Maximum length permitted for refund reason notes. */
export const REFUND_REASON_MAX_LENGTH = 500;
