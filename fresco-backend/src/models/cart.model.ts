import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_CART_STATUS,
  DEFAULT_CART_TOTAL,
  MIN_CART_ITEM_QUANTITY,
} from "../constants/cart.constants.js";

export const CartItemSchema = new Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: MIN_CART_ITEM_QUANTITY,
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
);

export const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: DEFAULT_CART_TOTAL,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: DEFAULT_CART_STATUS,
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

CartSchema.index({ userId: 1 });

export type CartItem = InferSchemaType<typeof CartItemSchema>;
export type Cart = InferSchemaType<typeof CartSchema>;

export const CartModel = model<Cart>("Cart", CartSchema);
