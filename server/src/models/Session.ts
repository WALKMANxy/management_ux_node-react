// models/Session.ts

import { Document, Schema, model } from "mongoose";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  uniqueId?: string; // New field for unique identifier
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refreshToken: {
      type: String,
      required: true,
      maxlength: 2048,
    },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    uniqueId: { type: String }, // Define the uniqueId field
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1, userAgent: 1, uniqueId: 1 }, { unique: true });

export const Session = model<ISession>("Session", sessionSchema);
