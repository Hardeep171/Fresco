/**
 * Payment-related constants mirroring FRESCO backend contracts.
 */

export const PAYMENT_METHODS = ["CASH", "UPI"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash on Delivery",
  UPI: "UPI / Online Payment",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Payment Pending",
  PAID: "Payment Completed",
  FAILED: "Payment Failed",
  REFUNDED: "Refunded",
};

export const REFUND_STATUSES = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const DEFAULT_PAYMENT_STATUS = "PENDING";
