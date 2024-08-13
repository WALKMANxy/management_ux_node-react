import { Document, Schema, Types, model } from "mongoose";
import { IAlert } from "./Alert";

interface IClient extends Document {
  codice: string;
  ragioneSociale: string;
  ragioneSocialeAgg: string;
  indirizzo: string;
  capComuneProv: string;
  telefono: string;
  email: string;
  emailPec: string;
  partitaIva: string;
  codiceFiscale: string;
  mp: string;
  descizioneMetodoPagamento: string;
  cs: string;
  ag: string;
}

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

const clientSchema = new Schema<IClient>({
  codice: { type: String, required: true },
  ragioneSociale: { type: String, required: true },
  ragioneSocialeAgg: { type: String, required: false },
  indirizzo: { type: String, required: true },
  capComuneProv: { type: String, required: true },
  telefono: { type: String, required: false },
  email: { type: String, required: false },
  emailPec: { type: String, required: false },
  partitaIva: { type: String, required: true },
  codiceFiscale: { type: String, required: false },
  mp: { type: String, required: true },
  descizioneMetodoPagamento: { type: String, required: true },
  cs: { type: String, required: true },
  ag: { type: String, required: true },
});

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
