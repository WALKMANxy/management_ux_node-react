import { Schema, model, Document } from 'mongoose';

export interface IVisit extends Document {
  clientId: string;
  agentId: string;
  type: string;
  reason: string;
  createdAt: Date;
  date: Date;
  notePublic?: string;
  notePrivate?: string;
  pending: boolean;
  completed: boolean;
}

const visitSchema = new Schema<IVisit>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    type: { type: String, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    date: { type: Date, required: true },
    notePublic: { type: String },
    notePrivate: { type: String },
    pending: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Visit = model<IVisit>('Visit', visitSchema);
