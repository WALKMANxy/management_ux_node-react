import { Document, Schema, Types, model } from "mongoose";

export interface IPasscode extends Document {
  userId: Types.ObjectId; // Use Types.ObjectId instead of string
  passcode: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

const passcodeSchema = new Schema<IPasscode>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    passcode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

passcodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically delete expired documents

export const Passcode = model<IPasscode>("Passcode", passcodeSchema);
