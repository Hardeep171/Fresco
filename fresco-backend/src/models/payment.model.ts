import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_PAYMENT_STATUS,
  DEFAULT_REFUND_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REFUND_REASON_MAX_LENGTH,
  REFUND_STATUSES,
} from "../constants/payment.constants.js";

/** Schema for embedded refund transaction records within a payment. */
export const RefundTransactionSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: REFUND_STATUSES,
      default: DEFAULT_REFUND_STATUS,
      required: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: REFUND_REASON_MAX_LENGTH,
    },
    processedAt: {
      type: Date,
    },
  },
  { _id: true, timestamps: true },
);

/** Schema for FRESCO payment records. */
export const PaymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receivedByPartnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: DEFAULT_PAYMENT_STATUS,
      required: true,
    },
    receivedAt: {
      type: Date,
    },
    refunds: {
      type: [RefundTransactionSchema],
      default: [],
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

// Single field indexes for payment queries
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentMethod: 1 });

// Compound indexes optimizing payment lookups
PaymentSchema.index({ customerId: 1, status: 1 });
PaymentSchema.index({ receivedByPartnerId: 1, status: 1 });

export type RefundTransaction = InferSchemaType<typeof RefundTransactionSchema>;
export type Payment = InferSchemaType<typeof PaymentSchema>;

export const PaymentModel = model<Payment>("Payment", PaymentSchema);
