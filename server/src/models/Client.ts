//src/models/Client.ts

import { Document, Schema, model } from "mongoose";

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

export const Client = model<IClient>("Client", clientSchema);
