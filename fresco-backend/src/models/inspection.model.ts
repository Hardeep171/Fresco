import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_INSPECTION_ACTIVE_STATUS,
  DEFAULT_INSPECTION_STATUS,
  DEFAULT_ITEM_CONDITION,
  INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH,
  INSPECTION_DAMAGE_NOTES_MAX_LENGTH,
  INSPECTION_NOTES_MAX_LENGTH,
  INSPECTION_STATUSES,
  ITEM_CONDITIONS,
} from "../constants/inspection.constants.js";

/** Schema for items inspected within an order inspection. */
export const InspectionItemSchema = new Schema(
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
    initialQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    inspectedQuantity: {
      type: Number,
      required: true,
      min: 0,
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
    condition: {
      type: String,
      enum: ITEM_CONDITIONS,
      default: DEFAULT_ITEM_CONDITION,
      required: true,
    },
    damageNotes: {
      type: String,
      trim: true,
      maxlength: INSPECTION_DAMAGE_NOTES_MAX_LENGTH,
    },
    imageUrls: {
      type: [{ type: String, trim: true }],
    },
  },
  { _id: false },
);

/** Schema for extra services identified and added during inspection. */
export const InspectionExtraServiceSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

/** Schema for final financial pricing summary of an inspection. */
export const InspectionPricingSummarySchema = new Schema(
  {
    initialTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    inspectedSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    extraServiceCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    adjustmentAmount: {
      type: Number,
      default: 0,
    },
    adjustmentReason: {
      type: String,
      trim: true,
      maxlength: INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH,
    },
    finalTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalTotalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

/** Schema for FRESCO order inspection records. */
export const InspectionSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: INSPECTION_STATUSES,
      default: DEFAULT_INSPECTION_STATUS,
      required: true,
    },
    items: {
      type: [InspectionItemSchema],
      required: true,
    },
    extraServices: {
      type: [InspectionExtraServiceSchema],
      default: [],
    },
    pricingSummary: {
      type: InspectionPricingSummarySchema,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: INSPECTION_NOTES_MAX_LENGTH,
    },
    inspectedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: DEFAULT_INSPECTION_ACTIVE_STATUS,
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

// Single field indexes for inspection queries
InspectionSchema.index({ status: 1 });
InspectionSchema.index({ isActive: 1 });

// Compound indexes optimizing inspection lookups while preserving inspection history
InspectionSchema.index({ orderId: 1, isActive: 1 });
InspectionSchema.index({ inspectorId: 1, status: 1 });

export type Inspection = InferSchemaType<typeof InspectionSchema>;

export const InspectionModel = model<Inspection>(
  "Inspection",
  InspectionSchema,
);
