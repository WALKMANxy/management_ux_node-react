import { Document, Schema, model } from "mongoose";

export interface IAdmin extends Document {
  id: string;
  name: string;
  email: string;
}

const adminSchema = new Schema<IAdmin>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: false, default: "" },
});

export const Admin = model<IAdmin>("Admin", adminSchema);
