import { Document, Schema, model } from "mongoose";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true, maxlength: 1024 },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes
sessionSchema.index({ token: 1 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1, token: 1 }, { unique: true });

export const Session = model<ISession>("Session", sessionSchema);