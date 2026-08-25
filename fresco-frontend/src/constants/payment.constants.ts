/**
 * Payment-related constants strictly mirroring FRESCO backend contracts.
 */

/** Permitted payment methods in FRESCO backend. */
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

/** Human-friendly display labels for payment methods. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash on Delivery",
  UPI: "UPI / QR Code",
};

/** Informative descriptions for payment methods. */
export const PAYMENT_METHOD_DESCRIPTIONS: Record<PaymentMethod, string> = {
  CASH: "Pay with cash directly to the delivery partner upon service.",
  UPI: "Scan delivery partner QR code or pay via any UPI app at doorstep.",
};

import { Ionicons } from "@expo/vector-icons";

/** Ionicons glyph names for payment methods. */
export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, keyof typeof Ionicons.glyphMap> = {
  CASH: "cash-outline",
  UPI: "qr-code-outline",
};

/** Human-friendly display labels for payment statuses. */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Payment Pending",
  PAID: "Payment Completed",
  FAILED: "Payment Failed",
  REFUNDED: "Refunded",
};

/** Informative customer descriptions for payment statuses. */
export const PAYMENT_STATUS_DESCRIPTIONS: Record<PaymentStatus, string> = {
  PENDING: "Payment is pending and will be recorded upon doorstep service.",
  PAID: "Payment has been successfully received and verified.",
  FAILED: "Payment attempt failed. You can retry with your preferred method.",
  REFUNDED: "Payment has been refunded for this order.",
};

/** Ionicons glyph names for payment statuses. */
export const PAYMENT_STATUS_ICONS: Record<PaymentStatus, keyof typeof Ionicons.glyphMap> = {
  PENDING: "time-outline",
  PAID: "checkmark-circle",
  FAILED: "alert-circle",
  REFUNDED: "arrow-undo-circle",
};

/** Semantic badge variants for payment statuses. */
export const PAYMENT_STATUS_VARIANTS: Record<
  PaymentStatus,
  "warning" | "success" | "error" | "neutral"
> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "error",
  REFUNDED: "neutral",
};

/** Human-friendly display labels for refund statuses. */
export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  PENDING: "Refund Processing",
  COMPLETED: "Refund Completed",
  FAILED: "Refund Failed",
  CANCELLED: "Refund Cancelled",
};

/** Semantic badge variants for refund statuses. */
export const REFUND_STATUS_VARIANTS: Record<
  RefundStatus,
  "warning" | "success" | "error" | "neutral"
> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "error",
  CANCELLED: "neutral",
};

