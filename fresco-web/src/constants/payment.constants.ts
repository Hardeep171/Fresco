/**
 * Payment-related constants strictly mirroring FRESCO backend contracts.
 */

export const PAYMENT_METHODS = ["CASH", "UPI"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DEFAULT_PAYMENT_STATUS: PaymentStatus = "PENDING";

export const REFUND_STATUSES = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const DEFAULT_REFUND_STATUS: RefundStatus = "PENDING";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash on Delivery / Pickup",
  UPI: "UPI / QR Code Scan",
};

export const PAYMENT_METHOD_DESCRIPTIONS: Record<PaymentMethod, string> = {
  CASH: "Pay with cash directly to the delivery partner upon visit.",
  UPI: "Scan delivery partner QR code or transfer via UPI app at doorstep.",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Payment Pending",
  PAID: "Paid & Verified",
  FAILED: "Payment Failed",
  REFUNDED: "Refunded",
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  NOT_REQUESTED: "Not Requested",
  PENDING: "Verification Required",
  VERIFIED: "Verified & Approved",
  REJECTED: "Rejected",
};
