// models/Alert.ts

import { Document, Schema, model } from "mongoose";

export interface IAlert extends Document {
  _id: string; // Add the _id field
  alertReason: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
  alertIssuedBy: string;
  entityRole: "admin" | "agent" | "client";
  entityCode: string;
  markedAsRead: boolean;
}

const alertSchema = new Schema<IAlert>({
  alertReason: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ["low", "medium", "high"], required: true },
  createdAt: { type: Date, default: Date.now },
  alertIssuedBy: { type: String, required: true },
  entityRole: {
    type: String,
    enum: ["admin", "agent", "client"],
    required: true,
  },
  entityCode: { type: String, required: true },
  markedAsRead: { type: Boolean, default: false },
});

// Indexes for optimized querying
alertSchema.index({ entityRole: 1, entityCode: 1 });
alertSchema.index({ alertIssuedBy: 1 });

export const Alert = model<IAlert>("Alert", alertSchema);