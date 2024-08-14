import { Document, Schema, Types, model } from "mongoose";
import { IAlert } from "./Alert";



export interface IAgent extends Document {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: Types.ObjectId[]; // Reference to Client model
  alerts?: IAlert[]; // Add alerts as an array of IAlert
  AgentVisits: Types.ObjectId[]; // Reference to Visit model
  AgentPromos: Types.ObjectId[]; // Reference to Promo model
}



const agentSchema = new Schema<IAgent>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  clients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
  alerts: [{ type: Schema.Types.ObjectId, ref: "Alert" }], // Reference to Alert
  AgentVisits: [{ type: Schema.Types.ObjectId, ref: "Visit" }],
  AgentPromos: [{ type: Schema.Types.ObjectId, ref: "Promo" }],
});

export const Agent = model<IAgent>("Agent", agentSchema);
