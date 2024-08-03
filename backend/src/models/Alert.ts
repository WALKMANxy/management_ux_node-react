// models/Alert.ts

import { Schema, model, Document } from 'mongoose';

export interface IAlert extends Document {
    alertReason: string;
    message: string;
    severity: "low" | "medium" | "high";
    createdAt: Date;
    alertIssuedBy: string;
    targetType: "admin" | "agent" | "client";  // New field
    targetId: string;  // New field
  }

const alertSchema = new Schema<IAlert>({
  alertReason: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ["low", "medium", "high"], required: true },
  createdAt: { type: Date, default: Date.now },
  alertIssuedBy: { type: String, required: true },
  targetType: { type: String, enum: ["admin", "agent", "client"], required: true },
  targetId: { type: String, required: true },
});

export const Alert = model<IAlert>('Alert', alertSchema);
