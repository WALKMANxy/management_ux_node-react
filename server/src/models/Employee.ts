import { Document, Schema, model } from "mongoose";

// Define the interface for the Employee model
export interface IEmployee extends Document {
  id: string;
  name: string;
  email: string;
}

// Define the schema for the Employee model
const employeeSchema = new Schema<IEmployee>(
  {
    id: { type: String, required: true, index: true }, // Indexed field for better lookup
    name: { type: String, required: true },
    email: { type: String, required: false, default: "" },
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` fields
  }
);

// Create and export the Employee model
export const Employee = model<IEmployee>("Employee", employeeSchema);
