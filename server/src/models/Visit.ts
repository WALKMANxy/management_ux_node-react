//src/models/Visit.ts
import { Document, Schema, model } from "mongoose";

export interface IVisit extends Document {
  clientId: string;
  type: string;
  visitReason: string;
  createdAt: Date;
  date: Date;
  notePublic?: string;
  notePrivate?: string;
  pending: boolean;
  completed: boolean;
  visitIssuedBy: string;
}

const visitSchema = new Schema<IVisit>(
  {
    clientId: { type: String },
    type: { type: String, required: true },
    visitReason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    date: { type: Date, required: true },
    notePublic: { type: String },
    notePrivate: { type: String },
    pending: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
    visitIssuedBy: { type: String, required: true },
  },
  { timestamps: true }
);

visitSchema.index({ visitIssuedBy: 1 });

export const Visit = model<IVisit>("Visit", visitSchema);
