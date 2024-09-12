import { Document, Schema, Types, model } from "mongoose";



export interface IAgent extends Document {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: Types.ObjectId[]; // Reference to Client model
}



const agentSchema = new Schema<IAgent>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  clients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
});

export const Agent = model<IAgent>("Agent", agentSchema);
