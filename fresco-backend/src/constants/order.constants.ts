/**
 * Order-related constants shared across the application.
 */

/** Permitted lifecycle statuses for a FRESCO order. */
export const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PICKUP_ASSIGNED",
  "PICKED_UP",
  "IN_PROCESS",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

/** Union of all permitted order statuses. */
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Permitted payment statuses for a FRESCO order. */
export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

/** Union of all permitted payment statuses. */
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Default order status assigned when an order is created. */
export const DEFAULT_ORDER_STATUS: OrderStatus = "PLACED";

/** Default payment status assigned when an order is created. */
export const DEFAULT_PAYMENT_STATUS: PaymentStatus = "PENDING";

/** Default discount value for a newly created order. */
export const DEFAULT_ORDER_DISCOUNT = 0;

/** Default tax value for a newly created order. */
export const DEFAULT_ORDER_TAX = 0;

/** Default delivery charge value for a newly created order. */
export const DEFAULT_ORDER_DELIVERY_CHARGE = 0;
