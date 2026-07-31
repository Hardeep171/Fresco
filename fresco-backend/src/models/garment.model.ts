import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_GARMENT_DISPLAY_ORDER,
  DEFAULT_GARMENT_STATUS,
  GARMENT_DESCRIPTION_MAX_LENGTH,
  GARMENT_NAME_MAX_LENGTH,
  GARMENT_NAME_MIN_LENGTH,
} from "../constants/garment.constants.js";

export const GarmentSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: GARMENT_NAME_MIN_LENGTH,
      maxlength: GARMENT_NAME_MAX_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      maxlength: GARMENT_DESCRIPTION_MAX_LENGTH,
    },
    icon: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: DEFAULT_GARMENT_DISPLAY_ORDER,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: DEFAULT_GARMENT_STATUS,
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

// Compound unique index preventing duplicate garment names within the same category
GarmentSchema.index({ categoryId: 1, name: 1 }, { unique: true });
GarmentSchema.index({ displayOrder: 1 });
GarmentSchema.index({ categoryId: 1, isActive: 1, displayOrder: 1 });

export type Garment = InferSchemaType<typeof GarmentSchema>;

export const GarmentModel = model<Garment>("Garment", GarmentSchema);
