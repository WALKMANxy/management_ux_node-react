// src/models/AgentModel.ts (Mongoose Schema)
import mongoose, { Document, Schema } from 'mongoose';

export interface IAgent extends Document {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: {
    CODICE: mongoose.Schema.Types.ObjectId; // Reference to Client
    colour?: string; // Optional colour property
  }[];
}

// Reference ClientSchema by CODICE
const ClientReferenceSchema: Schema = new Schema({
  CODICE: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Refers to the Client model by CODICE
  colour: { type: String }, // Optional property
});

const AgentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, sparse: true },
  clients: { type: [ClientReferenceSchema], default: [] },
});

// Indexes for better query performance
AgentSchema.index({ id: 1 });
AgentSchema.index({ email: 1 });

export default mongoose.model<IAgent>('Agent', AgentSchema);
