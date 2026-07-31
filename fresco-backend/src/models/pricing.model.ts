import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_CURRENCY,
  DEFAULT_PRICING_STATUS,
  PRICE_MIN_VALUE,
} from "../constants/pricing.constants.js";

export const PricingSchema = new Schema(
  {
    garmentId: {
      type: Schema.Types.ObjectId,
      ref: "Garment",
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: PRICE_MIN_VALUE,
    },
    currency: {
      type: String,
      required: true,
      default: DEFAULT_CURRENCY,
    },
    isActive: {
      type: Boolean,
      default: DEFAULT_PRICING_STATUS,
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

// Unique compound index preventing duplicate pricing for the same garment and service
PricingSchema.index({ garmentId: 1, serviceId: 1 }, { unique: true });

// Listing indexes
PricingSchema.index({ garmentId: 1, isActive: 1 });
PricingSchema.index({ serviceId: 1, isActive: 1 });

export type Pricing = InferSchemaType<typeof PricingSchema>;

export const PricingModel = model<Pricing>("Pricing", PricingSchema);
