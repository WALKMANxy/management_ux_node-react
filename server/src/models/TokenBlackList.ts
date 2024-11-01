//src/models/TokenBlackList.ts
// Old leftover i don't know we'll need again.
import { Document, Schema, model } from "mongoose";

export interface ITokenBlacklist extends Document {
  tokenHash: string;
  expiresAt: Date;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklist>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = model<ITokenBlacklist>("TokenBlacklist", tokenBlacklistSchema);