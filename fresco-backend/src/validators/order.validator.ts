import { z } from "zod";

import {
  DEFAULT_ORDER_DELIVERY_CHARGE,
  DEFAULT_ORDER_DISCOUNT,
  DEFAULT_ORDER_TAX,
  MIN_ORDER_ITEM_QUANTITY,
  ORDER_SPECIAL_INSTRUCTIONS_MAX_LENGTH,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../constants/order.constants.js";
import { objectIdSchema } from "../lib/validation.js";
import { createAddressSchema } from "./address.validator.js";

/** Reusable Zod schema for individual order item validation. */
export const orderItemValidationSchema = z.object({
  garmentId: objectIdSchema,
  serviceId: objectIdSchema,
  garmentName: z.string().trim().optional(),
  serviceName: z.string().trim().optional(),
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be an integer." })
    .min(MIN_ORDER_ITEM_QUANTITY, {
      error: `Quantity must be at least ${MIN_ORDER_ITEM_QUANTITY}.`,
    }),
  unitPrice: z.number().min(0).optional(),
  totalPrice: z.number().min(0).optional(),
});

/** Reusable Zod schema for pricing snapshot validation. */
export const pricingSnapshotValidationSchema = z.object({
  subtotal: z.number({ error: "Subtotal must be a number." }).min(0),
  discount: z.number().min(0).default(DEFAULT_ORDER_DISCOUNT),
  tax: z.number().min(0).default(DEFAULT_ORDER_TAX),
  deliveryCharge: z.number().min(0).default(DEFAULT_ORDER_DELIVERY_CHARGE),
  totalAmount: z.number({ error: "Total amount must be a number." }).min(0),
});

/** Reusable Zod schema for creating a new order. */
export const createOrderSchema = z.object({
  pickupAddress: createAddressSchema,
  deliveryAddress: createAddressSchema,
  pickupDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  specialInstructions: z
    .string()
    .trim()
    .max(ORDER_SPECIAL_INSTRUCTIONS_MAX_LENGTH, {
      error: `Special instructions cannot exceed ${ORDER_SPECIAL_INSTRUCTIONS_MAX_LENGTH} characters.`,
    })
    .optional(),
});

/** Reusable Zod schema for updating an existing order. */
export const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  pickupDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  specialInstructions: z
    .string()
    .trim()
    .max(ORDER_SPECIAL_INSTRUCTIONS_MAX_LENGTH, {
      error: `Special instructions cannot exceed ${ORDER_SPECIAL_INSTRUCTIONS_MAX_LENGTH} characters.`,
    })
    .optional(),
  pickupAddress: createAddressSchema.partial().optional(),
  deliveryAddress: createAddressSchema.partial().optional(),
});

/** Reusable Zod schema for order ID route parameters. */
export const orderIdParamSchema = z.object({
  id: objectIdSchema,
});

/** Strongly typed interface inferred from `createOrderSchema`. */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Strongly typed interface inferred from `updateOrderSchema`. */
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

/** Strongly typed interface inferred from `orderIdParamSchema`. */
export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;
