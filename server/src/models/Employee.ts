//src/models/Employee.ts
import { Document, Schema, model } from "mongoose";

export interface IEmployee extends Document {
  id: string;
  name: string;
  email: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: false, default: "" },
  },
  {
    timestamps: true,
  }
);

// Create and export the Employee model
export const Employee = model<IEmployee>("Employee", employeeSchema);
