// src/models/AgentModel.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IClient } from './Client';

export interface IAgent extends Document {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: IClient[]; // Embedded Client subdocuments
}

const ClientSchema: Schema = new Schema({
  CODICE: { type: String, required: true },
  "RAGIONE SOCIALE": { type: String, required: true },
  "RAGIONE SOCIALE AGG.": { type: String },
  INDIRIZZO: { type: String },
  "C.A.P. - COMUNE (PROV.)": { type: String },
  TELEFONO: { type: String },
  EMAIL: { type: String },
  "EMAIL PEC": { type: String },
  "PARTITA IVA": { type: String },
  "CODICE FISCALE": { type: String },
  MP: { type: String },
  "Descizione metodo pagamento": { type: String },
  CS: { type: String },
  AG: { type: String },
});

const AgentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // `sparse` allows multiple documents to have `null`
  phone: { type: String, sparse: true },
  clients: { type: [ClientSchema], default: [] },
});

// Indexes for better query performance
AgentSchema.index({ id: 1 });
AgentSchema.index({ email: 1 });

export default mongoose.model<IAgent>('Agent', AgentSchema);
