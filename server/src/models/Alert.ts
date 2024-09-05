// models/Alert.ts

import { Document, Schema, Types, model } from "mongoose";

export interface IAlert extends Document {
  _id: string;
  alertReason: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
  sender: Types.ObjectId; // Single sender, always just one
  receiver: Types.ObjectId[]; // Array for handling group or broadcast messages
  markedAsRead: { userId: Types.ObjectId; read: boolean }[]; // Array to track read status per user
}

const alertSchema = new Schema<IAlert>(
  {
    alertReason: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Single sender
    receiver: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], // Array to support group or broadcast messaging
    markedAsRead: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        read: { type: Boolean, default: false },
      },
    ], // Tracks read status for each user
  },
  { timestamps: true }
);

// Indexes for optimized querying
alertSchema.index({ sender: 1, receiver: 1 });
alertSchema.index({ sender: 1 });
alertSchema.index({ receiver: 1 });

export const Alert = model<IAlert>("Alert", alertSchema);
