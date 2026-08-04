import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_ORDER_DELIVERY_CHARGE,
  DEFAULT_ORDER_DISCOUNT,
  DEFAULT_ORDER_STATUS,
  DEFAULT_ORDER_TAX,
  DEFAULT_PAYMENT_STATUS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../constants/order.constants.js";

export const AddressSnapshotSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
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
    },
  },
  { _id: false },
);

export const OrderItemSnapshotSchema = new Schema(
  {
    garmentId: {
      type: Schema.Types.ObjectId,
      ref: "Garment",
      required: true,
    },
    garmentName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

export const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

export const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressSnapshot: {
      type: AddressSnapshotSchema,
      required: true,
    },
    items: {
      type: [OrderItemSnapshotSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: DEFAULT_ORDER_DISCOUNT,
      min: 0,
    },
    tax: {
      type: Number,
      default: DEFAULT_ORDER_TAX,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: DEFAULT_ORDER_DELIVERY_CHARGE,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: DEFAULT_PAYMENT_STATUS,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: DEFAULT_ORDER_STATUS,
      required: true,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    placedAt: {
      type: Date,
      default: Date.now,
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

OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });

export type AddressSnapshot = InferSchemaType<typeof AddressSnapshotSchema>;
export type OrderItemSnapshot = InferSchemaType<typeof OrderItemSnapshotSchema>;
export type StatusHistory = InferSchemaType<typeof StatusHistorySchema>;
export type Order = InferSchemaType<typeof OrderSchema>;

export const OrderModel = model<Order>("Order", OrderSchema);
