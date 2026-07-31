import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_SERVICE_DISPLAY_ORDER,
  DEFAULT_SERVICE_STATUS,
  SERVICE_DESCRIPTION_MAX_LENGTH,
  SERVICE_NAME_MAX_LENGTH,
  SERVICE_NAME_MIN_LENGTH,
} from "../constants/service.constants.js";

export const ServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: SERVICE_NAME_MIN_LENGTH,
      maxlength: SERVICE_NAME_MAX_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      maxlength: SERVICE_DESCRIPTION_MAX_LENGTH,
    },
    icon: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: DEFAULT_SERVICE_DISPLAY_ORDER,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: DEFAULT_SERVICE_STATUS,
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

ServiceSchema.index({ displayOrder: 1 });
ServiceSchema.index({ isActive: 1, displayOrder: 1 });

export type Service = InferSchemaType<typeof ServiceSchema>;

export const ServiceModel = model<Service>("Service", ServiceSchema);
