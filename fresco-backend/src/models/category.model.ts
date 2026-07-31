import { model, Schema, type InferSchemaType } from "mongoose";

import {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  DEFAULT_CATEGORY_STATUS,
  DEFAULT_DISPLAY_ORDER,
} from "../constants/category.constants.js";

export const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: CATEGORY_NAME_MIN_LENGTH,
      maxlength: CATEGORY_NAME_MAX_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      maxlength: CATEGORY_DESCRIPTION_MAX_LENGTH,
    },
    icon: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: DEFAULT_DISPLAY_ORDER,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: DEFAULT_CATEGORY_STATUS,
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

CategorySchema.index({ displayOrder: 1 });

export type Category = InferSchemaType<typeof CategorySchema>;

export const CategoryModel = model<Category>("Category", CategorySchema);
