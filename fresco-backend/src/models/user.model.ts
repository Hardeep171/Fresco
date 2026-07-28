import { model, Schema, type InferSchemaType } from "mongoose";

import {
  DEFAULT_USER_ROLE,
  DEFAULT_USER_STATUS,
  USER_ROLES,
  USER_STATUSES,
} from "../constants/user.constants.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;
const MIN_PASSWORD_LENGTH = 8;

export const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => EMAIL_PATTERN.test(value),
        message: "Email must be a valid email address.",
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value: string) => PHONE_PATTERN.test(value),
        message: "Phone must be a valid international phone number.",
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: [MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: DEFAULT_USER_ROLE,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: DEFAULT_USER_STATUS,
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    profileImage: { type: String, trim: true },
    lastLogin: { type: Date },
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpiresAt: { type: Date, select: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_document, returnedObject) => {
        const serializedUser = returnedObject as {
          password?: unknown;
          refreshToken?: unknown;
          passwordResetToken?: unknown;
          passwordResetTokenExpiresAt?: unknown;
        };

        delete serializedUser.password;
        delete serializedUser.refreshToken;
        delete serializedUser.passwordResetToken;
        delete serializedUser.passwordResetTokenExpiresAt;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_document, returnedObject) => {
        const serializedUser = returnedObject as {
          password?: unknown;
          refreshToken?: unknown;
          passwordResetToken?: unknown;
          passwordResetTokenExpiresAt?: unknown;
        };

        delete serializedUser.password;
        delete serializedUser.refreshToken;
        delete serializedUser.passwordResetToken;
        delete serializedUser.passwordResetTokenExpiresAt;
      },
    },
  },
);

UserSchema.virtual("fullName")
  .get(function fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  })
  .set(function setFullName(value: unknown) {
    if (typeof value !== "string") {
      return;
    }

    const [firstName, ...lastNameParts] = value.trim().split(/\s+/);

    if (firstName) {
      this.set({ firstName, lastName: lastNameParts.join(" ") });
    }
  });

UserSchema.index({ status: 1, role: 1, deletedAt: 1 });
UserSchema.index({ createdBy: 1, deletedAt: 1 });

export type User = InferSchemaType<typeof UserSchema>;

export const UserModel = model("User", UserSchema);
