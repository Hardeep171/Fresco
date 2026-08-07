import { model, Schema, type InferSchemaType } from "mongoose";

import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_TYPES,
  DEFAULT_ASSIGNMENT_ACTIVE_STATUS,
  DEFAULT_ASSIGNMENT_STATUS,
  DEFAULT_ASSIGNMENT_TYPE,
} from "../constants/assignment.constants.js";

/** Schema for FRESCO delivery/pickup partner assignments. */
export const AssignmentSchema = new Schema(
  {
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
    assignmentType: {
      type: String,
      enum: ASSIGNMENT_TYPES,
      default: DEFAULT_ASSIGNMENT_TYPE,
      required: true,
    },
    status: {
      type: String,
      enum: ASSIGNMENT_STATUSES,
      default: DEFAULT_ASSIGNMENT_STATUS,
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
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
      default: DEFAULT_ASSIGNMENT_ACTIVE_STATUS,
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

// Single field indexes for assignment queries
AssignmentSchema.index({ assignmentType: 1 });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ isActive: 1 });

// Compound indexes optimizing assignment lookups while preserving assignment history
AssignmentSchema.index({ partnerId: 1, status: 1 });
AssignmentSchema.index({ orderId: 1, assignmentType: 1, isActive: 1 });

export type Assignment = InferSchemaType<typeof AssignmentSchema>;

export const AssignmentModel = model<Assignment>(
  "Assignment",
  AssignmentSchema,
);
