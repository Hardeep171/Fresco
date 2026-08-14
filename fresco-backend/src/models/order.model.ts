import { model, Schema, type InferSchemaType } from "mongoose";

import { DEFAULT_COUNTRY } from "../constants/address.constants.js";
import {
  DEFAULT_ORDER_DELIVERY_CHARGE,
  DEFAULT_ORDER_DISCOUNT,
  DEFAULT_ORDER_STATUS,
  DEFAULT_ORDER_TAX,
  DEFAULT_PAYMENT_STATUS,
  MIN_ORDER_ITEM_QUANTITY,
  ORDER_SPECIAL_INSTRUCTIONS_MAX_LENGTH,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../constants/order.constants.js";

/** Schema for items contained within an order. */
export const OrderItemSchema = new Schema(
  {
    garmentId: {
      type: Schema.Types.ObjectId,
      ref: "Garment",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    garmentName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: MIN_ORDER_ITEM_QUANTITY,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

/** Schema snapshot for financial and pricing details of an order. */
export const PricingSnapshotSchema = new Schema(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: DEFAULT_ORDER_DISCOUNT,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: DEFAULT_ORDER_TAX,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: DEFAULT_ORDER_DELIVERY_CHARGE,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

/** Schema snapshot for address information associated with an order. */
export const AddressSnapshotSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: DEFAULT_COUNTRY,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  { _id: false },
);

/** Schema for FRESCO customer orders. */
export const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item.",
      },
    },
    pricing: {
      type: PricingSnapshotSchema,
      required: true,
    },
    pickupAddress: {
      type: AddressSnapshotSchema,
      required: true,
    },
    deliveryAddress: {
      type: AddressSnapshotSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: DEFAULT_ORDER_STATUS,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: DEFAULT_PAYMENT_STATUS,
      required: true,
    },
    pickupDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: ORDER_SPECIAL_INSTRUCTIONS_MAX_LENGTH,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_document, returnedObject) => {
        return returnedObject;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_document, returnedObject) => {
        return returnedObject;
      },
    },
  },
);

// Indexes for optimized query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export type Order = InferSchemaType<typeof OrderSchema>;

export const OrderModel = model<Order>("Order", OrderSchema);
