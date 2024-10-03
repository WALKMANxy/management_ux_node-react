// src/models/AdminModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  id: string;
  name: string;
  email: string;
}

const AdminSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

AdminSchema.index({ id: 1 });
AdminSchema.index({ email: 1 });


export default mongoose.model<IAdmin>('Admin', AdminSchema);
