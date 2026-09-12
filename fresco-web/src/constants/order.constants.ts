/**
 * Order-related constants mirroring FRESCO backend contracts.
 */

export const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PICKUP_ASSIGNED",
  "PICKED_UP",
  "UNDER_INSPECTION",
  "IN_PROCESS",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** User-friendly status labels for web display */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PICKUP_ASSIGNED: "Pickup Assigned",
  PICKED_UP: "Clothes Picked Up",
  UNDER_INSPECTION: "Under Inspection",
  IN_PROCESS: "Cleaning in Progress",
  READY_FOR_DELIVERY: "Ready for Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/** User-friendly status descriptions for tracking timeline */
export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PLACED: "Your order has been received and is awaiting confirmation.",
  CONFIRMED: "Your order is confirmed and scheduled for pickup.",
  PICKUP_ASSIGNED: "A delivery partner has been assigned for pickup.",
  PICKED_UP: "Garments collected and in transit to the cleaning facility.",
  UNDER_INSPECTION: "Garments are undergoing expert fabric & stain inspection.",
  IN_PROCESS: "Garments are being cleaned, pressed, and quality checked.",
  READY_FOR_DELIVERY: "Garments are clean, packed, and ready for dispatch.",
  OUT_FOR_DELIVERY: "Your clean garments are on the way to your doorstep.",
  DELIVERED: "Order successfully delivered. Thank you for choosing FRESCO!",
  CANCELLED: "This order was cancelled.",
};

/** Order statuses where customer cancellation is allowed */
export const CANCELLABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
];

export const isOrderCancellable = (status: OrderStatus): boolean => {
  return CANCELLABLE_ORDER_STATUSES.includes(status);
};

/**
 * Standard sequential progression of happy-path order lifecycle statuses.
 */
export const ORDER_STATUS_SEQUENCE: readonly OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PICKUP_ASSIGNED",
  "PICKED_UP",
  "UNDER_INSPECTION",
  "IN_PROCESS",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

/**
 * Customer filter tabs for Order History.
 */
export const CUSTOMER_ORDER_FILTER_TABS = [
  "ALL",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
] as const;

export type CustomerOrderFilterTab = (typeof CUSTOMER_ORDER_FILTER_TABS)[number];
export type OrderFilterTab = CustomerOrderFilterTab;

/** Allowed administrative next-status transitions strictly matching backend */
export const ALLOWED_ADMIN_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PICKUP_ASSIGNED", "CANCELLED"],
  PICKUP_ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["UNDER_INSPECTION", "IN_PROCESS"],
  UNDER_INSPECTION: ["IN_PROCESS"],
  IN_PROCESS: ["READY_FOR_DELIVERY"],
  READY_FOR_DELIVERY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
