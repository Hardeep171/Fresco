import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_TASK_ACTIVE_STATUS,
  DEFAULT_TASK_STATUS,
  TASK_STATUSES,
  TASK_TYPES,
} from "../constants/delivery-task.constants.js";

/** Schema for FRESCO delivery tasks. */
export const DeliveryTaskSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskType: {
      type: String,
      enum: TASK_TYPES,
      required: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: DEFAULT_TASK_STATUS,
      required: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: DEFAULT_TASK_ACTIVE_STATUS,
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

// Indexes optimizing delivery task queries
DeliveryTaskSchema.index({ taskType: 1 });
DeliveryTaskSchema.index({ status: 1 });
DeliveryTaskSchema.index({ isActive: 1 });
DeliveryTaskSchema.index({ partnerId: 1, status: 1 });
DeliveryTaskSchema.index({ assignmentId: 1, isActive: 1 });

export type DeliveryTask = InferSchemaType<typeof DeliveryTaskSchema>;

export const DeliveryTaskModel = model<DeliveryTask>(
  "DeliveryTask",
  DeliveryTaskSchema,
);
