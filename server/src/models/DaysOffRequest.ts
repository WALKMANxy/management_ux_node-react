import { Schema, model, Document } from "mongoose";

export interface IDayOffRequest extends Document {
  userId: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: "illness" | "day off" | "unexpected event" | "medical visit";
  note?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const dayOffRequestSchema = new Schema<IDayOffRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: {
      type: String,
      enum: ["illness", "day off", "unexpected event", "medical visit"],
      required: true,
    },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
dayOffRequestSchema.index({ userId: 1 });
dayOffRequestSchema.index({ startDate: 1 });
dayOffRequestSchema.index({ endDate: 1 });
dayOffRequestSchema.index({ status: 1 });
dayOffRequestSchema.index({ userId: 1, startDate: 1 }); // Compound index for userId and startDate
dayOffRequestSchema.index({ userId: 1, status: 1 }); // Compound index for userId and status

export const DayOffRequest = model<IDayOffRequest>(
  "DayOffRequest",
  dayOffRequestSchema
);
